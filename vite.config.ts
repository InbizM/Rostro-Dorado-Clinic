import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Cambiamos 'base' a '/' para que funcione en cualquier dominio que Easypanel te asigne
  base: '/',
  server: {
    host: true, 
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000
  }
});