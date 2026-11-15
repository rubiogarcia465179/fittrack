# Foco a 10 — versión simplificada (aplicada, sin commit)

> **Estado (2026-11-15, noche): APLICADO en el árbol de trabajo, SIN COMMIT**,
> a petición del usuario ("aplícalo para ver cómo queda", "que sea una versión
> mejorada" y "simplifica Perfil e Inicio"). Último commit sin el recorte:
> `37d851e`. Si el usuario lo aprueba → commit; si no →
> `git checkout -- . && git clean -fd app/src docs/screenshots` (revisar antes) vuelve a `37d851e`.

## Lo aplicado (mejorado respecto a la propuesta)

- **3 pestañas**: Inicio · Entrenar · Perfil. Historial y Ejercicios se abren
  desde filas de Inicio con barra "atrás" (`BackBar`); Inicio sigue marcado.
- **Inicio**: sin foto de stock (decisión "auténtico o nada"); arriba
  **"Hoy toca: <grupos>"** (`lib/nextSplit.ts`, el mismo cálculo que la hoja
  rápida) + "Empezar sesión"; marcas; calendario (**tocar un día abre el
  Historial de ese día** con "Ver todas"); filas Historial y Ejercicios; un
  solo gráfico (hora del entreno). Tu foto aparece solo si la eliges en Perfil.
- **Un solo camino para empezar**: sin "Personalizar entreno" ni asistente;
  "Recomendado" en Entrenar abre la misma hoja rápida.
- **Sesión**: accesos "Añadir ejercicio" y "Detalles" (centrados);
  "Sugerir ejercicio", "¿Máquina ocupada?" y "Quitar ejercicio" dentro de
  **"Más opciones"** en la tarjeta.
- **Perfil** en 6 tarjetas: Cuerpo (peso y altura juntos + IMC + evolución),
  Calorías (un número + "¿Qué es esto?"), Sobre ti, **Apariencia** (Noche ·
  Día · Más → Ámbar/Neón/Rubí y bandera; Foto de Inicio opcional), Idioma,
  Tus datos.
- Código conservado pero sin uso: `WorkoutBuilderScreen` (asistente) y las
  claves `home_customize`, `home_by_weekday`.

## Propuesta original

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
