import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// API proxy target:
// - real backend (Tomcat) on :8080 by default
// - mock server on :4000 when `VITE_USE_MOCK=1` (set by `yarn dev:mock`)
const API_TARGET = process.env.VITE_USE_MOCK === '1' ? 'http://localhost:4000' : 'http://localhost:8080';

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
