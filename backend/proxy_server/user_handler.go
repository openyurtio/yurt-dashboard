/*
 user_handler.go contains user management APIs
*/

package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/client-go/kubernetes"
	clientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	bootstrapapi "k8s.io/cluster-bootstrap/token/api"
	bootstraputil "k8s.io/cluster-bootstrap/token/util"
	bootstraptokenv1 "k8s.io/kubernetes/cmd/kubeadm/app/apis/bootstraptoken/v1"
	tokenphase "k8s.io/kubernetes/cmd/kubeadm/app/phases/bootstraptoken/node"
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

func getUserTokenDesc(user *client.User) string {
	return fmt.Sprintf("Dashboard user: %s", user.Name)
}

func createJoinToken(cs clientset.Interface, user *client.User) (string, error) {
	tokenStr, err := bootstraputil.GenerateBootstrapToken()
	if err != nil {
		return "", errors.Wrap(err, "couldn't generate random token")
	}
	bootstrapToken, err := bootstraptokenv1.NewBootstrapTokenString(tokenStr)
	userValidityPeriod := time.Duration(24*user.Spec.ValidPeriod) * time.Hour
	token := bootstraptokenv1.BootstrapToken{
		Token:       bootstrapToken,
		Description: getUserTokenDesc(user),
		Groups:      []string{"system:bootstrappers:kubeadm:default-node-token"},
		TTL: &metav1.Duration{
			Duration: userValidityPeriod,
		},
		Usages: []string{"authentication", "signing"},
	}

	if err := tokenphase.CreateNewTokens(cs, []bootstraptokenv1.BootstrapToken{token}); err != nil {
		return "", err
	}

	return tokenStr, nil
}

func getTokenInfo(cs clientset.Interface, user *client.User) (string, error) {
	tokenSelector := fields.SelectorFromSet(
		map[string]string{
			"type": string(bootstrapapi.SecretTypeBootstrapToken),
		},
	)
	listOptions := metav1.ListOptions{
		FieldSelector: tokenSelector.String(),
	}

	secrets, err := cs.CoreV1().Secrets(metav1.NamespaceSystem).List(context.TODO(), listOptions)
	if err != nil {
		return "", errors.Wrap(err, "failed to list bootstrap tokens")
	}

	// Find an existing token through the desc field
	for _, secret := range secrets.Items {
		token, err := bootstraptokenv1.BootstrapTokenFromSecret(&secret)
		if err != nil {
			continue
		}

		if token.Description == getUserTokenDesc(user) {
			return bootstraptokenv1.BootstrapTokenString{ID: token.Token.ID, Secret: token.Token.Secret}.String(), nil
		}
	}

	// Not found. Create a new token
	return createJoinToken(cs, user)
}

func getClusterInfo(cs clientset.Interface) (*clientcmdapi.Config, error) {
	insecureClusterInfo, err := cs.CoreV1().ConfigMaps(metav1.NamespacePublic).Get(context.Background(), "cluster-info", metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	kubeconfigStr, ok := insecureClusterInfo.Data["kubeconfig"]
	if !ok || len(kubeconfigStr) == 0 {
		return nil, fmt.Errorf("no kubeconfig in cluster-info configmap of kube-public namespace")
	}

	kubeConfig, err := clientcmd.Load([]byte(kubeconfigStr))
	if err != nil {
		return nil, fmt.Errorf("could not load kube config string, %v", err)
	}

	if len(kubeConfig.Clusters) != 1 {
		return nil, fmt.Errorf("more than one cluster setting in cluster-info configmap")
	}

	return kubeConfig, nil
}

func generateNodeAddScript(user *client.User) error {
	if user.Spec.NodeAddScript == "" {
		restConfig, err := clientcmd.RESTConfigFromKubeConfig([]byte(adminKubeConfig))
		if err != nil {
			return fmt.Errorf("get RestClient from kubeconfig failed: %v", err)
		}

		apiClients, err := kubernetes.NewForConfig(restConfig)
		if err != nil {
			return err
		}

		bootstrapToken, err := getTokenInfo(apiClients, user)
		if err != nil {
			return err
		}
		kubeConfig, err := getClusterInfo(apiClients)
		if err != nil {
			return err
		}
		var server string
		for _, cluster := range kubeConfig.Clusters {
			server = cluster.Server
		}

		joinStr := fmt.Sprintf("wget -P yurtadm https://github.com/openyurtio/openyurt/releases/download/v1.3.4/yurtadm-v1.3.4-linux-amd64.tar.gz; tar -xf yurtadm/yurtadm-v1.3.4-linux-amd64.tar.gz -C yurtadm; yurtadm/linux-amd64/yurtadm join %s --token=%s --node-type=edge --discovery-token-unsafe-skip-ca-verification --v=5",
			strings.TrimPrefix(server, "https://"), bootstrapToken)
		user.Spec.NodeAddScript = joinStr
		user.Spec.Token = bootstrapToken
	}
	return nil
}

func fillAdminUserInfo(u *client.User) {
	u.Name = "admin"
	u.Spec.Mobilephone = "admin"
	u.Spec.KubeConfig = adminKubeConfig
	u.Spec.Namespace = ""
	generateNodeAddScript(u)
}

func getCurLoginMode() string {
	env := os.Getenv(experienceCenterEnv)
	if env == "yes" {
		return "experience_center"
	}
	return "normal"
}

func initEntryInfoHandler(c *gin.Context) {
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
