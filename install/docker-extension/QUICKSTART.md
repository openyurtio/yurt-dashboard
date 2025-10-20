# Quick Start Guide

This guide will help you build and run your Docker extension in minutes.

## Prerequisites

- Docker Desktop 4.8+ installed and running
- Node.js 16+ (for local development)
- Go 1.21+ (for backend development)

## 🚀 Build and Install in 3 Steps

### Step 1: Build the Extension

```bash
cd my-extension
make build-extension
```

This will:
- Build the Go backend
- Build the React frontend
- Package everything into a Docker extension image

### Step 2: Install the Extension

```bash
make install-extension
```

### Step 3: Open Docker Desktop

1. Open Docker Desktop
2. Look for the new "Dashboard" tab in the left sidebar
3. Click it to see your extension!

## 🎉 What You Should See

Your extension displays:
- **Backend Connection Status**: Shows if the Go backend is connected
- **Container List**: All your running and stopped Docker containers
- **Container Details**: Status, image, ID for each container

## 🛠️ Development Mode (Optional)

For faster development with hot reload:

```bash
# Terminal 1: Start the React dev server
cd ui
npm install
npm run dev

# Terminal 2: Point Docker Desktop to dev server
docker extension dev ui-source my/awesome-extension:latest http://localhost:3000
```

Now changes to the UI will reload automatically!

## 🧹 Uninstall

```bash
make uninstall-extension
```

## ❓ Troubleshooting

### Extension doesn't appear in Docker Desktop
- Check it's installed: `docker extension ls`
- Try reinstalling: `make uninstall-extension && make install-extension`

### Backend connection error
- Check backend logs: Enable "Show Docker Extensions system containers" in Docker Desktop Settings
- Look for the extension container and view its logs

### Build fails
- Ensure Docker Desktop is running
- Check you're in the `my-extension` directory
- Try: `docker buildx create --use`

## 📖 Next Steps

- Customize the UI in `ui/src/App.tsx`
- Add backend endpoints in `backend/main.go`
- Change the theme in `ui/src/theme.ts`
- Read the full [README.md](README.md) for more details

