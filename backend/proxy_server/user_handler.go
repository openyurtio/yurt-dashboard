/*
 user_handler.go contains user management APIs
*/

package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	UserCreateSuccess = iota
	UserCreated
	UserCreateFailed
	UserGetFailed
	UserGetTimeOut
)

func loginHandler(c *gin.Context) {

	submitUser := &struct {
		MobilePhone string
		Token       string
	}{}
	if err := c.BindJSON(submitUser); err != nil {
		logger.Warn(c.ClientIP(), "login parse paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("login: parse form data fail: %v", err))
		return // parse failed, then abort
	}

	fetchUser, err := client.GetUser(adminKubeConfig, submitUser.MobilePhone)
	if err != nil { // fetch user failed
		logger.Warn(submitUser.MobilePhone, "login get user fail", err.Error())
		JSONErr(c, http.StatusInternalServerError, err.Error())
		return
	}

	// test if user token is valid
	if strings.TrimSpace(fetchUser.Spec.Token) != strings.TrimSpace(submitUser.Token) {
		logger.Warn(submitUser.MobilePhone, "login check password fail", "")
		JSONErr(c, http.StatusBadRequest, "username or password is invalid")
		return
	}

	logger.Info(submitUser.MobilePhone, "login successfully")
	c.JSON(http.StatusOK, fetchUser)
}

func registerHandler(c *gin.Context) {

	userProfile := &client.UserSpec{}
	if err := c.BindJSON(userProfile); err != nil {
		logger.Warn(c.ClientIP(), "register fail: parse paras", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("register: parse form data fail: %v", err))
		return // parse failed, then abort
	}

	// status represents the results of execution
	// backInfo: success->user object; fail->error message
	status, backInfo := registerUser(userProfile)
	if status != UserCreateSuccess {
		if errMsg, isErr := backInfo.(string); isErr {
			JSONErr(c, http.StatusInternalServerError, string(errMsg))
		}
	} else {
		if createdUser, isUser := backInfo.(*client.User); isUser {
			c.JSON(http.StatusOK, createdUser)
		}
	}
}

// extract `registerUser function` which can be reused by githubLogin module
func registerUser(userProfile *client.UserSpec) (int, interface{}) {

	// create user obj
	err := client.CreateUser(adminKubeConfig, userProfile)
	if err != nil {
		var errMsg string
		var registerStatus int
		if kerrors.IsAlreadyExists(err) {
			errMsg = fmt.Sprintf("register: user %s already exist, please use another phonenumber", userProfile.Mobilephone)
			registerStatus = UserCreated
		} else {
			errMsg = fmt.Sprintf("register: create user fail: %v", err)
			registerStatus = UserCreateFailed
		}
		logger.Warn(userProfile.Mobilephone, "register fail: create user", errMsg)
		return registerStatus, errMsg
	}

	// get created user and check its status
	// return only when User resources is all prepared (User.Status.EffectiveTime is not null)
	maxRetry := 30
	for i := 1; i <= maxRetry; i++ {
		createdUser, err := client.GetUser(adminKubeConfig, userProfile.Mobilephone)
		if err != nil {
			logger.Warn(userProfile.Mobilephone, "register fail: check uses status get user fail", err.Error())
			return UserGetFailed, fmt.Sprintf("register: get created user fail: %v", err)
		}

		// all resources has been created, return success
		if createdUser.Status.EffectiveTime != (v1.Time{}) {
			logger.Info(userProfile.Mobilephone, "regist successfully")
			return UserCreateSuccess, createdUser
		}

		time.Sleep(time.Duration(2) * time.Second)
	}

	logger.Warn(userProfile.Mobilephone, "register fail", "check user status exceed maxretry")
	return UserGetTimeOut, "register: get created user fail: exceed maxretry"

}

func fillAdminUserInfo(u *client.User) {
	u.Spec.Mobilephone = "admin"
	u.Spec.KubeConfig = adminKubeConfig
	u.Spec.Namespace = ""
}

func getCurLoginMode() string {
	env := os.Getenv(experienceCenterEnv)
	if env == "1" {
		return "experience_center"
	}
	return "normal"
}

func initEntryInfo(c *gin.Context) {
	entryInfo := &struct {
		Mode      string      `json:"mode"`
		Finish    bool        `json:"finish"`
		UserInfo  client.User `json:"user_info"`
		GuideInfo guideInfo   `json:"guide_info"`
	}{}

	entryInfo.Mode = getCurLoginMode()
	entryInfo.Finish = isGuideFinish()
	if entryInfo.Finish {
		fillAdminUserInfo(&entryInfo.UserInfo)
	} else {
		entryInfo.GuideInfo = getGuideInfo()
	}

	JSONSuccessWithData(c, "", entryInfo)
}
