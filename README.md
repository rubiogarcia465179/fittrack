# FitTrack

Monitor de progreso de gimnasio: base de ejercicios, registro de sesiones
(juegos, repeticiones, peso) y dashboard de resumen. Web estática
(Astro + Tailwind) y app móvil (Expo / React Native). Sin backend en el MVP:
datos embebidos y persistencia local.

## Estado
Ver `PROGRESS.md` (estado y verificaciones) y `TASKS.md` (pendientes).
La base de ejercicios es `seed` (marcada como tal en la data y la UI) porque
las fuentes reales están bloqueadas por la red del sandbox — ver
`AGENTS.md` y Fase 6 de `TASKS.md`.

## Cómo verlo / usarlo
- Web: `cd web && npm run build && npm run preview -- --host`
  (o servir `dist/` en cualquier hosting estático).
- App: `cd app && npx expo start` + Expo Go en el móvil (Android/iOS).
- Tests: `node tests/run.js`.
- Pipeline: `scripts/rehydrate.sh` (fetch→clasificar→sync→build→test; el
  fetch queda en seco mientras no haya red).

## Estructura
```
fittrack/
├── AGENTS.md  SPEC.md  PROGRESS.md  TASKS.md  README.md
├── data/      ← base de ejercicios (JSON, source: seed) + imágenes
├── scripts/   ← sync_data.py, rehydrate.sh, fetch_exercises.py
├── i18n/      ← bundles nl/es/en/fr
├── tests/     ← node tests/run.js
├── web/       ← Astro 4 (static) + Tailwind 3.4
└── app/       ← Expo SDK 51 / React Native 0.74
```
