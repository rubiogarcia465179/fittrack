# TASKS — FitTrack

Pendientes con estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado.

## Fase 0 — Estructura
- [x] Estructura del repo (AGENTS/SPEC/PROGRESS/TASKS/README/.gitignore)
- [x] git init + primer commit

## Fase 1 — Datos
- [x] `data/exercises/all.json` — 61 ejercicios (source: seed)
- [x] `data/images/` — 61 imágenes (PNG 640×420, poses por grupo muscular)
- [x] `data/datasets.json` — metadatos de la base
- [x] `scripts/sync_data.py` — copia base+i18n+imágenes a `app/` y `web/`
- [x] `scripts/rehydrate.sh` — fetch→sync→build→test
- [x] `scripts/fetch_exercises.py` — fetcher wger listo (⛔ bloqueado por red)
- [x] `scripts/generate_exercise_images.py` — regenerador de las 61 imágenes

## Fase 2 — Web (Astro)
- [x] Setup Astro 4 + Tailwind 3.4 (espejo de node_modules, symlinks OK)
- [x] Layout/Nav + tokens de diseño (estilo Apple, igual que fitnl)
- [x] `/` dashboard (stats + gráficas + recientes, localStorage)
- [x] `/exercises/` biblioteca + 61 páginas de detalle (SSR)
- [x] `/session/` registro de sesión (sets/reps/peso)
- [x] `/history/` historial + borrado
- [x] Verificación: build 65 páginas + preview --host → HTTP 200 en todo (129 assets)
- [x] Re-verificación con las 61 imágenes regeneradas (68 rutas + 129 assets, 0 fallos)

## Fase 3 — App (Expo)
- [x] Setup Expo 51 / RN 0.74 (espejo de node_modules de fitnl/app)
- [x] `metro.config.js` (getDefaultConfig) — resolver de assets
- [x] 4 pestañas: Dashboard, Biblioteca, Sesión, Historial + detalle
- [x] Persistencia AsyncStorage (`src/store.ts`, clave `fittrack.data.v1`)
- [x] Lógica gym: `src/lib/gym.ts` (puerto 1:1 de `web/src/lib/gym.js`)
- [x] Imágenes embebidas: `src/images.ts` (61 require de Metro, make_image_map.py)
- [x] Verificación: `tsc --noEmit` 0 errores + bundle Metro (3.07 MB, BUNDLE_OK)

## Fase 4 — i18n
- [x] Bundles nl/es/en/fr completos (84 claves, mismo nº en los 4)
- [x] Conmutación instantánea en web (head sin defer) y app
  (bundles embebidos en `src/i18n.ts`, persistidos en AsyncStorage)

## Fase 5 — QA
- [x] `tests/run.js` — integridad de datos + lógica + i18n + paridad TS≡JS:
  78/78 comprobaciones, 0 fallos
- [x] Todos los assets referenciados resuelven 200 (web, 129 assets)

## Fase 6 — Datos reales
- ⛔ Regenerar la base con datos reales (wger API / fotos). Bloqueado: el
  proxy del sandbox (403) no deja acceder a npmjs/wger/OFF. Instrucción para
  el humano: ampliar el allowlist (registry.npmjs.org, wger.de,
  static.wger.de…) o ejecutar `scripts/fetch_exercises.py` +
  `scripts/sync_data.py` en una máquina con red y copiar `data/` al sandbox.
