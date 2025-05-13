package main

import (
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

// global oauth providers' client config
var (
	githubConfig *oauth2.Config
)

// providers' client parameters
const (
	GithubClientID          = "4dd7d74594e273551935"
	GithubClientSecret      = "4956630d6535e694fcaf04834fa9332a393c72f1"
	GithubClientRedirectURL = "http://47.242.50.237/login"
)

// setup all the oauth client
func setOauthClient() {

	// init github oauth client
	githubConfig = &oauth2.Config{
		ClientID:     GithubClientID,
		ClientSecret: GithubClientSecret,
		RedirectURL:  GithubClientRedirectURL,
		Scopes: []string{
			"user",
		},
		Endpoint: github.Endpoint,
	}
}
