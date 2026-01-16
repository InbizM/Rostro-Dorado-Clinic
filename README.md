# Rostro Dorado Clinic - Plataforma Web Oficial

Plataforma integral de E-commerce y Servicios para **Rostro Dorado Clinic**, especializada en Medicina Estética en Riohacha, La Guajira.

![Status](https://img.shields.io/badge/Status-Production-green)
![Version](https://img.shields.io/badge/Version-1.2.0-blue)

## 🚀 Tecnologías

El proyecto está construido con un stack moderno y escalable:

### Frontend
- **Framework**: [React 18](https://reactjs.org/) con [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion

### Backend & Infraestructura (Firebase)
- **Hosting**: Firebase Hosting (SPA)
- **Base de Datos**: Cloud Firestore (NoSQL)
- **Autenticación**: Firebase Auth (Google & Email/Password)
- **Almacenamiento**: Firebase Storage (Imágenes de productos/evidencia)
- **Lógica de Servidor**: Firebase Cloud Functions (Node.js 20)

---

## 🔌 Integraciones Clave

### 1. Logística y Envíos (Envioclick)
Integración completa con la API de **Envioclick** para automatizar la logística:
- **Cotización en Tiempo Real**: Cálculo de costos de envío basado en peso (kg) y destino.
- **Generación de Guías**: Creación automática de etiquetas de envío desde el Panel Admin.
- **Rastreo Automático**: Job programado (Cron) que actualiza el estado de los pedidos cada 2 horas.
- **Tracking de Usuario**: Enlaces directos a las páginas de rastreo de las transportadoras (Coordinadora, Interrapidisimo, Servientrega, TCC, Envia).

### 2. Pasarela de Pagos (Wompi)
Implementación de **Wompi** (Bancolombia) para pagos seguros:
- Botón de pagos integrado en el Checkout.
- Soporte para Nequi, PSE, Tarjetas de Crédito y Bancolombia.

### 3. Notificaciones (Brevo / Sendinblue)
Sistema de correos transaccionales vía **Brevo API**:
- Confirmación de Compra (HTML Template con detalles del pedido).
- Envío de Guías de Rastreo.

---

## ✨ Características Principales

### Para Clientes 🛍️
- **Catálogo Dermocosmético**: Filtros por categoría, búsqueda y detalles enriquecidos.
- **Carrito de Compras**: Persistente y optimizado.
- **Perfil de Usuario**: Historial de pedidos, direcciones guardadas.
- **Rastreo de Pedidos**: Visualización de estado en tiempo real y link directo a la transportadora.
- **Chat de Soporte**: Comunicación directa con la clínica.

### Panel Administrativo (CMS) 🛠️
- **Dashboard**: Métricas clave (Ventas, Pedidos).
- **Gestión de Productos**: CRUD completo con carga de imágenes.
- **Gestión de Pedidos**:
    - Cambio de estados (Procesando, Enviado, Completado).
    - **Generación de Guías** con un clic.
    - **Actualización Manual de Tracking** (Botón Refresh).
- **Gestión de Usuarios**: Visualización de clientes registrados.
- **Chat Híbrido**: Consola para responder mensajes de clientes.

### SEO & Performance ⚡
- **Meta Tags**: Optimizados para "Medicina Estética en Riohacha".
- **Open Graph**: Tarjetas enriquecidas para compartir en WhatsApp/Facebook.
- **Schema.org**: Datos estructurados para Google (MedicalOrganization).
- **Favicon**: Configuración multidispositivo.

---

## 📂 Estructura del Proyecto

```bash
/
├── components/          # Componentes React (UI)
│   ├── Admin/          # Vistas del Panel Administrativo
│   ├── Auth/           # Login, Registro, Rutas Protegidas
│   ├── Cart/           # Lógica del Carrito
│   ├── Layout/         # Navbar, Footer, Layouts
│   ├── Profile/        # Perfil de usuario y Pedidos
│   └── ...
├── context/            # Estados Globales (Auth, Cart)
├── functions/          # Backend (Cloud Functions)
│   ├── envioclick.js   # Lógica de envíos
│   ├── tracking.js     # Lógica de rastreo
│   ├── index.js        # Entry point y Triggers
│   └── ...
└── ...
```

## 🛠️ Instalación y Desarrollo

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/InbizM/Rostro-Dorado-Clinic.git
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crear `.env` en la raíz (ver `.env.example`).

4. **Correr en local**:
   ```bash
   npm run dev
   ```

5. **Desplegar a Producción**:
   ```bash
   npm run build
   firebase deploy
   ```
