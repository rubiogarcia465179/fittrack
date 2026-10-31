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
- [ ] Fase 3 — App (Expo): 4 pestañas + AsyncStorage.
- [ ] Fase 4 — i18n app (la web ya lo trae; falta el bundle en app).
- [ ] Fase 5 — QA: tests/run.js (0 fallos).
- [ ] Fase 6 — ⛔ Datos reales (bloqueo de red del sandbox).

## Verificaciones (output real)
- 2026-10-31 — Web: `npm run build` → "65 page(s) built in 2.88s", exit 0.
  `npm run preview -- --host --port 4322` → HTTP 200 en `/`, `/exercises/`,
  `/session/`, `/history/`, `/favicon.svg`, `/js/i18n.js`, `/js/store.js`,
  las 61 páginas `/exercises/<id>/` y los 129 assets únicos referenciados
  por las páginas (0 fallos). SSR en español por defecto verificado
  (textos + base embebida en el HTML); i18n.js sin defer en el `<head>`.
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

## Pendiente / bloqueos
- Fase 6 (datos reales): ⛔ el proxy del sandbox bloquea npmjs, wger, OFF.
  Hacer fuera o ampliar el allowlist.

## Log
- 2026-10-31 — Repo inicializado; estructura base y docs (Fase 0).

- 2026-10-31 — Fase 2 (web) cerrada: build + preview 200 OK. Correcciones:
  rutas de imagen `/images/exercises/<id>.png` (fix en sync_data.py),
  getStaticPaths() para las 61 rutas de detalle, symlinks conservados en el
  espejo de node_modules.
