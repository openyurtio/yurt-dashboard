#!/bin/bash

# stop server 
kill -s 9 $(lsof -i:80 | grep LISTEN | awk '{print $2}')

# start server 
cd ../proxy_server/ && nohup go run . &> server.log &
