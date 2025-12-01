#!/bin/bash

echo "📦 Descargando modelos de face-api.js (Incluyendo Tiny)..."

# No borrar todo, solo agregar los nuevos
mkdir -p public/models
cd public/models

BASE_URL="https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"

download_file() {
  echo "⬇️  Descargando $1..."
  curl -L -f -o "$1" "$BASE_URL/$1"
  
  if [ ! -s "$1" ]; then
    echo "❌ Error: $1 está vacío."
    exit 1
  fi
}

# Modelos Tiny Face Detector
download_file "tiny_face_detector_model-weights_manifest.json"
download_file "tiny_face_detector_model-shard1"

echo "✅ Modelos Tiny descargados."
ls -lh
