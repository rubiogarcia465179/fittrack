# Foco a 10 — recorte para una versión 1.0 (aparcado)

> **Estado: aparcado (2026-11-15).** El usuario decidió evaluar FitTrack como
> una **versión 2.0**, donde este número de funciones es aceptable. Esta lista
> se guarda por si algún día se quiere una edición mínima (1.0, "lite") o se
> necesita recortar. **No aplicar sin que el usuario lo pida.**

Origen: prueba `/stevejobs analyze` del 2026-11-15 (principio 1, "Focus =
saying no"; foco 4/10). Cada punto quita o esconde algo; ninguno añade.

## Propuesta

1. **3 pestañas** en vez de 5: Inicio · Entrenar · Perfil.
   - El Historial pasa al final del feed de Inicio (y después a InstaGym).
   - La Biblioteca se abre desde "Añadir ejercicio" y "¿Cómo se hace?" dentro
     de la sesión, no como pestaña.
2. **Un solo camino para empezar**: "Empezar sesión" → hoja rápida
   (`QuickStartSheet`). Quitar el asistente (`WorkoutBuilderScreen`) y el
   enlace "Personalizar entreno".
3. **Sesión con una sola tarea**: series, descanso y "Siguiente".
   "Sugerir ejercicio" y "¿Máquina ocupada?" (aplazar/alternativas) pasan a un
   menú "…".
4. **Marcas = una sola idea**: unir los benchmarks en "Marcas personales";
   quitar el histograma por día de la semana (dejar el de la hora, o ninguno).
5. **Temas**: Noche y Día visibles; Ámbar, Neón, Rubí y banderas detrás de
   "Más temas" (o fuera de la 1.0).
6. **Perfil corto**: calorías en una línea con "¿Qué es esto?" desplegable.

## Si se retoma

- Cada punto es independiente; hacerlos en este orden (el 1 y el 2 son los que
  más simplifican).
- Paridad web: los mismos recortes en `web/` (Astro).
- Regenerar capturas y vídeo (`app/qa/shots/scenario.js` cambia con las
  pestañas) y repetir la prueba Jobs.
