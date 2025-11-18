# Docker Extension Architecture

This document describes the architecture of the Docker Extension.

## 📐 Overview

The extension follows a client-server architecture with three main components:

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Desktop                        │
│  ┌────────────────────────────────────────────────┐    │
│  │              Frontend (React)                  │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │   Extension UI (port varies)         │     │    │
│  │  │   - Container List                   │     │    │
│  │  │   - Backend Status                   │     │    │
│  │  │   - Docker API Integration          │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓ ↑                             │
│         ┌───────────────┼─┼──────────────────┐         │
│         │   Docker Extension API Client      │         │
│         └───────────────┼─┼──────────────────┘         │
│                         ↓ ↑                             │
│  ┌────────────────────────────────────────────────┐    │
│  │         Backend (Go Service)                   │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │   Unix Socket: backend.sock          │     │    │
│  │  │   Endpoints:                         │     │    │
│  │  │   - GET /hello                       │     │    │
│  │  │   (Extensible for more endpoints)   │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Components

### 1. Frontend (React + TypeScript)

**Location**: `ui/`

**Responsibilities**:
- Render the user interface
- Fetch and display container information
- Communicate with backend via Docker Extension API
- Handle user interactions

**Key Technologies**:
- React 18.2
- TypeScript 4.9
- Material-UI v5
- Docker Extension API Client

**Component Structure**:
```
ui/src/
├── App.tsx                   # Main app logic
├── components/
│   ├── Header.tsx            # Branding header
│   ├── BackendStatus.tsx     # Backend health check
│   ├── ContainerCard.tsx     # Container display
│   └── index.ts              # Exports
├── theme.ts                  # MUI theme
└── index.tsx                 # Entry point
```

### 2. Backend (Go API Service)

**Location**: `backend/`

**Responsibilities**:
- Provide REST API endpoints for the frontend
- Handle business logic
- Can interact with Docker daemon if needed
- Communicate via Unix socket

**Key Technologies**:
- Go 1.21
- Echo web framework
- Logrus for logging

**API Endpoints**:
- `GET /hello` - Health check endpoint

**Communication**:
- Frontend → Backend: Via Unix socket at `/run/guest-services/backend.sock`
- Uses HTTP over Unix domain socket

### 3. Docker Extension Framework

**Configuration Files**:

#### `metadata.json`
Defines extension metadata:
```json
{
  "icon": "docker.svg",
  "vm": {
    "composefile": "docker-compose.yaml",
    "exposes": {
      "socket": "backend.sock"
    }
  },
  "ui": {
    "dashboard-tab": {
      "title": "Dashboard",
      "src": "index.html",
      "root": "ui"
    }
  }
}
```

#### `docker-compose.yaml`
Defines the backend service:
```yaml
services:
  my-extension:
    image: ${DESKTOP_PLUGIN_IMAGE}
```

## 🔄 Data Flow

### Container List Display

1. **User opens extension** in Docker Desktop
2. **Frontend loads** (`App.tsx`)
3. **Frontend calls Docker API**:
   ```typescript
   const containers = await ddClient.docker.listContainers()
   ```
4. **Docker Desktop** returns container list
5. **Frontend renders** container cards

### Backend Health Check

1. **Frontend calls backend**:
   ```typescript
   const result = await ddClient.extension.vm?.service?.get('/hello')
   ```
2. **Request routed** through Docker Extension API
3. **Backend receives** request on Unix socket
4. **Backend responds** with JSON:
   ```json
   {"Message": "hello"}
   ```
5. **Frontend displays** connection status

## 🏗️ Build Process

### Multi-Stage Dockerfile

```dockerfile
# Stage 1: Build Go backend
FROM golang:1.21-alpine AS builder
# Compile Go service

# Stage 2: Build React frontend  
FROM node:21.6-alpine AS client-builder
# npm ci && npm run build

# Stage 3: Combine into final image
FROM alpine
# Copy backend binary
# Copy frontend build
# Copy config files
```

### Build Flow

1. **Go backend compiled** to static binary
2. **React app built** to static HTML/CSS/JS
3. **Files copied** into Alpine image
4. **Extension packaged** as Docker image

## 📦 Installation Flow

1. **Build extension image**:
   ```bash
   docker build -t my/awesome-extension:latest .
   ```

2. **Install in Docker Desktop**:
   ```bash
   docker extension install my/awesome-extension:latest
   ```

3. **Docker Desktop**:
   - Extracts metadata.json
   - Starts backend container (via docker-compose.yaml)
   - Mounts UI files
   - Creates Unix socket
   - Adds tab to dashboard

## 🔐 Security

- **Isolation**: Backend runs in isolated container
- **Unix Socket**: Communication via Unix domain socket (no network exposure)
- **Docker Desktop Integration**: Uses official Docker Extension API
- **No External Network**: Extension operates locally

## 🚀 Extensibility

### Adding Backend Endpoints

1. Edit `backend/main.go`:
   ```go
   router.GET("/new-endpoint", newHandler)
   ```

2. Frontend calls endpoint:
   ```typescript
   await ddClient.extension.vm?.service?.get('/new-endpoint')
   ```

### Adding Frontend Features

1. Create component in `ui/src/components/`
2. Import in `App.tsx`
3. Use Material-UI for consistent styling

### Accessing Docker API

Frontend can access various Docker APIs:
```typescript
// Containers
await ddClient.docker.listContainers()
await ddClient.docker.listImages()

// CLI
await ddClient.docker.cli.exec('ps', ['-a'])

// System
await ddClient.docker.cli.exec('system', ['df'])
```

## 📊 Performance Considerations

- **Static Assets**: Frontend is pre-built and served as static files
- **Efficient Polling**: Use React hooks for data fetching
- **Minimal Backend**: Go backend is lightweight and fast
- **Local Communication**: Unix sockets for low-latency communication

## 🧪 Development Workflow

1. **Make UI changes**: Edit files in `ui/src/`
2. **Hot reload**: `cd ui && npm run dev`
3. **Point extension**: `docker extension dev ui-source ... http://localhost:3000`
4. **Make backend changes**: Edit `backend/main.go`
5. **Rebuild**: `docker extension update my/awesome-extension:latest`

## 📝 Best Practices

1. **Component-based UI**: Keep components small and reusable
2. **Type Safety**: Use TypeScript for frontend
3. **Error Handling**: Handle API errors gracefully
4. **Logging**: Use structured logging in backend
5. **Responsive Design**: Use Material-UI breakpoints
6. **Loading States**: Show loading indicators during async operations

## 🔮 Future Enhancements

Potential improvements:
- Add container start/stop functionality
- Image management features
- Volume and network inspection
- Container logs viewer
- Performance metrics
- Docker Compose file management
- Multi-host support

