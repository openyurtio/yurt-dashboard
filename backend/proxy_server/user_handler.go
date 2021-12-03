/*
 user_handler.go contains user management APIs
*/

package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func loginHandler(c *gin.Context) {

	submitUser := &struct {
		MobilePhone string
		Token       string
	}{}
	if err := c.BindJSON(submitUser); err != nil {
		return // parse failed, then abort
	}

	fetchUser, err := client.GetUser(adminKubeConfig, submitUser.MobilePhone)
	if err != nil { // fetch user failed
		JSONErr(c, http.StatusInternalServerError, err.Error())
		return
	}

	// test if user token is valid
	if strings.TrimSpace(fetchUser.Spec.Token) != strings.TrimSpace(submitUser.Token) {
		JSONErr(c, http.StatusBadRequest, "username or password is invalid")
		return
	}

	c.JSON(http.StatusOK, fetchUser)
}

func registerHandler(c *gin.Context) {

	userProfile := &client.UserSpec{}
	if err := c.BindJSON(userProfile); err != nil {
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("register: parse form data fail: %v", err))
		return // parse failed, then abort
	}

	// create user obj
	err := client.CreateUser(adminKubeConfig, userProfile)
	if err != nil {
		var err_msg string
		if kerrors.IsAlreadyExists(err) {
			err_msg = "register: user already exist, please use another phonenumber"
		} else {
			err_msg = fmt.Sprintf("register: create user fail: %v", err)
		}
		JSONErr(c, http.StatusInternalServerError, err_msg)
		return
	}

	// get created user and check its status
	// return only when User resources is all prepared (User.Status.EffectiveTime is not null)
	maxRetry := 30
	for i := 1; i <= maxRetry; i++ {
		createdUser, err := client.GetUser(adminKubeConfig, userProfile.Mobilephone)
		if err != nil {
			JSONErr(c, http.StatusInternalServerError, fmt.Sprintf("register: get created user fail: %v", err))
			return
		}

		// all resources has been created, return success
		if createdUser.Status.EffectiveTime != (v1.Time{}) {
			c.JSON(http.StatusOK, createdUser)
			return
		}

		time.Sleep(time.Duration(2) * time.Second)
	}

	JSONErr(c, http.StatusInternalServerError, "register: get created user fail: exceed maxretry")

}
