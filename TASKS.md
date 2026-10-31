# TASKS — FitTrack

Pendientes con estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado.

## Fase 0 — Estructura
- [x] Estructura del repo (AGENTS/SPEC/PROGRESS/TASKS/README/.gitignore)
- [x] git init + primer commit

## Fase 1 — Datos
- [ ] `data/exercises/all.json` — ≥ 50 ejercicios (source: seed)
- [ ] `data/images/` — imágenes placeholder por ejercicio (SVG→PNG, source: seed)
- [ ] `data/datasets.json` — metadatos de la base (source, counts, fecha)
- [ ] `scripts/sync_data.py` — copia la base a `app/src/data/` y `web/src/data/`
- [ ] `scripts/rehydrate.sh` — fetch→clasificar→sync→build→test
- [ ] `scripts/fetch_exercises.py` — fetcher wger listo para cuando haya red (⛔ por ahora)

## Fase 2 — Web (Astro)
- [ ] Setup Astro 4 + Tailwind 3.4 (espejo de node_modules)
- [ ] Layout/Nav + tokens de diseño
- [ ] `/` dashboard
- [ ] `/exercises/` biblioteca + detalle (SSR)
- [ ] `/session/` registro de sesión
- [ ] `/history/` historial
- [ ] Verificación: build + preview --host + HTTP 200 en rutas y assets

## Fase 3 — App (Expo)
- [ ] Setup Expo (espejo de node_modules)
- [ ] 4 pestañas: Dashboard, Biblioteca, Sesión, Historial
- [ ] Persistencia AsyncStorage
- [ ] Verificación: tsc --noEmit + bundle Metro

## Fase 4 — i18n
- [ ] Bundles nl/es/en/fr completos (mismo nº de claves)
- [ ] Conmutación instantánea en web (head sin defer) y app

## Fase 5 — QA
- [ ] `tests/run.js` — integridad de datos + lógica + i18n (0 fallos)
- [ ] Todos los assets referenciados resuelven 200

## Fase 6 — Datos reales
- ⛔ Regenerar base con datos reales (wger API / fotos). Bloqueado: el proxy
  del sandbox (403) no deja acceder a npmjs/wger/OFF. Instrucción para el
  humano: ampliar el allowlist (registry.npmjs.org, wger.de,
  static.wger.de…) o ejecutar `scripts/fetch_exercises.py` +
  `scripts/sync_data.py` en una máquina con red y copiar `data/` al sandbox.
