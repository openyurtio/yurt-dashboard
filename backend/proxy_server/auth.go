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
	GithubClientID          = "4e5058f5e68e11b91193"
	GithubClientSecret      = "f3833030e760214e349eff5fc360bd655ffb73e1"
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