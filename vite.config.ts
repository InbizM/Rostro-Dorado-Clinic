import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Definimos la URL base de producción como solicitaste para asegurar que los assets se expongan correctamente
  base: 'https://rostro-dorado-clinic-avance.onrender.com/',
  server: {
    host: true, // Permite que el servidor sea accesible externamente (0.0.0.0)
    port: 10000,
  },
  preview: {
    host: true,
    port: 10000,
  }
});