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
| 05 | Sesión activa | Tema navy (estado activo), progreso "0/18 series hechas", sugerir/añadir ejercicio |
| 06 | Sesión con series | Filas de serie (reps/peso) con círculo "Hecha" (tap para marcar completada) |
| 07 | Picker de valor | Hoja inferior: handle, rejilla responsiva de chips (sin overflow), confirmación abajo |

Nota: las capturas se renuevan en cada batería de QA (ver `REQUIREMENTS.md`, R-26).
