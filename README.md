# FitTrack

Monitor de progreso de gimnasio: base de ejercicios, registro de sesiones
(juegos, repeticiones, peso) y dashboard de resumen. Web estática
(Astro + Tailwind) y app móvil (Expo / React Native). Sin backend en el MVP:
datos embebidos y persistencia local (localStorage / AsyncStorage).

## Estado
Ver `PROGRESS.md` (estado y verificaciones) y `TASKS.md` (pendientes).
La base de ejercicios es **real** (226 ejercicios de wger, CC-BY-SA, vía
wheel de PyPI — ver `AGENTS.md`). Las **imágenes** siguen siendo
placeholders generados (`static.wger.de` no está resuelto en internet) y la
UI lo declara.

## Estructura (importante: son dos sub-proyectos)
```
fittrack/
├── AGENTS.md  SPEC.md  PROGRESS.md  TASKS.md  README.md
├── data/      ← base de ejercicios (JSON, source: real) + imágenes
├── scripts/   ← sync_data.py, fetch_exercises_wger_pypi.py, generadores
├── i18n/      ← bundles nl/es/en/fr (86 claves)
├── tests/     ← node tests/run.js
├── web/       ← Astro 4 (static) + Tailwind 3.4   → su package.json AQUÍ
└── app/       ← Expo SDK 51 / React Native 0.74   → su package.json AQUÍ
```
**La raíz NO tiene `package.json`** (son dos proyectos independientes).
Todos los comandos `npm` se ejecutan desde `web/` o desde `app/`.

## Web: probarla en el host

1. Instala dependencias (solo la primera vez):
   ```bash
   cd web
   npm ci          # usa package-lock.json versionado
   ```
2. Sirve el sitio (elige una):
   ```bash
   npm run build && npm run preview -- --host    # build + preview en :4321
   #  ó desarrollo en caliente:
   npm run dev -- --host
   ```
   Abre `http://<ip-del-host>:4321/` (con `--host` también desde otro
   dispositivo de la red).
   También vale cualquier hosting estático con `web/dist/`.

3. Checklist de rutas (230 páginas): `/`, `/exercises/`,
   `/exercises/<id>/` (226 ids, p. ej. `/exercises/bench_press/`),
   `/session/`, `/history/`. Cambia de idioma con NL/ES/EN/FR en la cabecera
   (cambio instantáneo, sin red). Guarda una sesión en `/session/` y
   comprueba que el dashboard y el historial la reflejan (persistencia en
   localStorage).

Si `npm run preview` da `ENOENT ... fittrack/package.json` → estabas en la
raíz del repo: haz `cd web` antes.

## App Android: probarla en tu móvil

### Opción A — Expo Go (rápida, sin compilar)
1. En el host:
   ```bash
   cd app
   npm ci
   npx expo start
   ```
2. En el móvil: instala **Expo Go** (Google Play, de expo.dev) y abre la
   app.
3. Escanea con la cámara del móvil el **QR que imprime la terminal** (el
   mismo móvil debe estar en la misma red que el host). Se descarga el
   bundle por la red local y arranca la app nativa.
4. Si el móvil no ve el QR (distintas redes), pulsa `a` en la terminal para
   ver la URL de la forma `exp://IP-DEL-HOST:8081` y pégala en Expo Go, o
   usa el botón "Open on device" si el móvil está en tu cuenta de Expo.

### Opción B — build nativo (APK)
```bash
cd app
npx expo prebuild -p android
cd android && ./gradlew assembleDebug
# APK en android/app/build/outputs/apk/debug/app-debug.apk
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción C — web en el móvil
`cd app && npx expo start --web` abre la app en el navegador (React Native
Web); útil para probar la UI sin instalar nada. (La web principal es
`web/`; esta sirve para ejercitar la app.)

Checklist en el móvil: 4 pestañas (Dashboard, Exercises, Session, History),
conmutación NL/ES/EN/FR instantánea, crear sesión con sets/reps/peso,
borrar del historial, volver a abrir la app y ver que las sesiones
persisten (AsyncStorage).

## Tests
```bash
node tests/run.js        # integridad de datos + lógica + i18n + paridad
cd app && npm run typecheck && npm run bundle:check
cd web  && npm run build
```
`tests/run.js` → 0 fallos.
