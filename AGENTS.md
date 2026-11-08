# AGENTS.md

Convenciones y roles para cualquier agente (o persona) que trabaje en este
repo (FitTrack). Sigue el orden de fases de `SPEC.md`; actualiza `PROGRESS.md`
al cerrar cada tarea y mantén `TASKS.md` con los pendientes.

## Datos: estado real de las fuentes (medido en este sandbox)
- **Egress restringido** (proxy `10.200.0.1:3128`). Medido 2026-10-31 (vía 20:00,
  allowlist AMPLIADO vs. la 09:00):
  - Accesibles: `pypi.org`, `files.pythonhosted.org` (pip install funciona),
    `raw.githubusercontent.com`, `github.com` (SSR), `world.openfoodfacts.org`.
  - Bloqueados (403 CONNECT o sin DNS): `wger.de`, `static.wger.de`,
    `api.wger.de`, `api.github.com`, `registry.npmjs.org`, `huggingface.co`,
    `upload.wikimedia.org`, `commons.wikimedia.org`.
- **Base de ejercicios — DATOS REALES (2026-10-31)**: la API de wger sigue
  bloqueada, PERO la wheel de PyPI `wger 2.1` (publicada por el equipo de
  wger) incluye el dataset de la base (fixtures Django). `scripts/
  fetch_exercises_wger_pypi.py` lo extrae → `data/exercises/all.json`
  (`source:"real"`, 226 ejercicios, instrucciones reales de wger,
  atribución CC-BY-SA por ejercicio en `license`/`credit`). `name_nl` y
  `level` son curados localmente (wger no publica NL ni dificultad); 16
  ejercicios sin descripción en wger llevan pasos generados localmente
  (documentado en `source_note`). Backup de la base seed:
  `data/exercises/seed-v1.json`.
- **Imágenes**: las fotos reales de wger están en `static.wger.de` (403) →
  placeholders generados localmente (`scripts/generate_exercise_images.py`,
  fallback `fallback_spec(equipment, muscle_group)` para los ids sin pose
  curada). La UI y `source_note` dejan claro que las imágenes son seed.
- **Regla de oro**: nada inventado se publica como real. Lo que viene de
  wger → `source:"real"` con atribución; lo curado por memoria/local →
  documentado en `source_note` y `AGENTS.md`.
- **Estrategia cuando haya acceso a wger.de**: `scripts/fetch_exercises.py`
  (API wger, User-Agent propio, ≤ 2 req/s, backoff, 8 reintentos) + fotos de
  `static.wger.de`, y `scripts/sync_data.py` para sincronizar a `app/` y
  `web/`.

## Reglas de red y dependencias
- `npm install` NO funciona en este sandbox (403 del proxy). Estrategia de
  instalación: espejar `node_modules` del repo `fitnl` (mismas versiones
  exactas, presentes también en la npm cache local, 788 MB). **No añadir
  dependencias nuevas** a menos que ya estén en la cache local; si se necesitan,
  marcar la tarea ⛔ en `TASKS.md`.
- Cualquier llamada a API externa (si se habilita): User-Agent propio,
  ≤ 2 req/s, backoff exponencial ante 429/503, 8 reintentos máx.

## Roles de agente
- **Datos** — base de ejercicios, imágenes placeholders, `data/datasets.json`,
  mantenimiento de `source`.
- **Web** — Astro (static) + Tailwind: dashboard, biblioteca, sesión,
  historial. Mismo contenido que la app.
- **App** — React Native/Expo: mismas 4 vistas, persistencia en AsyncStorage.
- **i18n** — bundles NL/ES/EN/FR en `i18n/`; conmutación instantánea
  (0 peticiones de red al cambiar de idioma).
- **QA** — tests en `tests/run.js`, verificación de los criterios de
  aceptación de `SPEC.md`.

## Verificación ANTES de decir "listo"
- Web: `npm run build` verde + `npm run preview -- --host` + HTTP 200 en cada
  ruta + TODOS los assets referenciados resuelven 200.
- App: `npx tsc --noEmit` = 0 errores + bundle Metro (`app/bundle-check.js`)
  OK (o `expo export` si procede).
- Tests: `node tests/run.js` → 0 fallos.
- i18n: cada bundle tiene idéntico nº de claves que `en.json` (verificado en
  tests, sin cron).

## Skills útiles (cargar según fase)
- `test-driven-development`, `systematic-debugging` — calidad de código.
- `dogfood` — QA exploratorio de app/web.
