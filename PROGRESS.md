# PROGRESS

Estado del proyecto FitTrack. El agente actualiza este archivo al cerrar cada
tarea.

## Estado actual
- [x] Fase 0 — Estructura del repo: AGENTS/SPEC/PROGRESS/TASKS/README +
      .gitignore, git init + primer commit.
- [ ] Fase 1 — Datos: base de ejercicios (seed) + imágenes + scripts.
- [ ] Fase 2 — Web (Astro): dashboard, biblioteca, sesión, historial.
- [ ] Fase 3 — App (Expo): 4 pestañas + AsyncStorage.
- [ ] Fase 4 — i18n: 4 bundles completos.
- [ ] Fase 5 — QA: tests + verificación de assets.
- [ ] Fase 6 — ⛔ Datos reales (bloqueo de red del sandbox).

## Verificaciones (output real)
- 2026-10-31 — Estructura creada y commiteada (commit inicial).
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
