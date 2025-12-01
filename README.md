# 🎯 MBV - Plataforma de Verificación Facial

Plataforma web que permite a los usuarios ver videos y ganar puntos mediante verificación facial en tiempo real. Los usuarios deben mantener su rostro visible durante al menos el 90% del video para acumular puntos que pueden canjear por recompensas.

## 🚀 Características Principales

- ✅ **Registro y Login con Verificación Facial**: Autenticación biométrica usando face-api.js
- 🎥 **Reproducción de Videos con Detección en Tiempo Real**: Valida que el usuario esté viendo el video
- 🏆 **Sistema de Puntos y Recompensas**: Gana puntos al completar videos y canjéalos por premios
- 🔒 **Seguridad**: Autenticación JWT, hashing de contraseñas, almacenamiento de descriptores faciales
- 📊 **Tracking Preciso**: Calcula el porcentaje exacto de tiempo visto con rostro visible

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** con **Mongoose**
- **JWT** para autenticación
- **bcryptjs** para hashing de contraseñas

### Frontend
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS v4** para estilos
- **face-api.js** para detección facial
- **react-webcam** para acceso a cámara
- **axios** para peticiones HTTP
- **react-hot-toast** para notificaciones
- **canvas-confetti** para celebraciones

## 📋 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** >= 6.x (local o Atlas)
- **Navegador moderno** con soporte para WebRTC (Chrome, Firefox, Edge)
- **Cámara web** funcional

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/joseberna/poc-faceid
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MongoDB

# Poblar base de datos
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Descargar modelos de IA
chmod +x download-models.sh
./download-models.sh

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

### 4. Acceder a la Aplicación

1. Abre `http://localhost:5173` en tu navegador
2. Haz clic en "Register" para crear una cuenta
3. Permite el acceso a la cámara cuando se solicite
4. Captura tu rostro para el registro
5. Inicia sesión con verificación facial
6. ¡Empieza a ver videos y ganar puntos!

## 📁 Estructura del Proyecto

```
src/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración (DB, etc.)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Modelos de Mongoose
│   │   ├── routes/         # Rutas de API
│   │   ├── middleware/     # Middleware (auth, etc.)
│   │   ├── utils/          # Utilidades (Logger)
│   │   ├── app.ts          # Configuración de Express
│   │   ├── server.ts       # Punto de entrada
│   │   └── seed.ts         # Script de población de DB
│   ├── .env                # Variables de entorno
│   └── package.json
│
└── frontend/               # Aplicación React
    ├── public/
    │   ├── models/         # Modelos de face-api.js
    │   └── videos/         # Videos locales
    ├── src/
    │   ├── pages/          # Páginas (Login, Register, Dashboard, etc.)
    │   ├── services/       # Servicios (faceService, etc.)
    │   ├── utils/          # Utilidades (Logger)
    │   ├── App.tsx         # Componente principal
    │   └── main.tsx        # Punto de entrada
    ├── .env                # Variables de entorno
    └── package.json
```

## 🔧 Variables de Entorno

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mimejorversion
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## 📦 Build para Producción

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Los archivos estarán en dist/
```

## 🎮 Uso de la Aplicación

### Registro
1. Haz clic en "Register"
2. Completa el formulario (nombre, email, contraseña)
3. Permite acceso a la cámara
4. Captura tu rostro cuando esté centrado
5. El sistema guardará tu descriptor facial

### Login
1. Ingresa tu email
2. Permite acceso a la cámara
3. El sistema verificará que tu rostro coincida con el registrado
4. Accederás al dashboard

### Ver Videos
1. En el dashboard, selecciona un video
2. Haz clic en Play
3. Mantén tu rostro visible durante el video
4. Si el sistema no detecta tu rostro, el video se pausará
5. Al completar el 90% del video con tu rostro visible, ganarás puntos

### Canjear Recompensas
1. Ve a la sección "Rewards"
2. Selecciona una recompensa
3. Si tienes suficientes puntos, podrás canjearla

## 🐛 Solución de Problemas

### La cámara no funciona
- Asegúrate de permitir el acceso a la cámara en tu navegador
- Verifica que ninguna otra aplicación esté usando la cámara
- Usa HTTPS o localhost (WebRTC requiere conexión segura)

### No detecta mi rostro
- Asegúrate de tener buena iluminación
- Mantén tu rostro centrado en la cámara
- Quítate gafas oscuras o máscaras
- Mantén una distancia de 60-80cm de la pantalla

### Error al cargar modelos de IA
- Ejecuta `./download-models.sh` en la carpeta frontend
- Verifica que los archivos estén en `public/models/`
- Recarga la página

### Error de conexión al backend
- Verifica que el backend esté corriendo en el puerto 3000
- Verifica que MongoDB esté corriendo
- Revisa las variables de entorno

## 📝 Scripts Disponibles

### Backend
- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia servidor en producción
- `npm run seed` - Pobla la base de datos

### Frontend
- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Preview del build de producción

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT expiran en 7 días
- Solo se almacenan descriptores faciales (no imágenes)
- Validación de identidad en login y durante reproducción
- CORS configurado para dominios específicos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

- **Jose Berna** - Desarrollo inicial

## 🙏 Agradecimientos

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) por la detección facial
- [TinyFaceDetector](https://github.com/justadudewhohacks/face-api.js#face-detection) por el modelo ligero
