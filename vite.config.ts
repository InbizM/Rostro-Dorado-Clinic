import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // URL base para producción
  base: 'https://rostro-dorado-clinic-avance.onrender.com/',
  server: {
    host: true, 
    port: 10000,
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: ['rostro-dorado-clinic-avance.onrender.com']
  }
});