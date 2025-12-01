# 🎨 Frontend - MiMejorVersion

Aplicación web React con verificación facial en tiempo real para visualización de videos y sistema de puntos.

## 🚀 Tecnologías

- **React** 18+ con TypeScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS v4** - Estilos utility-first
- **face-api.js** - Detección y reconocimiento facial
- **react-webcam** - Acceso a cámara web
- **axios** - Cliente HTTP
- **react-router-dom** - Enrutamiento
- **react-hot-toast** - Notificaciones
- **canvas-confetti** - Efectos de celebración

## 📋 Requisitos

- Node.js >= 18.x
- npm >= 9.x
- Navegador moderno con soporte para:
  - WebRTC (acceso a cámara)
  - WebGL (para face-api.js)
  - ES6+
- Cámara web funcional

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Descargar modelos de IA
chmod +x download-models.sh
./download-models.sh

# Copiar variables de entorno
cp .env.example .env
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# URL del backend
VITE_API_URL=http://localhost:3000
```

### Modelos de IA

Los modelos de face-api.js deben estar en `public/models/`:

```
public/models/
├── tiny_face_detector_model-shard1
├── tiny_face_detector_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-shard2
└── face_recognition_model-weights_manifest.json
```

El script `download-models.sh` descarga automáticamente estos archivos.

## 🚀 Ejecución

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Preview de Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── pages/              # Páginas de la aplicación
│   ├── Register.tsx    # Registro con captura facial
│   ├── Login.tsx       # Login con verificación facial
│   ├── Dashboard.tsx   # Lista de videos disponibles
│   ├── VideoPlayer.tsx # Reproductor con detección facial
│   └── Rewards.tsx     # Catálogo de recompensas
├── services/           # Servicios
│   └── faceService.ts  # Lógica de face-api.js
├── utils/              # Utilidades
│   └── Logger.ts       # Logger con colores
├── App.tsx             # Componente raíz con rutas
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales (Tailwind)
```

## 🎯 Páginas y Funcionalidades

### 1. Register (`/register`)

**Funcionalidad:**
- Formulario de registro (nombre, email, contraseña)
- Captura de rostro mediante webcam
- Extracción de descriptor facial (128 dimensiones)
- Envío al backend para crear cuenta

**Flujo:**
1. Usuario completa formulario
2. Permite acceso a cámara
3. Sistema detecta rostro y muestra borde verde
4. Usuario hace clic en "Capture Face"
5. Sistema extrae descriptor y registra usuario

### 2. Login (`/login`)

**Funcionalidad:**
- Login con email y verificación facial
- Comparación de rostro con descriptor almacenado
- Generación de token JWT

**Flujo:**
1. Usuario ingresa email
2. Permite acceso a cámara
3. Sistema verifica que el rostro coincida
4. Si coincide, genera token y redirige a dashboard

### 3. Dashboard (`/dashboard`)

**Funcionalidad:**
- Lista de videos disponibles
- Visualización de puntos acumulados
- Navegación a reproductor de videos
- Acceso a recompensas

**Componentes:**
- Header con puntos y botones
- Grid de tarjetas de videos
- Información de duración y puntos por video

### 4. VideoPlayer (`/watch/:id`)

**Funcionalidad:**
- Reproducción de video
- Detección facial en tiempo real cada 1.5s
- Pausa automática si no detecta rostro
- Cálculo de porcentaje visto con rostro visible
- Otorgamiento de puntos al completar 90%

**Características:**
- Borde verde/rojo en webcam según detección
- Contador de tiempo válido en tiempo real
- Toast de celebración con confetti al ganar puntos
- Mensajes amigables de error/éxito

**Parámetros de Detección:**
```typescript
{
  inputSize: 224,        // Tamaño de entrada (más pequeño = más rápido)
  scoreThreshold: 0.3    // Umbral de confianza (0.3 = permisivo)
}
```

### 5. Rewards (`/rewards`)

**Funcionalidad:**
- Catálogo de recompensas disponibles
- Visualización de costo en puntos
- Canje de recompensas
- Historial de canjes

## 🎨 Estilos y Diseño

### Tailwind CSS v4

El proyecto usa Tailwind CSS v4 con la nueva sintaxis:

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

### Paleta de Colores

- **Fondo**: slate-900 (oscuro)
- **Tarjetas**: slate-800/50 con backdrop-blur
- **Acentos**: blue-500, purple-500, green-500
- **Bordes**: slate-700

### Componentes Reutilizables

Todos los estilos están inline usando Tailwind utilities:

```tsx
<div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
  {/* Contenido */}
</div>
```

## 🔧 Servicios

### faceService.ts

Servicio para interactuar con face-api.js:

```typescript
// Cargar modelos
await loadModels();

// Extraer descriptor de una imagen
const descriptor = await extractDescriptor(imageSrc);
// Returns: Float32Array de 128 dimensiones
```

### Logger.ts

Logger personalizado con colores:

```typescript
Logger.info('Message', { service: 'Component', method: 'function' });
Logger.error('Error', { service: 'Component', method: 'function' });
Logger.warn('Warning', { service: 'Component', method: 'function' });
```

## 🎥 Detección Facial

### Configuración de TinyFaceDetector

```typescript
const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 224,        // 128, 160, 224, 320, 416, 512, 608
  scoreThreshold: 0.3    // 0.0 - 1.0 (más bajo = más permisivo)
});
```

### Flujo de Detección en VideoPlayer

1. **Inicio**: Carga modelos al montar componente
2. **Play**: Inicia detección cada 1.5 segundos
3. **Detección**: 
   - Si detecta rostro → Suma tiempo transcurrido
   - Si NO detecta rostro (2 veces seguidas) → Pausa video
4. **Recuperación**: Si vuelve a detectar rostro → Muestra toast verde
5. **Fin**: Calcula porcentaje y otorga puntos si >= 90%

### Optimizaciones

- **Intervalo de 1.5s**: Balance entre precisión y rendimiento
- **Umbral bajo (0.3)**: Permite detección a 60-80cm de distancia
- **Input size 224**: Rápido y preciso para rostros medianos
- **2 fallos consecutivos**: Evita pausas por parpadeos

## 📦 Build para Producción

```bash
# Generar build optimizado
npm run build

# Los archivos estarán en dist/
```

### Optimizaciones de Build

- **Code splitting**: Chunks separados por ruta
- **Tree shaking**: Eliminación de código no usado
- **Minificación**: CSS y JS minificados
- **Lazy loading**: Carga de componentes bajo demanda

### Archivos Generados

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── models/              # Modelos de IA
└── videos/              # Videos locales
```

## 🚀 Deployment

### Vercel / Netlify

1. Conectar repositorio
2. Configurar build:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Configurar variables de entorno:
   - `VITE_API_URL`: URL del backend en producción

### Variables de Entorno en Producción

```env
VITE_API_URL=https://api.mimejorversion.com
```

## 🐛 Solución de Problemas

### Cámara no funciona

**Problema**: "Permission denied" o cámara no se activa

**Solución**:
- Verificar permisos del navegador
- Usar HTTPS o localhost (WebRTC requiere conexión segura)
- Cerrar otras aplicaciones que usen la cámara

### Modelos no cargan

**Problema**: "Failed to load models"

**Solución**:
```bash
# Re-descargar modelos
rm -rf public/models/*
./download-models.sh
```

### No detecta rostro

**Problema**: Siempre muestra "No Face Detected"

**Solución**:
- Mejorar iluminación
- Acercarse a la cámara (60-80cm ideal)
- Quitar gafas oscuras o máscaras
- Verificar que los modelos estén cargados

### Build falla

**Problema**: Error al hacer `npm run build`

**Solución**:
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Scripts

- `npm run dev` - Desarrollo con hot-reload
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter (si está configurado)

## 🔐 Seguridad

- **Descriptores faciales**: Solo se envían vectores numéricos, no imágenes
- **Tokens**: Almacenados en localStorage (considerar httpOnly cookies en producción)
- **HTTPS**: Requerido para WebRTC en producción
- **Validación**: Validación de entrada en todos los formularios

## 📱 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+ (con limitaciones en WebRTC)
- ❌ IE11 (no soportado)

### Dispositivos

- ✅ Desktop (Windows, macOS, Linux)
- ⚠️ Mobile (funcional pero experiencia limitada)
- ❌ Tablets (no optimizado)

## 📄 Licencia

Privado y confidencial.
