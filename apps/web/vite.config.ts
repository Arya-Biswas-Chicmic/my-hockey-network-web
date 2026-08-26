import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
    hmr: process.env.VITE_HMR_CLIENT_PORT
      ? { clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) }
      : true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/v1': {
        target: process.env.VITE_PROXY_TARGET || 'https://my-hockey-network.onrender.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@my-hockey-network/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@my-hockey-network/constants': path.resolve(__dirname, '../../packages/constants/src/index.ts'),
      '@my-hockey-network/design-system': path.resolve(__dirname, '../../packages/design-system/src/index.ts'),
      '@my-hockey-network/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@my-hockey-network/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@my-hockey-network/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@my-hockey-network/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
