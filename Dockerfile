FROM --platform=$TARGETPLATFORM golang:1.18 as builder

ENV GOPROXY https://goproxy.cn,direct
WORKDIR /workspace

COPY backend/ /workspace

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -mod readonly -a  -o apiserver ./proxy_server/

##Build ui
FROM --platform=$BUILDPLATFORM node:14.17.6-alpine3.14 as build-ui

#RUN apk update && apk add bash

WORKDIR /workspace

COPY frontend/public public
COPY frontend/src src
COPY frontend/package.json .

RUN npm install
RUN npm run build

FROM --platform=$TARGETPLATFORM centos:7
# FROM alpine:3.12.0

WORKDIR /openyurt/backend/

COPY --from=builder /workspace/config config
COPY --from=builder /workspace/apiserver .
COPY --from=builder /workspace/scripts/pod_start.sh pod_start.sh
RUN chmod +x pod_start.sh
RUN chmod +x apiserver

COPY --from=build-ui /workspace/build ../../frontend/build

CMD [ "sh", "-c", "./pod_start.sh"]