# 🚀 Guía de Inicio Rápido (Versión MongoDB)

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Requisitos Previos
- **MongoDB** instalado y corriendo en `localhost:27017`
- **Node.js** 18+

### 2️⃣ Configurar Backend

```bash
cd backend
npm install
npm run seed  # Poblar base de datos
npm run dev   # Iniciar servidor
```

El servidor estará en `http://localhost:3000`

### 3️⃣ Configurar Frontend

```bash
cd frontend
npm install
./download-models.sh  # Descargar modelos de IA (si no lo has hecho)
npm run dev
```

El frontend estará en `http://localhost:5173`

---

## 🔧 Solución de Problemas Comunes

### ❌ Error: "MongoDB connection error"
**Solución**: Asegúrate de que MongoDB esté corriendo.
- En Mac: `brew services start mongodb-community`
- En Docker: `docker run -d -p 27017:27017 mongo`

### ❌ Error: "Tailwind PostCSS"
**Solución**: Si ves errores de estilos, ejecuta en frontend:
```bash
npm install -D @tailwindcss/postcss
```

---

## 🎯 Datos de Prueba
- **Admin**: `admin@faceverify.com` / `admin123`
- **Videos**: 3 videos de ejemplo cargados
- **Recompensas**: 3 recompensas disponibles
