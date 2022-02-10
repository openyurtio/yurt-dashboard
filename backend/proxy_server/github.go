package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
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

	token, err := getOauthToken(githubConfig, postCode.Code)
	if token == nil || token.AccessToken == "" {
		logger.Warn(c.ClientIP(), "get token fail", err.Error())
		JSONErr(c, http.StatusInternalServerError, err.Error())
		return
	}

	githubUserInfo, err := getUserGithubInfo(token)
	if githubUserInfo == nil {
		logger.Warn("", "get github user info fail", err.Error())
		JSONErr(c, http.StatusInternalServerError, "get github user info fail")
		return
	}

	localUser, err := getLocalUser(githubUserInfo)
	if localUser == nil {
		logger.Warn("", "get local user info fail", err.Error())
		JSONErr(c, http.StatusInternalServerError, "get local user info fail")
		return
	}
	c.JSON(http.StatusOK, localUser)
}

// exchange authorization code to token
func getOauthToken(githubconfig *oauth2.Config, code string) (*oauth2.Token, error) {

	var token *oauth2.Token

	reqURL := "https://github.com/login/oauth/access_token?" + "client_id=" +
		githubconfig.ClientID + "&client_secret=" + githubconfig.ClientSecret +
		"&code=" + code
	req, err := http.NewRequest(http.MethodPost, reqURL, nil)
	if err != nil {
		return nil, errors.New("internal error, please try again")
	}
	req.Header.Set("accept", "application/json")

	httpClient := http.Client{Timeout: 5 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, errors.New("get token failed, please try again")
	}

	err = json.NewDecoder(resp.Body).Decode(token)
	if err != nil {
		return nil, errors.New("get token failed, please try again")
	}
	return token, errors.New("exchange token success")

}

// get userinfo from api.github.com/user
func getUserGithubInfo(token *oauth2.Token) (*githubUser, error) {

	httpClient := githubConfig.Client(context.TODO(), token)
	userInfo, err := httpClient.Get("https://api.github.com/user")

	if err != nil {
		return nil, err
	}

	defer userInfo.Body.Close()

	info, err := ioutil.ReadAll(userInfo.Body)
	if err != nil {
		return nil, err
	}

	var githubUserInfo githubUser
	err = json.Unmarshal(info, &githubUserInfo)
	if err != nil {
		return nil, err
	}

	return &githubUserInfo, errors.New("get github user info success")
}

// get local user info: if user does not exist then register, otherwise get user info
func getLocalUser(githubUser *githubUser) (*client.User, error) {

	userProfile := &client.UserSpec{}
	userProfile.Email = githubUser.Email
	userProfile.Organization = githubUser.Company
	userProfile.Mobilephone = strconv.Itoa(githubUser.ID)

	status, backInfo := registerUser(userProfile)

	var fetchUser *client.User
	var err error

	if status != UserCreated && status != UserCreateSuccess {
		if errMsg, isErr := backInfo.(string); isErr {
			return nil, errors.New(errMsg)
		}
	} else {
		fetchUser, err = client.GetUser(adminKubeConfig, userProfile.Mobilephone)
		if err != nil {
			return nil, err
		}
	}

	return fetchUser, errors.New("get local user success")
}
