# PROGRESS

Estado del proyecto FitTrack. El agente actualiza este archivo al cerrar cada
tarea.

## Estado actual
- [x] Fase 0 — Estructura del repo: AGENTS/SPEC/PROGRESS/TASKS/README +
      .gitignore, git init + primer commit.
- [x] Fase 1 — Datos: 61 ejercicios (seed) + 61 imágenes + scripts
      (sync/fetch/generadores) + i18n 4 bundles.
- [x] Fase 2 — Web (Astro): 4 vistas + 61 páginas de detalle; build +
      preview verificados (HTTP 200 en rutas y assets).
- [x] Fase 3 — App (Expo): 4 pestañas + AsyncStorage + tsc 0 errores +
      bundle Metro OK.
- [x] Fase 4 — i18n app: 4 bundles embebidos (nl/es/en/fr), conmutación
      instantánea sin red (idéntica a la web).
- [x] Fase 5 — QA: tests/run.js → 78/78 comprobaciones, 0 fallos.
- [ ] Fase 6 — ⛔ Datos reales (bloqueo de red del sandbox).

## Verificaciones (output real)
- 2026-10-31 — Web: `npm run build` → "65 page(s) built in 2.88s", exit 0.
  `npm run preview -- --host --port 4322` → HTTP 200 en `/`, `/exercises/`,
  `/session/`, `/history/`, `/favicon.svg`, `/js/i18n.js`, `/js/store.js`,
  las 61 páginas `/exercises/<id>/` y los 129 assets únicos referenciados
  por las páginas (0 fallos). SSR en español por defecto verificado
  (textos + base embebida en el HTML); i18n.js sin defer en el `<head>`.
- 2026-10-31 — App (Expo 51 / RN 0.74): `tsc --noEmit` → 0 errores.
  Bundle Metro de extremo a extremo (`app/bundle-check.js`, `Metro.runBuild`)
  → `BUNDLE_OK bytes=3077046` (61 imágenes + 4 bundles i18n + base embebidos).
  4 pestañas + pantalla de detalle; persistencia AsyncStorage; sin
  `react-native-svg` (barras con `View`, igual que la web).
- 2026-10-31 — QA: `node tests/run.js` → 78/78 comprobaciones, 0 fallos
  (integridad de los 61 ejercicios, imágenes en las 3 ubicaciones, paridad
  de los 4 bundles i18n + espejos app/web, 25 vectores de lógica sobre
  `web/src/lib/gym.js`, 11 comprobaciones de paridad TS≡JS sobre
  `app/src/lib/gym.ts`, tsc 0 errores).
- 2026-10-31 — Web re-verificada con las imágenes regeneradas: build 65
  páginas + preview → HTTP 200 en 68 rutas y los 129 assets (0 fallos).
- 2026-10-31 — Reconocimiento de entorno (medido): npmjs/wger/OFF → 403
  (allowlist del proxy); npm cache local 788 MB con las dependencias exactas
  de Astro 4.16/Tailwind 3.4/Expo 51/RN 0.74 (espejo desde `fitnl/`);
  build de referencia `fitnl/web` verde (4 páginas, 5 s).

## Decisiones tomadas
- Proyecto nuevo e independiente → propio directorio `/sandbox/fittrack`
  (sin colisión con `fitnl/`; no hacen falta ramas separadas).
- Charts del dashboard sin `react-native-svg` (no está en la cache local):
  barras dibujadas con `View`/`div` (compatible offline y en web).
- Instalación de dependencias por espejo de `fitnl/*/node_modules` (mismas
  versiones, cache npm local) — `npm install` está bloqueado (403).
- App: la lógica vive en `app/src/lib/gym.ts` como puerto 1:1 de
  `web/src/lib/gym.js` (misma semántica); `tests/run.js` comprueba la
  paridad TS≡JS con las mismas entradas. Imágenes de la app vía
  `require()` de Metro (`app/src/images.ts` generado por
  `scripts/make_image_map.py`; los PNG se copian a `app/assets/exercises/`).
- `app/metro.config.js` = `getDefaultConfig()` de `@expo/metro-config`
  (sin él Metro no resuelve el registro de assets).

## Pendiente / bloqueos
- Fase 6 (datos reales): ⛔ el proxy del sandbox bloquea npmjs, wger, OFF.
  Hacer fuera o ampliar el allowlist.

## Log
- 2026-10-31 — Repo inicializado; estructura base y docs (Fase 0).

- 2026-10-31 — Fase 2 (web) cerrada: build + preview 200 OK. Correcciones:
  rutas de imagen `/images/exercises/<id>.png` (fix en sync_data.py),
  getStaticPaths() para las 61 rutas de detalle, symlinks conservados en el
  espejo de node_modules.

- 2026-10-31 — Imágenes de ejercicios regeneradas (61 PNG 640×420 con poses
  por grupo muscular, `scripts/generate_exercise_images.py`) y commitadas.

- 2026-10-31 — Fase 3 (app Expo) cerrada: 4 pestañas + detalle,
  AsyncStorage, espejo de node_modules + `metro.config.js`, tsc 0 errores,
  bundle Metro 3.07 MB. Fase 4 (i18n app) cerrada: 4 bundles embebidos,
  conmutación instantánea. Fase 5 (QA) cerrada: `tests/run.js` 78/78, 0
  fallos; web re-verificada 68 rutas + 129 assets con las nuevas imágenes.
