# Docker Extension UI

This is the frontend React application for the Docker Extension.

## 🛠️ Technology Stack

- **React** 18.2 with TypeScript
- **Material-UI (MUI)** v5 for UI components
- **Docker Extension API Client** for Docker Desktop integration
- **Emotion** for styling

## 📁 Project Structure

```
src/
├── components/
│   ├── BackendStatus.tsx    # Backend connection status card
│   ├── ContainerCard.tsx     # Individual container display card
│   ├── Header.tsx            # Page header with branding
│   └── index.ts              # Component exports
├── App.tsx                   # Main application component
├── index.tsx                 # Application entry point
├── theme.ts                  # Material-UI theme configuration
└── react-app-env.d.ts        # TypeScript definitions
```

## 🚀 Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

This starts the dev server on `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 🎨 Theming

The application uses a dark theme configured in `src/theme.ts`. You can customize:

- Color palette (primary, secondary, background)
- Typography (fonts, sizes, weights)
- Component styles (buttons, cards, etc.)

### Example: Change Primary Color

```typescript
// src/theme.ts
export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5722', // Change to your color
    },
    // ...
  },
});
```

## 🔌 Docker Desktop Integration

The UI uses the Docker Extension API to interact with Docker Desktop:

```typescript
import { createDockerDesktopClient } from '@docker/extension-api-client';

const ddClient = createDockerDesktopClient();

// List containers
const containers = await ddClient.docker.listContainers();

// Call backend API
const result = await ddClient.extension.vm?.service?.get('/hello');
```

## 📦 Components

### Header

Displays the extension branding and title.

```typescript
import { Header } from './components';

<Header />
```

### BackendStatus

Shows backend connection status with refresh capability.

```typescript
<BackendStatus
  message="hello"
  loading={false}
  error=""
  onRefresh={() => {}}
/>
```

### ContainerCard

Displays individual container information.

```typescript
<ContainerCard container={containerData} />
```

## 🧪 Testing

```bash
npm test
```

## 📝 Adding New Features

1. **Create a new component** in `src/components/`
2. **Export it** from `src/components/index.ts`
3. **Import and use** in `App.tsx` or other components

### Example: Adding a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

export const MyComponent: React.FC = () => {
  return (
    <Box>
      <Typography>My Component</Typography>
    </Box>
  );
};

// src/components/index.ts
export { MyComponent } from './MyComponent';

// Use in App.tsx
import { MyComponent } from './components';
```

## 🔧 Configuration

### TypeScript

Configuration in `tsconfig.json`. Strict mode is enabled for type safety.

### Package Management

Using npm with `package-lock.json` for consistent installs.

## 🎯 Key Features

- **Real-time Updates**: Automatically fetches container data
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Material Design principles
- **Type Safety**: Full TypeScript coverage
- **Component-Based**: Reusable, modular components

## 📚 Resources

- [Docker Extension API Docs](https://docs.docker.com/desktop/extensions-sdk/dev/api/reference/)
- [Material-UI Docs](https://mui.com/material-ui/getting-started/)
- [React TypeScript Docs](https://react-typescript-cheatsheet.netlify.app/)

