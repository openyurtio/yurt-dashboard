# OpenYurt Docker Extension - Complete Setup Guide

This guide will walk you through building and installing the OpenYurt Docker Extension.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Docker Desktop** 4.8 or higher installed and running
- **Node.js** 16 or higher (for development)
- **Go** 1.21 or higher (for backend)
- **Make** command-line tool

## 🚀 Quick Start (3 Steps)

### Step 1: Build the Extension

From the `install/docker-extension` directory:

```bash
make build-extension
```

This command will:
- Build the Go backend service
- Build the React frontend UI
- Package everything into a Docker extension image named `my/awesome-extension:latest`

### Step 2: Install the Extension

```bash
make install-extension
```

This installs the extension into Docker Desktop.

### Step 3: Open Docker Desktop

1. Launch Docker Desktop
2. Look for **"OpenYurt"** in the left sidebar
3. Click it to see the OpenYurt Services dashboard

## 🎉 What You'll See

The OpenYurt extension provides a beautiful dashboard showing:

- **Service Status Overview**: 7 core OpenYurt services with health indicators
- **Visual Status Icons**: 
  - ✅ Green checkmark = Healthy
  - ⚠️ Orange warning = Needs attention
  - ❌ Red X = Error
- **Service Count**: Shows "5/7" style counter for healthy services
- **Quick Actions**:
  - **Reinstall All** button to reinstall all services
  - **Dashboard** button to open the web interface
- **Alert Messages**: Shows "Some services need attention" when services have issues

### Services Monitored

1. **Yurt Manager** - Node lifecycle & CSR management
2. **YurtHub** - Edge-cloud communication proxy
3. **Raven Agent** - Cross-network connectivity
4. **Kubelet** - Container runtime management
5. **Kube Proxy** - Service load balancing
6. **CoreDNS** - DNS resolution service
7. **Dashboard** - Web management interface

## 🛠️ Development Mode

For faster development with hot reloading:

### Terminal 1: Start React Dev Server

```bash
cd ui
npm install
npm run dev
```

This starts the development server on `http://localhost:3000`.

### Terminal 2: Connect Docker Desktop to Dev Server

```bash
docker extension dev ui-source my/awesome-extension:latest http://localhost:3000
```

Now any changes you make to the UI will automatically reload in Docker Desktop!

### Enable Chrome DevTools (Optional)

```bash
docker extension dev debug my/awesome-extension:latest
```

To disable DevTools:

```bash
docker extension dev reset my/awesome-extension:latest
```

## 🔧 Making Changes

### Updating the UI

1. Edit files in `ui/src/`
2. If in dev mode, changes auto-reload
3. If not in dev mode, rebuild:
   ```bash
   make update-extension
   ```

### Updating the Backend

1. Edit `backend/main.go`
2. Update the extension:
   ```bash
   make update-extension
   ```

### Backend API Endpoints

The backend currently supports:

- `GET /hello` - Health check endpoint
- `GET /services/status` - Returns OpenYurt service status

### Adding New Services

Edit `backend/main.go` and add to the `getServicesStatus` function:

```go
services := []Service{
    // ... existing services ...
    {
        ID:          "my-service",
        Name:        "My Service",
        Description: "My service description",
        Icon:        "custom",
        Status:      "healthy", // or "warning" or "error"
    },
}
```

Then update `ui/src/App.tsx` to include the new service in `initialServices`.

## 🐛 Troubleshooting

### Extension doesn't appear in Docker Desktop

**Check if installed:**
```bash
docker extension ls
```

You should see `my/awesome-extension:latest` in the list.

**Reinstall:**
```bash
make uninstall-extension
make install-extension
```

### Backend connection errors

1. Go to Docker Desktop → **Settings** → **Extensions**
2. Enable **"Show Docker Extensions system containers"**
3. Go to **Containers** tab
4. Find the extension container and view logs

### Build fails

**Ensure Docker Desktop is running:**
```bash
docker ps
```

**Create buildx builder:**
```bash
docker buildx create --use
```

**Clean build:**
```bash
make uninstall-extension
docker rmi my/awesome-extension:latest
make build-extension
make install-extension
```

### UI shows default data instead of backend data

This is normal! The UI has fallback data when the backend is not reachable. To see backend data:

1. Ensure the extension is fully installed (not just dev mode)
2. Check backend logs for errors
3. Verify the socket connection in `docker-compose.yaml`

## 📦 Project Structure

```
install/docker-extension/
├── backend/
│   ├── main.go           # Go backend API
│   └── go.mod
├── ui/
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── components/
│   │   │   ├── ServiceCard.tsx  # Service status card
│   │   │   └── ...
│   │   ├── theme.ts             # MUI theme
│   │   └── index.tsx
│   └── package.json
├── Dockerfile              # Multi-stage build
├── docker-compose.yaml     # Extension services
├── metadata.json           # Extension metadata
├── Makefile               # Build commands
└── README.md
```

## 🧹 Cleanup

### Uninstall the extension:

```bash
make uninstall-extension
```

### Remove the image:

```bash
docker rmi my/awesome-extension:latest
```

## 🎨 Customization

### Change Extension Name

Edit `metadata.json`:

```json
{
  "ui": {
    "dashboard-tab": {
      "title": "Your Custom Name"
    }
  }
}
```

### Change Theme Colors

Edit `ui/src/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#YOUR_COLOR',
    },
  },
});
```

### Modify Service Icons

Edit `ui/src/components/ServiceCard.tsx` and update the `getServiceIcon` function:

```typescript
const iconMap: Record<string, string> = {
  manager: '⚙️',
  hub: '🔗',
  // Add your custom icons
};
```

## 📝 Commands Reference

| Command | Description |
|---------|-------------|
| `make build-extension` | Build the extension image |
| `make install-extension` | Install the extension |
| `make update-extension` | Update an installed extension |
| `make uninstall-extension` | Remove the extension |
| `docker extension ls` | List installed extensions |
| `docker extension dev ui-source <image> <url>` | Use dev server |
| `docker extension dev debug <image>` | Enable DevTools |
| `docker extension dev reset <image>` | Disable DevTools |

## 🚢 Publishing (Optional)

To share your extension:

1. Update `IMAGE` in Makefile to your Docker Hub username:
   ```makefile
   IMAGE?=yourusername/openyurt-extension
   ```

2. Build multi-arch:
   ```bash
   make push-extension
   ```

3. Visit [Docker Extensions Marketplace](https://www.docker.com/products/extensions/submissions/)

## 📚 Resources

- [Docker Extensions SDK Documentation](https://docs.docker.com/desktop/extensions-sdk/)
- [Docker Extension API Reference](https://docs.docker.com/desktop/extensions-sdk/dev/api/reference/)
- [Material-UI Documentation](https://mui.com/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

## 💡 Tips

- Use `docker extension dev ui-source` for faster UI development
- Enable DevTools to debug like a regular web app
- Check backend logs by enabling system containers in Settings
- The UI has fallback data, so it works even without the backend
- Services can have 3 statuses: `healthy`, `warning`, or `error`

## 🎯 Next Steps

1. **Customize the services** - Edit the service list to match your needs
2. **Add real monitoring** - Connect to actual OpenYurt APIs
3. **Enhance the UI** - Add charts, logs, or configuration panels
4. **Add features** - Service restart buttons, log viewing, configuration editing

Enjoy your OpenYurt Docker Extension! 🎉

