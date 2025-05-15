/*
logger.go defines a structured logger using zerolog
*/

package main

import (
	"io"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
)

// ServerLogger interface defines the logging methods
type ServerLogger interface {
	Info(user string, action string)
	Warn(user string, action string, info string)
	Error(user string, action string, info string)
	Debug(msg string)
	GinLogger() gin.HandlerFunc
}

// zLogger implements ServerLogger using zerolog
type zLogger struct {
	logger zerolog.Logger
}

func NewZLogger(pretty bool) ServerLogger {
	zerolog.TimeFieldFormat = time.RFC3339

	var output io.Writer = os.Stderr
	if pretty {
		output = zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}
	}

	logger := zerolog.New(output).With().Timestamp().Logger()
	return &zLogger{logger: logger}
}

func (l *zLogger) Info(user, action string) {
	l.logger.Info().
		Str("user", user).
		Str("action", action).
		Send()
}

func (l *zLogger) Warn(user, action, info string) {
	l.logger.Warn().
		Str("user", user).
		Str("action", action).
		Str("info", info).
		Send()
}

func (l *zLogger) Error(user, action, info string) {
	l.logger.Error().
		Str("user", user).
		Str("action", action).
		Str("info", info).
		Send()
}

func (l *zLogger) Debug(msg string) {
	l.logger.Debug().Msg(msg)
}

// GinLogger returns a gin.HandlerFunc for request and error logging
func (l *zLogger) GinLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Handle errors if any
		if !c.Writer.Written() && len(c.Errors) > 0 {
			json := c.Errors.JSON()
			if json != nil {
				c.JSON(-1, json)
			}
		}

		// Log request details
		latency := time.Since(start)
		if raw != "" {
			path = path + "?" + raw
		}

		msg := c.Errors.String()
		if msg == "" {
			msg = "Request"
		}

		// Create log event with common fields
		event := l.logger.With().
			Str("method", c.Request.Method).
			Str("path", path).
			Dur("latency", latency).
			Int("status", c.Writer.Status()).
			Str("client_ip", c.ClientIP())

		// Log based on status code
		logger := event.Logger()
		switch {
		case c.Writer.Status() >= 500:
			logger.Error().Msg(msg)
		case c.Writer.Status() >= 400:
			logger.Warn().Msg(msg)
		default:
			logger.Info().Msg(msg)
		}
	}
}
