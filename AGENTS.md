# AGENTS.md

Convenciones y roles para cualquier agente (o persona) que trabaje en este
repo (FitTrack). Sigue el orden de fases de `SPEC.md`; actualiza `PROGRESS.md`
al cerrar cada tarea y mantén `TASKS.md` con los pendientes.

## Datos: estado real de las fuentes (medido en este sandbox, 2026-10-31)
- **Egress restringido**: el proxy solo permite `pypi.org`, `api.github.com` y
  `host.openshell.internal` (vLLM). Medido: `curl https://registry.npmjs.org`
  → 403; `curl https://wger.de` → 403; `curl https://world.openfoodfacts.org`
  → 403.
- **Base de ejercicios**: las fuentes reales (API wger, OpenStreetMuscle,
  Wikimedia) son inaccesibles desde el sandbox → la base
  `data/exercises/all.json` es `source: "seed"`. Regla de oro: **nada de datos
  inventados publicados como reales** — cada entrada lleva `"source"` y la UI
  lo muestra.
- **Imágenes**: las fotos de ejercicios son inaccesibles → placeholders
  generados localmente (SVG → PNG), `source: "seed"`, `data/images/`.
- **Estrategia cuando haya acceso**: `scripts/fetch_exercises.py` (API wger:
  User-Agent propio, ≤ 2 req/s, backoff exponencial, 8 reintentos) regenera la
  base con datos reales y `scripts/sync_data.py` la sincroniza a `app/` y
  `web/`. No planificar descargas masivas mientras el allowlist no lo permita.

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
