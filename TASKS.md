# TASKS — FitTrack

Estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado (con motivo) ·
`⏸` en espera. El detalle de lo hecho está en `PROGRESS.md` y en git.

## Ahora

### Fase 13 — Fotos de los ejercicios
- [x] Prompts para las 678 imágenes (226 ejercicios × 3: posición inicial,
      movimiento, técnica clave) con el estilo de `data/images/ejemplo/` y
      flechas/círculos naranjas sin texto → `docs/fotos/PROMPTS.md` y
      `docs/fotos/prompts.json` (`node scripts/make_photo_prompts.js`).
- [ ] **Usuario**: generar las imágenes (ChatGPT) y guardarlas como
      `data/images/photos/<id>-1.png … -3.png`. Se puede ir por lotes.
- [ ] **Agente**, al recibir lotes: `image` pasa a lista de 3 en
      `data/exercises/all.json`, carrusel en el detalle (app y web), sync a
      `app/` y `web/`, `source_note` declarando "generadas con IA" (regla de
      oro), comprimir a WebP/JPEG para no inflar el bundle.
- Nota: desde la sesión del agente no se pueden generar imágenes
  fotorrealistas (sin generador de imágenes).

### Paridad web (Fases 11b y 12)
- [ ] `web/src/pages/dashboard.astro`: mismo Resumen simplificado.
- [ ] `web/src/pages/session.astro`: ejercicio actual + filas compactas,
      barra fija con una acción, cardio (min/km/intensidad), valoración.
- [ ] Perfil web: datos fijos y calorías (portar `app/src/lib/energy.ts`).
- [x] Tema negro con degradados en la web (`global.css`, `theme-color`).
- [x] `normalizeSession` / `sessionCardioMinutes` idénticos en `gym.js`
      (tests de paridad).
- ⛔ Verificar `npm run build` de la web: falta `web/node_modules`
      (`cd web && npm ci`, pendiente de aprobación).

### Revisión en dispositivo
- [ ] Probar en iPhone real (Expo Go) la sesión nueva, el cardio y la
      valoración.

## Hecho recientemente

### Fase 12 — Añadir datos (2026-11-15)
- [x] **Cardio**: registro por minutos + km + intensidad (suave / moderada /
      fuerte); al añadir cardio o elegirlo en el asistente se crea un bloque
      de 20 min (o el último que hiciste); kcal estimadas con METs; minutos
      de cardio de la semana en el Resumen; Historial "20 min · 3 km · Fuerte".
- [x] **Valoración al terminar**: hoja opcional con energía y sensación
      (1–5); "Guardar sesión" o "Finalizar sin valorar"; visible en
      Historial.
- [x] **Perfil — Sobre ti**: sexo, año de nacimiento, nivel, objetivo (el
      asistente arranca con nivel y objetivo); peso registrable en Perfil.
- [x] **Calorías diarias**: Mifflin-St Jeor × actividad real de 4 semanas
      (`app/src/lib/energy.ts`, con tests).
- [x] Fix: el perfil perdía `height_entries` en cada lectura (`migrate`).
- [x] i18n: +37 claves (312).

### Fase 11b — Simplificación + tema negro (2026-11-15)
- [x] Resumen con una acción principal; resto tras "Más estadísticas".
- [x] Sin barra de marca global; idioma y "Tus datos" en Perfil.
- [x] Sesión: ejercicio actual primero, resto en filas de una línea, barra
      fija con una acción principal, iconos dibujados (sin □).
- [x] **Tema de entreno negro** con degradado carbón → negro y CTA con
      degradado naranja (app y web), en lugar del navy.
- [x] Capturas 01–10 y vídeo regenerados (`app/qa/shots/`).

## En espera

### Fase 7 — Sync en la nube (Supabase) ⏸
Decisión 2026-11-08: la v1 se publica solo con datos locales.
- [ ] Proyecto Supabase free + login magic link
- [ ] Tabla `sessions` + `user_id` con RLS
- [ ] Sync offline-first en app y web; export/import JSON como puente
- [ ] README: coste, privacidad, borrar cuenta

### Deuda técnica
- [ ] `SafeAreaView` está obsoleto en RN 0.88 → `react-native-safe-area-context`
      (necesita aprobación: dependencia nueva).
- [x] Harness de capturas/vídeo versionado en `app/qa/shots/`.
- [ ] Hoja de valores: añadir "+/−" fino para pesos fuera de la rejilla.
- [ ] `npm audit`: 4 avisos moderados en `app/` tras la instalación.

## Hecho (resumen)

- Fase 0 — Repo, docs, git.
- Fase 1 — 226 ejercicios reales de wger (CC-BY-SA) + imágenes placeholder +
  scripts de sync/generación.
- Fase 2 — Web Astro: 231 páginas, diseño apple.com, nav responsive.
- Fase 3 — App Expo (ahora SDK 58), AsyncStorage, tipos y bundle OK.
- Fase 4 — i18n NL/ES/EN/FR con cambio instantáneo sin red.
- Fase 5 — QA: `tests/run.js` y `tests/runtime.js`.
- Fase 6 — Datos reales vía PyPI. ⛔ Fotos reales: `static.wger.de` ya no
  existe.
- Fase 7b/7c — Icono y splash, iconos dibujados, sistema de diseño,
  feedback de guardado, exportar/borrar datos.
- Fase 8 — Benchmarks (1RM), generador de entrenos, material ocupado con
  aplazamiento y alternativas, modos de material, tema navy de entreno
  activo, persistencia del entreno.
- Fase 9c — Paridad web con la app (tema premium, asistente, sesión).
- Fase 10 — Sesión con "Detalles" plegados, pestaña Perfil (peso/altura),
  degradados premium.
- Fase 11 — Flujo "ejercicio actual" + barra fija + vídeo mp4.
- Fase 11b — Simplificación (impeccable) + tema negro.
- Fase 12 — Cardio, valoración al terminar, Perfil con datos fijos y calorías.

## Probar en el host (guía en README.md)
- Web: `cd web && npm ci && npm run build && npm run preview -- --host`
- App: `cd app && npm ci && npx expo start` + Expo Go (QR) en Android/iPhone
