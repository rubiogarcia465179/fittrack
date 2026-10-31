# TASKS — FitTrack

Pendientes con estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado.

## Fase 0 — Estructura
- [x] Estructura del repo (AGENTS/SPEC/PROGRESS/TASKS/README/.gitignore)
- [x] git init + primer commit

## Fase 1 — Datos
- [x] `data/exercises/all.json` — 61 ejercicios (source: seed)
- [x] `data/images/` — 61 imágenes placeholder (PNG, source: seed)
- [x] `data/datasets.json` — metadatos de la base
- [x] `scripts/sync_data.py` — copia base+i18n a `app/` y `web/`
- [x] `scripts/rehydrate.sh` — fetch→sync→build→test
- [x] `scripts/fetch_exercises.py` — fetcher wger listo (⛔ bloqueado por red)

## Fase 2 — Web (Astro)
- [x] Setup Astro 4 + Tailwind 3.4 (espejo de node_modules, symlinks OK)
- [x] Layout/Nav + tokens de diseño (estilo Apple, igual que fitnl)
- [x] `/` dashboard (stats + gráficas + recientes, localStorage)
- [x] `/exercises/` biblioteca + 61 páginas de detalle (SSR)
- [x] `/session/` registro de sesión (sets/reps/peso)
- [x] `/history/` historial + borrado
- [x] Verificación: build 65 páginas + preview --host → HTTP 200 en todo (129 assets)

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
