#!/usr/bin/env node
/**
 * Web de FitTrack (R-131, 2026-11-16): ES la app. Se compila el mismo código
 * de app/ con `expo export --platform web` (react-native-web) → web/dist/.
 * Paridad total por construcción: no hay una segunda base de código.
 * (El sitio Astro anterior vive en la rama `web-astro`.)
 *
 *   cd web && npm run build      → web/dist/ (estático; súbelo a cualquier hosting)
 *   cd web && npm run preview    → http://localhost:8080
 *
 * Se sirve en la RAÍZ del dominio (las rutas de Expo son absolutas: /_expo/…).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app');
const OUT = path.join(__dirname, 'dist');
fs.rmSync(OUT, { recursive: true, force: true });
execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', OUT], { cwd: APP, stdio: 'inherit' });
// Hosting estático: cualquier ruta desconocida devuelve la app (SPA).
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(OUT, '404.html'));
console.log('WEB_OK ' + OUT);
