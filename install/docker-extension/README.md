# Docker Dashboard Extension

A modern, beautiful Docker extension for monitoring and managing your Docker containers with an intuitive UI.

## 🚀 Features

- **Real-time Container Monitoring**: View all your Docker containers at a glance
- **Beautiful Modern UI**: Built with React, TypeScript, and Material-UI
- **Backend API**: Go-based backend service for extended functionality
- **Container Details**: See container status, images, IDs, and more
- **Responsive Design**: Works seamlessly in Docker Desktop

## 🏗️ Architecture

This extension is composed of:

- **Frontend**: React + TypeScript app with Material-UI components that displays Docker container information and communicates with the backend
- **Backend**: Go-based API service that exposes the `/hello` endpoint for health checks and can be extended with additional endpoints
- **Docker Integration**: Uses Docker Extension API to interact with Docker Desktop

## 📦 Installation & Usage

### Quick Start

1. **Build the extension**:
   ```bash
   make build-extension
   ```
   
   Or using Docker directly:
   ```bash
   docker buildx build -t my/awesome-extension:latest . --load
   ```

2. **Install the extension**:
   ```bash
   make install-extension
   ```
   
   Or using Docker directly:
   ```bash
   docker extension install my/awesome-extension:latest
   ```

3. **Open Docker Desktop** and you'll see a new "Dashboard" tab in the left sidebar

### Verify Installation

Check that the extension is installed:
```bash
docker extension ls
```

You should see `my/awesome-extension:latest` in the list.

## 🛠️ Development

### Frontend Development with Hot Reload

For faster development, use hot reloading to see changes without rebuilding:

1. **Install dependencies and start dev server**:
   ```bash
   cd ui
   npm install
   npm run dev
   ```
   
   This starts a development server on `http://localhost:3000`

2. **Point Docker Desktop to your dev server**:
   ```bash
   docker extension dev ui-source my/awesome-extension:latest http://localhost:3000
   ```

3. **Enable Chrome DevTools** (optional):
   ```bash
   docker extension dev debug my/awesome-extension:latest
   ```
   
   To disable:
   ```bash
   docker extension dev reset my/awesome-extension:latest
   ```

### Project Structure

```
my-extension/
├── ui/                      # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── index.tsx       # Entry point
│   │   └── theme.ts        # Material-UI theme
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Go backend
│   ├── main.go             # API service
│   └── go.mod
├── Dockerfile              # Multi-stage build
├── docker-compose.yaml     # Extension service definition
├── metadata.json           # Extension metadata
├── docker.svg              # Extension icon
└── Makefile               # Build commands
```

### Backend Development

The backend is a Go API service that runs in a container and communicates with the frontend via a Unix socket.

**Making changes to the backend**:

1. Modify the code in `backend/main.go`
2. Update the extension:
   ```bash
   make update-extension
   ```
   
   Or:
   ```bash
   docker extension update my/awesome-extension:latest -f
   ```

**View backend logs**:

Extension containers are hidden by default. To see them:
1. Go to Docker Desktop **Settings > Extensions**
2. Enable **"Show Docker Extensions system containers"**
3. View logs in the Containers tab

### Adding New Backend Endpoints

Edit `backend/main.go` and add new routes:

```go
router.GET("/your-endpoint", yourHandler)

func yourHandler(ctx echo.Context) error {
    return ctx.JSON(http.StatusOK, YourResponse{Data: "value"})
}
```

Then call from the frontend:

```typescript
const result = await ddClient.extension.vm?.service?.get('/your-endpoint');
```

## 🧹 Clean Up

Remove the extension:
```bash
docker extension rm my/awesome-extension:latest
```

Or use the Makefile:
```bash
make uninstall-extension
```

## 🎨 Customization

### Change the Theme

Edit `ui/src/theme.ts` to customize colors, typography, and component styles.

### Modify the UI

The main application is in `ui/src/App.tsx`. It uses Material-UI components for a modern, responsive design.

### Update Extension Metadata

Edit `metadata.json` to change:
- Extension name and title
- Icon
- Tab name in Docker Desktop

## 📚 Resources

- [Docker Extensions SDK Documentation](https://docs.docker.com/desktop/extensions-sdk/)
- [Docker Extension API Reference](https://docs.docker.com/desktop/extensions-sdk/dev/api/reference/)
- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://react.dev/)

## 🚀 Publishing

To publish your extension to the Docker Marketplace:
1. Visit [Docker Extensions Submissions](https://www.docker.com/products/extensions/submissions/)
2. Follow the submission guidelines
3. Share your extension with the community!

## 📝 License

This extension is provided as-is for development and educational purposes.
