import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { lingui } from "@lingui/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: ['@lingui/macro'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
