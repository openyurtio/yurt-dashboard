
# Setting SHELL to bash allows bash commands to be executed by recipes.
# This is a requirement for 'setup-envtest.sh' in the test target.
# Options are set to exit when a recipe line exits non-zero or a piped command fails.
SHELL = /usr/bin/env bash -o pipefail
.SHELLFLAGS = -ec

REPO ?= openyurt
IMAGE_TAG ?= latest
TARGETPLATFORM ?= linux/amd64

DASHBOARD_IMG ?= ${REPO}/yurt-dashboard:${IMAGE_TAG}

DOCKER_BUILD_GO_PROXY_ARG ?= GO_PROXY=https://goproxy.cn,direct


docker-build:
	docker buildx build --load \
	-f Dockerfile . -t ${DASHBOARD_IMG} \
	--platform ${TARGETPLATFORM} --build-arg ${DOCKER_BUILD_GO_PROXY_ARG}

docker-push:
	docker push ${DASHBOARD_IMG}
