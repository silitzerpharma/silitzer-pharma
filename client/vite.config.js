import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // or '0.0.0.0' to allow network access
    port: 5173, // optional: set a fixed port if needed
  },
});
