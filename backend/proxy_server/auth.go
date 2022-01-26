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
	GithubClientSecret      = "188cbe058b6bfeeb856f4962806e72342e2da3d9"
	GithubClientRedirectURL = "http://106.14.177.57/login"
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
