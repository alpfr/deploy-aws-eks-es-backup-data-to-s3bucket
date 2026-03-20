import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [], 
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    host: true, // Listen on all local IPs
    port: 3000,
    open: true,
    proxy: {
      // Proxy all the routes used by the backend in development
      '^/(auth|organizations|assessments|guardrails|compliance|audit-trail)': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
