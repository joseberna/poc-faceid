# 🔧 Backend - MiMejorVersion API

API REST construida con Node.js, Express y MongoDB para la plataforma de verificación facial.

## 🚀 Tecnologías

- **Node.js** 18+
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas

## 📋 Requisitos

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x (local o MongoDB Atlas)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Puerto del servidor
PORT=3000

# Entorno (development | production)
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mimejorversion
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mimejorversion

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🗄️ Base de Datos

### Poblar la Base de Datos

```bash
npm run seed
```

Esto creará:
- Usuario admin (admin@example.com / admin123)
- 2 videos de prueba (spider.mp4, wisbtc.mp4)
- 3 recompensas de ejemplo

### Modelos de Datos

#### User
```typescript
{
  fullName: string
  email: string (unique)
  password: string (hashed)
  faceDescriptor: number[] (128 dimensiones)
  points: number (default: 0)
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}
```

#### Video
```typescript
{
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number (segundos)
  points: number
  active: boolean
  createdAt: Date
}
```

#### History
```typescript
{
  userId: ObjectId
  videoId: ObjectId
  watchedAt: Date
  completed: boolean
  pointsEarned: number
  validFace: boolean
}
```

#### Reward
```typescript
{
  name: string
  description: string
  imageUrl: string
  cost: number (puntos)
  active: boolean
  createdAt: Date
}
```

#### Redemption
```typescript
{
  userId: ObjectId
  rewardId: ObjectId
  redeemedAt: Date
  cost: number
}
```

## 🚀 Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` con hot-reload.

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

## 📡 API Endpoints

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario con verificación facial.

**Body:**
```json
{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "faceDescriptor": [0.123, -0.456, ...] // Array de 128 números
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "points": 0,
    "role": "USER"
  }
}
```

#### POST /api/auth/login
Inicia sesión con verificación facial.

**Body:**
```json
{
  "email": "juan@example.com",
  "faceDescriptor": [0.123, -0.456, ...]
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "points": 150,
    "role": "USER"
  }
}
```

### Videos

#### GET /api/videos
Lista todos los videos activos.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Spider Video",
    "description": "A test video about spiders.",
    "url": "/videos/spider.mp4",
    "thumbnail": "https://...",
    "duration": 19.6,
    "points": 1
  }
]
```

#### GET /api/videos/:id
Obtiene un video específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Spider Video",
  "description": "A test video about spiders.",
  "url": "/videos/spider.mp4",
  "thumbnail": "https://...",
  "duration": 19.6,
  "points": 1,
  "active": true
}
```

#### POST /api/videos/:id/watch
Registra que un usuario vio un video.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "completed": true,
  "watchedPercentage": 95.5
}
```

**Response:**
```json
{
  "success": true,
  "pointsEarned": 1,
  "message": "Congratulations! You earned 1 point"
}
```

### Recompensas

#### GET /api/rewards
Lista todas las recompensas activas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Premium Subscription - 1 Month",
    "description": "Get 1 month of premium access",
    "imageUrl": "https://...",
    "cost": 100
  }
]
```

#### POST /api/rewards/:id/redeem
Canjea una recompensa.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Reward redeemed successfully!",
  "redemption": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "rewardId": "507f1f77bcf86cd799439013",
    "cost": 100,
    "redeemedAt": "2025-12-01T18:00:00.000Z"
  }
}
```

## 🔒 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Flujo de Autenticación

1. Usuario se registra/inicia sesión
2. Backend genera un JWT firmado
3. Cliente almacena el token (localStorage)
4. Cliente envía el token en el header `Authorization: Bearer <token>`
5. Middleware verifica el token en cada request protegido

### Middleware de Autenticación

```typescript
// Proteger una ruta
router.get('/protected', authenticate, (req, res) => {
  // req.userId contiene el ID del usuario autenticado
});
```

## 📊 Logging

El backend usa un Logger personalizado con colores ANSI:

```typescript
import Logger from './utils/Logger';

Logger.info('Server started', { service: 'Server', method: 'start' });
Logger.error('Database connection failed', { service: 'Database', method: 'connect' });
Logger.warn('Deprecated endpoint used', { service: 'API', method: 'oldEndpoint' });
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📦 Build

```bash
# Compilar TypeScript a JavaScript
npm run build

# Los archivos compilados estarán en dist/
```

## 🐛 Debugging

### Logs de MongoDB

```typescript
// En database.ts
mongoose.set('debug', true);
```

### Logs de Requests

El servidor usa `morgan` para logging de HTTP requests en desarrollo.

## 🔐 Seguridad

- **Passwords**: Hasheados con bcrypt (10 rounds)
- **JWT**: Firmado con secret, expira en 7 días
- **Face Descriptors**: Solo se almacenan vectores numéricos, no imágenes
- **CORS**: Configurado para dominios específicos
- **Helmet**: Headers de seguridad HTTP
- **Validación**: Validación de entrada en todos los endpoints

## 📝 Scripts

- `npm run dev` - Desarrollo con hot-reload (nodemon + ts-node)
- `npm run build` - Compilar TypeScript
- `npm start` - Producción (requiere build previo)
- `npm run seed` - Poblar base de datos

## 🚀 Deployment

### Railway / Render / Heroku

1. Crear proyecto en la plataforma
2. Conectar repositorio
3. Configurar variables de entorno
4. Configurar build command: `npm run build`
5. Configurar start command: `npm start`

### Variables de Entorno en Producción

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mimejorversion
JWT_SECRET=<generate-a-strong-secret>
```

## 📄 Licencia

Privado y confidencial.
