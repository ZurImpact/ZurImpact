import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// Determine API target: mock server (default) or backend
// eslint-disable-next-line no-constant-condition
const API_TARGET = true ? 'http://localhost:8080' : 'http://localhost:4000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Fixed Vite dev server port
    proxy: {
      '/backend_war_exploded/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
});
