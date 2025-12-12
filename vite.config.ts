import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Cambiamos 'base' a '/' para que funcione en cualquier dominio que Easypanel te asigne
  base: '/',
  server: {
    host: true, 
    port: 3000,
    // Permite que el servidor responda a estos dominios
    allowedHosts: ['rostrodorado.site', 'www.rostrodorado.site', 'localhost']
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ['rostrodorado.site', 'www.rostrodorado.site', 'localhost']
  }
});