FROM golang:1.21-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY backend/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY backend/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:21.6-alpine3.18 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="OpenYurt Dashboard Extension" \
    org.opencontainers.image.description="Monitor and manage OpenYurt services from Docker Desktop" \
    org.opencontainers.image.vendor="OpenYurt" \
    com.docker.desktop.extension.api.version="0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="docker.svg" \
    com.docker.extension.detailed-description="A beautiful Docker extension for monitoring OpenYurt services including Yurt Manager, YurtHub, Raven Agent, Kubelet, Kube Proxy, CoreDNS, and Dashboard with real-time health status" \
    com.docker.extension.publisher-url="https://openyurt.io" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.categories="kubernetes,utility,monitoring" \
    com.docker.extension.changelog="Initial release with service monitoring dashboard and one-click installation"

# Install required tools
RUN apk add --no-cache \
    curl \
    ca-certificates \
    bash \
    git

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/

# Install helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/backend.sock
