# Arquitectura del Sistema - Plataforma de Verificación Facial

## 📐 Visión General

La plataforma está construida con una arquitectura **cliente-servidor** moderna, separando completamente el frontend del backend para máxima escalabilidad y mantenibilidad.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  React + TypeScript + Vite + TailwindCSS + face-api.js     │
│                     (Puerto 5173)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (axios)
┌──────────────────────▼──────────────────────────────────────┐
│                         BACKEND                             │
│    Node.js + Express + TypeScript + Prisma ORM             │
│                     (Puerto 3000)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma Client
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    BASE DE DATOS                            │
│              PostgreSQL (Prisma Postgres)                   │
│                  (Puerto 51213-51215)                       │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Estructura del Proyecto

```
src/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   ├── seed.ts                # Datos de prueba
│   │   └── migrations/            # Migraciones de DB
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   │   ├── auth.controller.ts
│   │   │   ├── video.controller.ts
│   │   │   └── reward.controller.ts
│   │   ├── routes/                # Definición de rutas
│   │   │   ├── auth.routes.ts
│   │   │   ├── video.routes.ts
│   │   │   └── reward.routes.ts
│   │   ├── middleware/            # Middleware personalizado
│   │   │   └── auth.middleware.ts
│   │   ├── app.ts                 # Configuración de Express
│   │   └── server.ts              # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── public/
    │   └── models/                # Modelos de face-api.js
    ├── src/
    │   ├── pages/                 # Páginas de la aplicación
    │   │   ├── Register.tsx
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── VideoPlayer.tsx
    │   │   └── Rewards.tsx
    │   ├── services/              # Servicios compartidos
    │   │   └── faceService.ts
    │   ├── App.tsx                # Configuración de rutas
    │   ├── main.tsx               # Punto de entrada
    │   └── index.css              # Estilos globales
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## 🔐 Flujo de Autenticación

### Registro (RF-01, RF-02)
```
1. Usuario ingresa datos (nombre, email, contraseña)
2. Frontend captura selfie con webcam
3. face-api.js extrae descriptor facial (vector de 128 dimensiones)
4. Se envía al backend: { fullName, email, password, faceDescriptor[] }
5. Backend:
   - Verifica que el email no exista
   - Verifica que el rostro no esté registrado (RF-15)
   - Hashea la contraseña con bcrypt
   - Almacena SOLO el vector biométrico (no la imagen)
6. Usuario registrado exitosamente
```

### Login (RF-03)
```
1. Usuario ingresa email
2. Frontend captura selfie en tiempo real
3. face-api.js extrae descriptor facial
4. Se envía al backend: { email, faceDescriptor[] }
5. Backend:
   - Busca usuario por email
   - Compara descriptores usando distancia euclidiana
   - Si distancia < 0.45 → Match exitoso
   - Genera JWT token
6. Frontend almacena token y datos de usuario
7. Redirección al dashboard
```

## 🎥 Flujo de Reproducción de Video

### Visualización (RF-06, RF-07, RF-08)
```
1. Usuario selecciona video del dashboard
2. Se carga VideoPlayer component
3. Inicialización:
   - Cargar modelos de face-api.js
   - Iniciar webcam
   - Configurar detección facial cada 3 segundos
4. Durante reproducción:
   - Cada 3s: detectar rostro en webcam
   - Si rostro detectado → continuar, incrementar tiempo válido
   - Si NO detectado → pausar video, mostrar advertencia
5. Al finalizar video:
   - Calcular porcentaje: (tiempoConRostro / duracionTotal) * 100
   - Si >= 90% → otorgar puntos
   - Si < 90% → rechazar, no otorgar puntos
6. Actualizar historial y puntos del usuario
```

## 💎 Sistema de Puntos y Recompensas

### Asignación de Puntos (RF-09)
```
Video.watch() → 
  Validar 90% → 
    History.create({ pointsEarned, completed: true }) →
      User.update({ points: increment })
```

### Canje de Recompensas (RF-13)
```
1. Usuario selecciona recompensa
2. Validar puntos suficientes
3. Transacción atómica:
   - Crear Redemption
   - Decrementar puntos del usuario
4. Notificar éxito
```

## 🗄️ Modelo de Datos

### Entidades Principales

**User**
- id (UUID)
- fullName, email, password
- faceDescriptor (Float[]) ← Vector biométrico
- points (Int)
- role (USER | ADMIN)

**Video**
- id, title, description
- url, thumbnail
- duration (segundos)
- points (a otorgar)
- active (Boolean)

**History**
- userId, videoId
- completed (Boolean)
- pointsEarned
- validFace (Boolean)
- watchedAt

**Reward**
- id, name, description
- imageUrl, cost
- active

**Redemption**
- userId, rewardId
- cost, redeemedAt

## 🔒 Seguridad Implementada

### Backend
1. **Contraseñas**: Hasheadas con bcrypt (10 rounds)
2. **JWT**: Tokens firmados con secret, expiración 1 día
3. **Middleware de Auth**: Verifica token en cada request protegido
4. **CORS**: Configurado para permitir frontend
5. **Helmet**: Headers de seguridad HTTP
6. **Validación**: Verificación de datos en cada endpoint

### Frontend
1. **Almacenamiento**: Token en localStorage (considerar httpOnly cookies en producción)
2. **Rutas protegidas**: Verificación de token antes de renderizar
3. **HTTPS**: Requerido en producción
4. **Biometría**: Procesamiento local, solo se envía vector

### Base de Datos
1. **Vectores biométricos**: Solo se almacenan descriptores numéricos
2. **No se guardan imágenes**: Cumplimiento de privacidad
3. **Índices**: En email (unique) para búsquedas rápidas

## 🚀 Escalabilidad

### Optimizaciones Actuales
- Prisma ORM con connection pooling
- Índices en campos de búsqueda frecuente
- Lazy loading de modelos de face-api.js
- Componentes React optimizados

### Mejoras Futuras
- **Cache**: Redis para sesiones y datos frecuentes
- **CDN**: Para videos y assets estáticos
- **Load Balancer**: Múltiples instancias del backend
- **Database Replication**: Read replicas para consultas
- **Microservicios**: Separar autenticación, videos, recompensas
- **Queue System**: Para procesamiento asíncrono de videos

## 📊 Monitoreo y Logs

### Actual
- Morgan para logs HTTP
- Console logs en desarrollo
- Prisma query logs

### Recomendado para Producción
- Winston/Pino para logging estructurado
- Sentry para error tracking
- Prometheus + Grafana para métricas
- ELK Stack para análisis de logs

## 🧪 Testing (Pendiente)

### Backend
- Unit tests: Jest + Supertest
- Integration tests: Prisma con DB de prueba
- E2E tests: Cypress

### Frontend
- Unit tests: Vitest + React Testing Library
- E2E tests: Playwright

## 🌐 Deployment

### Backend
- Railway / Heroku / AWS EC2
- Variables de entorno configuradas
- Prisma migrations automáticas
- Health check endpoint

### Frontend
- Vercel / Netlify / AWS S3 + CloudFront
- Build optimizado con Vite
- Variables de entorno para API URL

### Base de Datos
- Prisma Postgres (desarrollo)
- PostgreSQL managed (producción): AWS RDS, Supabase, Neon

## 📈 Métricas de Rendimiento

### Objetivos
- Tiempo de respuesta API: < 200ms
- Detección facial: < 100ms
- Carga inicial: < 2s
- Time to Interactive: < 3s

## 🔮 Roadmap Técnico

### Fase 1 (Actual) ✅
- Autenticación facial
- Reproductor con verificación
- Sistema de puntos básico

### Fase 2 (Próximo)
- Panel de administración
- Analytics y reportes
- Notificaciones push
- Límites diarios

### Fase 3 (Futuro)
- App móvil (React Native)
- Detección de mirada avanzada
- Anti-spoofing mejorado
- Gamificación avanzada
