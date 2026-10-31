# TASKS — FitTrack

Pendientes con estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado.

## Fase 0 — Estructura
- [x] Estructura del repo (AGENTS/SPEC/PROGRESS/TASKS/README/.gitignore)
- [x] git init + primer commit

## Fase 1 — Datos
- [x] `data/exercises/all.json` — **226 ejercicios (source: real, wger CC-BY-SA)**
      (backup de la base seed anterior: `data/exercises/seed-v1.json`)
- [x] `data/images/` — 226 imágenes placeholder (PNG 640×420, poses por grupo;
      fotos reales ⛔ static.wger.de bloqueada)
- [x] `data/datasets.json` — metadatos de la base (source: real, count 226)
- [x] `scripts/sync_data.py` — copia base+i18n+imágenes a `app/` y `web/`
- [x] `scripts/rehydrate.sh` — fetch→sync→build→test
- [x] `scripts/fetch_exercises.py` — fetcher API wger (⛔ wger.de 403; se usa
      la vía PyPI)
- [x] `scripts/fetch_exercises_wger_pypi.py` — **fetcher de la wheel de PyPI
      `wger` (datos reales, 226 ejercicios, atribución CC-BY-SA)**
- [x] `scripts/generate_exercise_images.py` — 226 imágenes (fallback
      `fallback_spec(equipment, muscle_group)` para ids sin pose curada)
- [x] `scripts/make_image_map.py` — mapa id→require() de Metro (226)
- [x] `scripts/generate_i18n.py` — 86 claves × 4 bundles (footer_note real,
      ex_license/ex_credit)

## Fase 2 — Web (Astro)
- [x] Setup Astro 4 + Tailwind 3.4 (espejo de node_modules, symlinks OK)
- [x] Layout/Nav + tokens de diseño (estilo Apple, igual que fitnl)
- [x] `/` dashboard (stats + gráficas + recientes, localStorage)
- [x] `/exercises/` biblioteca + **226 páginas de detalle (SSR)**
- [x] Detalle con **atribución CC-BY-SA (licencia + autor de wger)**
- [x] `/session/` registro de sesión (sets/reps/peso)
- [x] `/history/` historial + borrado
- [x] Verificación: build **230 páginas** + preview --host → HTTP 200 en
      **233 rutas + 459 assets** (0 fallos), con la base real de 226

## Fase 3 — App (Expo)
- [x] Setup Expo 51 / RN 0.74 (espejo de node_modules de fitnl/app)
- [x] `metro.config.js` (getDefaultConfig) — resolver de assets
- [x] 4 pestañas: Dashboard, Biblioteca, Sesión, Historial + detalle
- [x] Detalle con **atribución (licencia/autor de wger)**
- [x] Persistencia AsyncStorage (`src/store.ts`, clave `fittrack.data.v1`)
- [x] Lógica gym: `src/lib/gym.ts` (puerto 1:1 de `web/src/lib/gym.js`)
- [x] Imágenes embebidas: `src/images.ts` (**226** require de Metro)
- [x] Verificación: `tsc --noEmit` 0 errores + bundle Metro
      (**3.32 MB, BUNDLE_OK**, 226 imágenes + i18n 86 claves + base real)

## Fase 4 — i18n
- [x] Bundles nl/es/en/fr completos (**86 claves**, mismo nº en los 4)
- [x] Conmutación instantánea en web (head sin defer) y app
  (bundles embebidos en `src/i18n.ts`, persistidos en AsyncStorage)
- [x] Claves nuevas: `ex_license`, `ex_credit`, `footer_note` (datos reales)

## Fase 5 — QA
- [x] `tests/run.js` — integridad de datos + lógica + i18n + paridad TS≡JS:
  78/78 comprobaciones, 0 fallos (base real de 226)
- [x] Todos los assets referenciados resuelven 200 (web, 459 assets)

## Fase 6 — Datos reales
- [x] **Base de datos REAL**: 226 ejercicios de wger (CC-BY-SA) vía wheel de
      PyPI `wger 2.1` (`fetch_exercises_wger_pypi.py`); `source:"real"`,
      atribución por ejercicio visible en web y app.
- [x] `name_nl`/`level` curados localmente (wger no los publica) — documentado
      en `source_note`/`AGENTS.md`.
- ⛔ **Fotos reales**: `static.wger.de` sigue bloqueada (403) → imágenes
      placeholder generadas. Instrucción para el humano: ampliar el allowlist
      (`static.wger.de`, `wger.de`) y descargar las fotos; o copiar `data/`
      desde una máquina con red. El resto (API wger para más ejercicios/
      variaciones) sigue ⛔.
