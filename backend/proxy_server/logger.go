/*
 logger.go defines a logger used to record server behavior
*/

package main

import (
	"fmt"
	"io"
	"log"
)

type ServerLogger interface {
	Init(writer io.Writer)

	// used to record server behavior
	// seperated by info levels

	// trascational info
	Info(user string, action string)
	// expected anomaly info, can be recovered automatically
	Warn(user string, action string, info string)
	// unexpected error info
	Error(user string, action string, info string)

	// used for developers to trace bugs
	Debug(msg string)
}

// baseLogger implement Logger based on `log` package
type baseLogger struct {
	// info_logger is used to print transactional information
	info_logger *log.Logger
	// debug_logger is different with info_logger to print file&line info to trace bugs
	debug_logger *log.Logger
}

func (l *baseLogger) Init(writer io.Writer) {
	l.info_logger = log.New(writer, "[Server] ", log.LstdFlags)
	l.debug_logger = log.New(writer, "[Server] ", log.Lshortfile|log.LstdFlags)
}

func (l *baseLogger) print_format(user, action, info, level string) string {
	var line string
	if info == "" {
		line = fmt.Sprintf("User: %s, Action: %s [%s]", user, action, level)
	} else {
		line = fmt.Sprintf("User: %s, Action: %s, Info: %s [%s]", user, action, info, level)
	}
	return line
}

func (l *baseLogger) Info(user, msg string) {
	l.info_logger.Println(l.print_format(user, msg, "", "INFO"))
}

func (l *baseLogger) debug_println(msg string) {
	// set call_depth = 4 to trace original error line
	l.debug_logger.Output(4, msg)
}

func (l *baseLogger) Debug(msg string) {
	l.debug_println(fmt.Sprintf("%s [DEBUG]", msg))
}

func (l *baseLogger) Warn(user, action, info string) {
	l.debug_println(l.print_format(user, action, info, "WARN"))
}

func (l *baseLogger) Error(user, action, info string) {
	l.debug_println(l.print_format(user, action, info, "ERROR"))
}
