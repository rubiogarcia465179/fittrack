# SPEC — FitTrack

App de gimnasio para el iPhone: empiezas a entrenar en dos toques, haces el
entreno ejercicio a ejercicio con descansos guiados y ves tu progreso. Sin
cuenta y sin servidor: todo se guarda en el teléfono.

Este documento dice **qué** debe ser el producto (la visión del usuario). El
**cómo** está en el código; el **estado** en `PROGRESS.md`; lo **pendiente**
y el orden de trabajo en `TASKS.md`; las reglas de trabajo en `CLAUDE.md` y
`AGENTS.md`.

## 1. Visión y principios (del usuario)

- **"En la intersección entre la alta tecnología y el arte."** Simple y
  elegante; la primera pantalla tiene que ser increíble.
- **Lo mínimo de toques.** Una pantalla, un trabajo, una acción principal;
  lo demás discreto o plegado.
- **Se juzga como una versión 2.0**: el conjunto actual de funciones
  (temas, banderas, marcas, histogramas, asistente…) es deseado; el recorte
  para una 1.0 mínima está aparcado en `docs/FOCO-1.0.md`.
- **Referencias de diseño:** la app de X (Twitter) en iOS para el estilo
  (negro puro, blanco, gris, separadores finos, barra inferior), y Apple /
  Tesla para la composición (estado arriba, foco, cero ruido).
- **Monocromo por defecto (tema Noche):** fondo negro, texto blanco,
  secundario gris. **Botones blancos con texto negro.** Otros temas
  elegibles en Perfil (ver Perfil). Lo marcado (días entrenados, series hechas,
  selección, marcas) en blanco con texto negro. Sin naranja, sin verde; el
  rojo solo en confirmaciones destructivas.
- **Sin reloj ni batería** en ninguna pantalla.
- **Durante el entreno, solo el ejercicio actual**; el resto en una línea.
- **Prueba "Steve Jobs"** antes de cada versión (ver `CLAUDE.md §2`).
- **Nada inventado se presenta como real** (datos de wger con atribución;
  lo generado localmente o con IA, declarado).
- **Offline y privado.**

## 2. Pantallas (app Expo)

Barra inferior estilo X: ancho completo, negra, línea fina arriba, **solo
iconos** (nombre en accesibilidad). Pestañas:

| Pestaña | Trabajo | Acción principal |
|---|---|---|
| **Inicio** | Ver la semana y empezar | "Empezar sesión" |
| **Ejercicios** | Consultar la biblioteca | Buscar → detalle |
| **Sesión** | Entrenar | "Siguiente ejercicio" → "Terminar y guardar" |
| **Historial** → futuro **InstaGym** | Revisar sesiones | Abrir una sesión |
| **Perfil** | Tus datos y ajustes | Registrar peso / altura |

### Inicio (portada, sin título)
1. Foto de cabecera insertada (como la imagen de un post); **el usuario puede
   poner la suya** ("Cambiar foto"). Sin fecha, sin "sesiones esta semana"
   ni racha (se ven en el calendario).
2. (sin bloque de estado)
3. **"Empezar sesión"** (blanco) → **hoja "Tu entreno de hoy"**: duración
   (30/45/60/75 min), intensidad (suave/moderada/fuerte), **energía de hoy**
   (baja/normal/alta; baja = intensidad un nivel menos) y objetivo (crear
   músculo, perder peso, fuerza, perder grasa, definición, resistencia) →
   **"Continuar al entreno"** genera el plan para el bloque de grupos menos
   entrenado (empuje / tirón / pierna). Recuerda la última elección.
   Con un entreno en curso: "Continuar entreno".
4. "Personalizar entreno" → asistente completo.
5. **Marcas personales**: las 3 mejores (1RM estimado, Epley, de la mejor
   serie o del benchmark) en tarjetas blancas; "Ver todo" despliega el resto.
6. **Calendario** del mes (lunes primero, círculos): días entrenados con el
   acento, hoy con anillo, leyenda "Día entrenado · N".
7. Filas: peso corporal (→ Perfil) e historial (→ Historial).
8. **Actividad**: histogramas de la hora del entreno (franjas de 3 h) y del día
   de la semana.
- Sin volumen (decisión del usuario).
- Futuro (Fase 15): tocar un día del calendario abre esa sesión en InstaGym.

### Sesión
- **Cabecera**: cerrar (descartar con confirmación) · "Sesión" + "x/y
  series hechas" · línea fina de progreso debajo.
- Tres accesos rápidos en círculo: **Añadir ejercicio**, **Sugerir**
  (mismo grupo que el actual), **Detalles** (fecha, duración, peso, altura,
  notas).
- **Ejercicio actual** (tarjeta): TÍTULO en mayúsculas, grupo (+ material si
  no es "otro") y 1RM estimado; filas `nº · reps · kg · Hecha` (tocar un
  valor abre una hoja de valores); añadir / quitar última serie;
  "¿Máquina ocupada?" → Ocupado / Fuera de servicio (el ejercicio se
  **aplaza** y se ofrecen alternativas con su propio peso); "Quitar
  ejercicio".
- **Cardio**: `nº · min · km · intensidad · Hecha` y kcal estimadas (METs).
- **Resto de ejercicios**: filas planas (icono de línea, TÍTULO, resumen
  `3 × 10 · 20 kg` o `20 min · 3 km`, series hechas, chevron).
- **Descanso**: al marcar una serie de fuerza empieza la cuenta atrás del
  plan (`rest_after`, 90 s por defecto) en la barra fija, con "+15 s" y
  "Saltar"; vibra al terminar. Sobrevive a cambiar de pestaña.
- **Barra fija**: a mitad → "Terminar" (contorno) + **"Siguiente
  ejercicio"** (blanco); en el último → **"Terminar y guardar"**.
- **Al terminar**: hoja opcional "¿Cómo ha ido?" (energía y sensación 1–5)
  → "Guardar sesión" o "Finalizar sin valorar".
- **Arranque manual** (pestaña Sesión sin entreno): "Recomiéndame un
  entreno" (asistente) o "Añado mis datos yo" (sesión en blanco).
- **Asistente**: tipo (entreno / benchmark) → objetivo → grupos → duración
  → material → revisión. Pesos: benchmark > histórico > base prudente por
  material (nunca 0 kg si el ejercicio lleva carga).
- **Benchmark**: 1RM estimado o manual; alimenta los pesos futuros.

### Ejercicios
- 226 ejercicios (wger), búsqueda y filtros (grupo, material); lista plana
  con icono de línea por grupo (sin imágenes placeholder).
- Detalle: nombre, grupo, material, nivel, instrucciones, licencia/autor.
- Futuro: explicación, músculo que más trabaja, por qué se usa y favoritos
  de atletas con cita verificable (Fase 14); 3 fotos por ejercicio (Fase 13);
  nombres en el idioma de la app.

### Historial (→ InstaGym, Fase 15)
- Hoy: lista por fecha con ejercicios, series (cardio en min/km/intensidad)
  y valoración; borrar con confirmación.
- Futuro **InstaGym**: feed tipo Instagram con cada sesión (resumen) y sus
  **fotos y comentarios**.

### Perfil
- **Sobre ti**: sexo, año de nacimiento, nivel, objetivo principal.
- Peso (registrable aquí o en la sesión) y altura, con tendencia e IMC.
- **Calorías diarias**: Mifflin-St Jeor × factor de actividad deducido de
  las sesiones de las últimas 4 semanas (estimación ±10 %, no médica).
- **Tema**: Noche (negro/blanco, por defecto), Día (inverso), Ámbar (azul
  medianoche/ámbar), Neón (violeta/lima), Rubí (verde/coral).
- **Nacionalidad** (20 países) y, aparte, interruptor "Usar los colores de mi
  país" → la app toma los colores de la bandera (solo colores, nunca
  emblemas; legibilidad primero).
- Explicación sencilla de metabolismo basal vs gasto diario.
- Ajustes: idioma (NL/ES/EN/FR, nombres completos) y Tus datos (exportar
  JSON / borrar todo con confirmación).

## 3. Datos

- `data/exercises/all.json` → 226 ejercicios: `id, name_en, name_nl,
  aliases, muscle_group, secondary_muscles, equipment, level, instructions,
  image, source, license, credit`. Lista legible: `docs/EJERCICIOS.md`.
- Sesión: `{ id, date, type: training|benchmark, exercises: [{ exercise_id,
  sets: [{ reps, weight_kg, done?, duration_min?, distance_km?,
  intensity? }] }], notes?, duration_min?, body_weight_kg?, height_cm?,
  energy?, feeling? }`.
- Entreno activo (`fittrack.active.v1`): borrador + aplazados + descanso en
  curso (`rest_until`, `rest_total`).
- Perfil: `benchmarks[]`, `height_entries[]`, `weight_entries[]`,
  `experience`, `sex?`, `birth_year?`, `goal?`.
- Última elección de la hoja de inicio: `fittrack.quickstart.v1`.
- Persistencia: AsyncStorage (app) / localStorage (web). Sin backend.

## 4. Idiomas

NL, ES, EN, FR. `i18n/` con espejos idénticos en `app/src/i18n-data/` y
`web/src/i18n/`; mismo nº de claves en los 4.

**Todo lo escrito cambia al idioma elegido, al instante y sin red**: interfaz,
nombres de ejercicio, pasos "¿Cómo se hace?" (un dataset por idioma en
`data/exercises/howto/`), grupos y músculos, fechas y meses. Nada visible en
otro idioma salvo unidades (kg, min, km, reps).

## 5. Calidad (criterios de aceptación)

- `tsc` 0 errores, `node tests/run.js` 0 fallos, export web OK.
- Capturas (`docs/screenshots/`) y vídeo regenerados y revisados en cada
  commit; prueba "Steve Jobs" = **sí** antes de commitear.
- Accesibilidad: etiquetas y roles en todo control, objetivos ≥ 44 pt,
  contraste AA, iconos dibujados (nada de glifos "tofu").
- Sin desbordes de 360 a 440 px.

## 6. Hoja de ruta (orden en `TASKS.md`)

1. Cerrar la prueba "Steve Jobs" (Fase 11d).
2. Fase 15 — InstaGym (fotos y comentarios por sesión; calendario → sesión).
3. Fase 14 — Biblioteca con explicaciones, favoritos citados y nombres
   traducidos.
4. Fase 13 — Fotos de ejercicios (las genera el usuario; prompts listos).
5. Paridad de la web (Astro) con la app.
6. Fase 7 — Sync en la nube (Supabase): en espera.

## Fuera de alcance (por ahora)

Cuentas y backend, sincronización entre dispositivos, dieta, Apple Health /
Google Fit, notificaciones, Apple Watch.
