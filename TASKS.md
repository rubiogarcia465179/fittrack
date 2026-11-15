# TASKS — FitTrack

Estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado (con motivo) ·
`⏸` en espera. El detalle de lo hecho está en `PROGRESS.md` y en git.

## Ahora

### Fase 11b — Simplificación de Resumen y Sesión (impeccable, 2026-11-15)
- [x] Resumen: una acción principal ("Empezar" / "Continuar entreno"),
      "Esta semana" en una fila, una gráfica, últimas sesiones en lista
      agrupada; grupos, marcas, calendario y peso tras "Más estadísticas".
- [x] Sin barra de marca global; idioma y "Tus datos" movidos a Perfil.
- [x] Sesión activa: ejercicio actual primero; los demás en filas de una
      línea; cabecera de columnas única; sin X por serie (quitar la última);
      "¿Máquina ocupada?" plegado; añadir/sugerir/detalles al final.
- [x] Barra fija con UNA acción principal ("Siguiente ejercicio" →
      "Terminar y guardar"); "Terminar" como secundaria.
- [x] Iconos de pausa/reanudar/cerrar dibujados (antes salían como □).
- [x] i18n: +16 claves (275) en los 4 bundles y espejos.
- [ ] Paridad web: llevar el mismo Resumen y la misma sesión a
      `web/src/pages/dashboard.astro` y `session.astro`.
- ⛔ Capturas 01–09 y vídeo: hace falta `cd app && npm install` con red
      (faltan `react-native-linear-gradient` y `@expo/metro-runtime`).
- [ ] Revisión en iPhone real (Expo Go) de la nueva sesión.

### Fase 12 — Añadir datos
- [ ] **Cardio como ejercicio**: los 12 ejercicios de cardio existen pero se
      registran como reps × kg. Registrar por **tiempo** (y distancia
      opcional); poder elegir cardio en el asistente y en "Añadir
      ejercicio"; contar los minutos de cardio en el Resumen.
      *Decisión pendiente del usuario: campos exactos (minutos, km, ritmo,
      nivel).*
- [ ] **Valoración al terminar la sesión**: tras "Terminar y guardar", una
      hoja opcional con energía del día y cómo te has sentido; botón
      "Guardar" y botón "Omitir" (guardar la sesión no depende de ella).
      Guardar en la sesión (`energy?`, `feeling?`) y mostrarlo en Historial.
- [ ] **Perfil con datos fijos**: idioma ✔ (hecho en 11b), peso ✔, altura ✔.
      *Decisión pendiente del usuario: qué otros datos (p. ej. año de
      nacimiento, sexo, nivel de experiencia, objetivo).*
- [ ] Paridad web de los tres puntos + tests de paridad TS ≡ JS del
      modelo de sesión.

### Fase 13 — Fotos de los ejercicios
- [ ] 3 imágenes por ejercicio (226 × 3 = 678) que muestren cómo se hace,
      con flechas o círculos en lo importante. Referencia de estilo:
      `data/images/ejemplo/` (3 imágenes de ejemplo generadas con IA).
- ⛔ Desde esta sesión no se pueden generar imágenes fotorrealistas: hace
      falta un servicio de generación de imágenes (con clave y coste) o un
      banco de fotos con licencia. Decidir la vía con el usuario.
- [ ] Al aplicarlo: actualizar `image` (pasa a lista de 3), detalle con
      carrusel, `source_note` declarando que son generadas (regla de oro).

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
- [ ] Recrear los harnesses de Chromium (los de `/tmp/qa` se perdieron) en
      `app/qa/` y versionarlos.
- [ ] Hoja de valores: añadir "+/−" fino para pesos fuera de la rejilla.

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

## Probar en el host (guía en README.md)
- Web: `cd web && npm ci && npm run build && npm run preview -- --host`
- App: `cd app && npm ci && npx expo start` + Expo Go (QR) en Android/iPhone
