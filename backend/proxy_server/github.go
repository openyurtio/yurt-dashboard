package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/oauth2"
)

type githubUser struct {
	Login             string `json:"login"`
	ID                int    `json:"id"`
	NodeID            string `json:"node_id"`
	AvatarURL         string `json:"avatar_url"`
	GravatarID        string `json:"gravatar_id"`
	URL               string `json:"url"`
	HTML_URL          string `json:"html_url"`
	FollowersURL      string `json:"followers_url"`
	FollowingURL      string `json:"following_url"`
	GistsURL          string `json:"gists_url"`
	StarredURL        string `json:"starred_url"`
	SubscriptionsURL  string `json:"subscriptions_url"`
	OrganizationsURL  string `json:"organizations_url"`
	ReposURL          string `json:"repos_url"`
	EventsURL         string `json:"events_url"`
	ReceivedEventsURL string `json:"received_events_url"`
	Type              string `json:"type"`
	SiteAdmin         bool   `json:"site_admin"`
	Name              string `json:"name"`
	Company           string `json:"company"`
	Blog              string `json:"blog"`
	Location          string `json:"location"`
	Email             string `json:"email"`
	Hireable          bool   `json:"hireable"`
	Bio               string `json:"bio"`
	TwitterUserName   string `json:"twitter_username"`
	PublicRepos       int    `json:"public_repos"`
	PublicGists       int    `json:"public_gits"`
	Followers         int    `json:"followers"`
	Following         int    `json:"following"`
	CreatedAt         string `json:"created_at"`
	UpdatedAt         string `json:"updated_at"`
}

// deal with github user login
func githubLoginHandler(c *gin.Context) {

	postCode := &struct{ Code string }{
		Code: "",
	}
	if err := c.BindJSON(postCode); err != nil {
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("login: get authorization code fail: %v", err))
		return
	}

	// exchange authorization code to token
	token, err := githubConfig.Exchange(c, postCode.Code)
	if err != nil {
		logger.Warn("", "exchange code to token fail:", err.Error())
		JSONErr(c, http.StatusInternalServerError, err.Error())
		return
	}
	if token == nil {
		logger.Warn("", "get token fail", "get nil token")
		JSONErr(c, http.StatusInternalServerError, "get nil token")
		return
	}

	githubUserInfo, errMsg := getUserGithubInfo(token)
	if githubUserInfo == nil {
		logger.Warn("", "get github user info fail", errMsg)
		JSONErr(c, http.StatusInternalServerError, "get github user info fail")
		return
	}

	localUser, errMsg := getLocalUser(githubUserInfo)
	if localUser == nil {
		logger.Warn("", "get local user info fail", errMsg)
		JSONErr(c, http.StatusInternalServerError, "get local user info fail")
		return
	}
	c.JSON(http.StatusOK, localUser)
}

// get userinfo from api.github.com/user
func getUserGithubInfo(token *oauth2.Token) (*githubUser, string) {

	httpClient := githubConfig.Client(context.TODO(), token)
	userInfo, err := httpClient.Get("https://api.github.com/user")

	if err != nil {
		return nil, err.Error()
	}

	defer userInfo.Body.Close()

	info, err := ioutil.ReadAll(userInfo.Body)
	if err != nil {
		return nil, err.Error()
	}

	var githubUserInfo githubUser
	err = json.Unmarshal(info, &githubUserInfo)
	if err != nil {
		return nil, err.Error()
	}

	return &githubUserInfo, "get github user info success"
}

// get local user info: if user does not exist then register, otherwise get user info
func getLocalUser(githubUser *githubUser) (*client.User, string) {

	userProfile := &client.UserSpec{}
	if githubUser.Email != "" {
		userProfile.Email = githubUser.Email
	} else {
		userProfile.Email = "Null Email"
	}
	if githubUser.Company != "" {
		userProfile.Organization = githubUser.Company
	} else {
		userProfile.Organization = "Null organization"
	}
	userProfile.Mobilephone = strconv.Itoa(githubUser.ID)

	status, backInfo := registerUser(userProfile)

	var fetchUser *client.User
	var err error

	if status != UserCreated && status != UserCreateSuccess {
		if errMsg, isErr := backInfo.(string); isErr {
			return nil, string(errMsg)
		}
	} else {
		fetchUser, err = client.GetUser(adminKubeConfig, userProfile.Mobilephone)
		if err != nil {
			return nil, err.Error()
		}
	}

	return fetchUser, "get local user success"
}
