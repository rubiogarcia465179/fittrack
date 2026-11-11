# FitTrack — Capturas (iPhone 16, 393×852)

Capturas reales del build web de producción (`expo export --platform web`),
generadas con Chromium real (viewport iPhone 16) durante el QA. V1: datos
solo locales, Montserrat embebida, sin red.

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Dashboard | Resumen con datos: stats, actividad (sin scroll), gráfico, últimas sesiones, marcas |
| 02 | Arranque de sesión | Dos caminos claros: "Recomiéndame un entreno" / "Añado mis datos yo" |
| 03 | Wizard — objetivo | Paso a paso: cada objetivo define su esquema series×reps (músculo 3×10·90s, fuerza 4×5·150s, …) |
| 04 | Wizard — revisión | Plan generado con pesos desde benchmarks + botón "Empezar entrenamiento" |
| 05 | Sesión activa | Tema navy con degradado, progreso "0/18 series hechas", tarjeta **ACTUAL** (AHORA + "Siguiente: …"), sugerir/añadir |
| 06 | Sesión con foco | Flujo "ejercicio actual": el 2º ejercicio en foco, el 1º atenuado con botón "Ir allí", serie "Hecha" + serie añadida |
| 07 | Picker de valor | Hoja inferior: handle, rejilla responsiva de chips (sin overflow), confirmación abajo |
| 08 | Detalles | Campos secundarios plegados/expandibles: fecha, duración, peso corporal, altura, notas (cajas del mismo tamaño) |
| 09 | Perfil | 5ª pestaña: peso corporal (de las sesiones) + altura con tendencia y "Registrar" — opcional |

**Video** — `video-iphone16.mp4` (H.264) y `video-iphone16.webm` (VP9): grabación
de 34 s (iPhone 16, 393×852) del flujo completo: dashboard → biblioteca →
detalle → arranque → wizard paso a paso → sesión activa (navy degradado) →
**"Acabar ejercicio"** (flujo de ejercicio actual: la app indica el siguiente
y aténúa los demás) → hoja de reps → marcar "Hecha" → añadir serie → sugerir
del mismo grupo muscular → guardar → historial → resumen.

Nota: las capturas se renuevan en cada batería de QA (ver `REQUIREMENTS.md`, R-26).
