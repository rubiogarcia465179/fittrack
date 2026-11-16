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
- **Versión "Foco a 10"** (2026-11-15, rama `SteveJobs` → `main`): 3
  pestañas, Inicio que dice qué toca hoy, lo raro plegado. La versión
  anterior (5 pestañas, asistente) queda en la rama `v1`. Detalle en
  `docs/FOCO-1.0.md`. La prueba Jobs se pasa como producto completo (2.0).
- **Referencias de diseño:** la app de X (Twitter) en iOS para el estilo
  (negro puro, blanco, gris, separadores finos, barra inferior), y Apple /
  Tesla para la composición (estado arriba, foco, cero ruido).
- **Monocromo por defecto (tema Noche):** fondo negro, texto blanco,
  secundario gris. **Botones blancos con texto negro.** Otros temas
  elegibles en Perfil (ver Perfil). Lo marcado (días entrenados, series hechas,
  selección, marcas) en blanco con texto negro. Sin naranja; **el verde solo
  para récords** (día de récord, serie récord, punto en el resumen); el rojo
  solo en confirmaciones destructivas.
- **Guía de UX reutilizable**: `docs/UX-PLAYBOOK.md` (principios, sistema
  de diseño, patrones, lista del "no" y un prompt único para otra app).
- **Sin reloj ni batería** en ninguna pantalla.
- **Durante el entreno, solo el ejercicio actual**; el resto en una línea.
- **Prueba "Steve Jobs"** antes de cada versión (ver `CLAUDE.md §2`).
- **Nada inventado se presenta como real** (datos de wger con atribución;
  lo generado localmente o con IA, declarado).
- **Offline y privado.**

## 2. Pantallas (app Expo)

Barra inferior estilo X: ancho completo, negra, línea fina arriba, **solo
iconos** (nombre en accesibilidad). **3 pestañas**:

| Pestaña | Trabajo | Acción principal |
|---|---|---|
| **Inicio** | Saber qué toca hoy y empezar | "Empezar sesión" |
| **Entrenar** | Hacer el entreno | "Siguiente ejercicio" → "Terminar y guardar" |
| **Perfil** | Tus datos y ajustes | Registrar peso / altura |

Historial y Ejercicios **no son pestañas**: se abren desde filas de Inicio,
con barra "‹ Inicio" arriba (Inicio sigue marcado en la barra).

### Inicio (portada, sin título)
1. **Tu foto**, solo si la eliges en Perfil → "Apariencia" (auténtico o nada:
   sin foto de stock).
2. **"Hoy toca: <grupos>"** (p. ej. "Piernas y core"): el bloque de grupos
   (empuje / tirón / pierna) que hace más tiempo que no entrenas — el mismo
   que generará la hoja. Debajo, el objetivo y la duración que se usarán
   ("Crear músculo · 45 min"). Si ya entrenaste hoy, la etiqueta dice
   **"Próxima"** en vez de "Hoy toca". **"Cambiar"** pasa al siguiente bloque con un
   toque (por defecto no hay que decidir nada: cero fatiga de decisión).
   **Lunes**: el empuje (pecho) va al final, porque en muchos gimnasios es "el
   día de pecho" y los bancos se llenan (convención popular, explicada en una
   línea solo cuando cambia la propuesta). Con un entreno en curso: "Entreno
   en curso".
3. **"Empezar sesión"** (blanco) → **hoja "Tu entreno de hoy"**: duración
   (30/45/60/75 min), intensidad (suave/moderada/fuerte), **energía de hoy**
   (baja/normal/alta; baja = intensidad un nivel menos) y objetivo (crear
   músculo, perder peso, fuerza, perder grasa, definición, resistencia) →
   **"Continuar al entreno"** genera el plan. Recuerda la última elección.
   Con un entreno en curso: "Continuar entreno". **Un solo camino para
   empezar** (sin asistente ni "Personalizar entreno").
4. **Marcas personales**: las 3 mejores (1RM estimado) en tarjetas blancas;
   "Ver todo" despliega el resto. **Salen siempre de datos**: la mejor serie
   guardada (Epley) o el test "Establecer marcas"; gana el mayor.
   **Primer arranque** (sin marcas): tarjeta "Empieza por tus marcas" con
   **"Establecer marcas"** (test con los 5 clásicos: press de banca,
   sentadilla, peso muerto, press militar, curl con barra; calentamiento al
   60 % + serie de test, máx. 12 reps; el 1RM estimado fija los pesos).
5. **Calendario** del mes (lunes primero, círculos): días entrenados con el
   acento, **días de récord en verde llamativo** (`#00E676`, texto negro),
   hoy con anillo; leyenda "Día entrenado · N · Récord · N". Un día de récord
   = una sesión que supera la marca previa (la primera vez no cuenta).
   **Tocar un día entrenado abre el Historial de ese día** (con "Ver todas").
6. Filas: **Historial** ("N sesiones este mes") y **Ejercicios** ("226
   ejercicios, con cómo se hacen").
- Sin fecha, sin racha, sin volumen (decisiones del usuario).
- **Sin cuerpo 3D** (2026-11-15): la prueba Jobs lo suspendió (cadáver sin
  piel en la portada, choca con el estilo, quita foco). Vive en la rama
  `cuerpo-3d` (modelo anatómico Z-Anatomy) para retomarlo si se rediseña.

### Entrenar (sesión)
- **Cabecera**: cerrar (descartar con confirmación) · "Sesión" + "x/y
  series hechas" · línea fina de progreso debajo.
- **Añadir ejercicio**: con la lista vacía, círculo arriba (y **Sugerir**);
  con ejercicios, una línea de texto "+ Añadir ejercicio" al final de la lista
  (el ejercicio actual manda). Los detalles (fecha, duración, peso, altura, notas) van al
  final, en la hoja "¿Cómo ha ido?".
- **Ejercicio actual** (tarjeta): título en minúsculas y negrita, grupo (+ material si
  no es "otro") y 1RM estimado **de las series hechas** (sin contador "1/3");
  **progresión**: si la última vez (≤ 21 días) completaste todas las reps con
  W, hoy propone W + 2,5 kg con una línea gris "+2,5 kg · la última vez 3 × 8
  con 50 kg · **Mantener 50 kg**" (un toque vuelve a W; desaparece al hacer la
  primera serie; con energía baja, W sin línea); **"¿Cómo se hace?"** (fotos —de ejemplo,
  marcadas, hasta la Fase 13—, qué entrena y 3 pasos para principiantes);
  filas `nº · reps · kg · Hecha` (tocar un valor abre la **rueda** tipo
  alarma del iPhone: sin "Usar", el botón blanco muestra el valor; "Escribir"
  para números grandes; altura con cm / m). **El peso elegido se copia a las
  series pendientes siguientes.** **Récord en directo**: si una serie hecha
  supera tu marca (1RM, misma regla que el calendario), su número pasa a un
  círculo verde, la cabecera dice "Récord · 1RM ≈ X kg" y vibra una vez.
  **Una serie se da por hecha sola al indicar reps y peso** (cardio: minutos);
  el ✓ solo se activa cuando la serie está completa. **Sin datos de peso**
  (ni marca ni histórico) se muestra **"—"**: la app no inventa pesos;
  añadir / quitar última serie; **"Más opciones"** plegado: Sugerir
  ejercicio (mismo grupo) · ¿Máquina ocupada? → Ocupado / Fuera de servicio
  (se **aplaza** y se ofrecen alternativas con su propio peso; sus series ya
  hechas **se guardan y cuentan**; "Usar" / "Hacerlo ahora" lo convierten en
  el ejercicio actual) · Quitar ejercicio (con series hechas pide
  confirmación: "Cancelar | Quitar"). "Quitar serie" solo quita series
  **pendientes**. Pesos en múltiplos reales de disco (2,5 / 5 kg). En el
  test de marcas la 2.ª serie se rotula **"Test"** y el 1RM es texto.
- **Cardio**: `nº · min · km · intensidad · Hecha` y kcal estimadas (METs).
- **Resto de ejercicios**: filas planas (icono de línea, TÍTULO, resumen
  `3 × 10 · 20 kg` o `20 min · 3 km`, series hechas, chevron).
- **Descanso**: al marcar una serie de fuerza empieza la cuenta atrás del
  plan (`rest_after`, 90 s por defecto) en la barra fija, con "+15 s" y
  "Saltar" (tras la **última** serie del entreno no hay descanso); al terminar, **vibración clara** (dos pulsos + háptico).
  Sobrevive a cambiar de pestaña. Futuro (⛔): estado y cuenta atrás en la
  pantalla de bloqueo (Live Activity / notificación) con "Serie hecha".
- **Barra fija**: a mitad → "Finalizar" (contorno) + **"Siguiente
  ejercicio"** (blanco); en el último → **"Finalizar"** (en todos los modos,
  también en Marcas). **Sin leyenda "Siguiente: X"** (el siguiente ya es la
  fila de debajo). La × pide confirmación ("Cancelar | Descartar"; el
  fondo bloquea y tocarlo cancela) **solo si hay series hechas**; sin
  ninguna, cierra sin preguntar.
- **Al terminar**: hoja **"Bien hecho"** (título grande) dentro de la
  pantalla (no un Modal) con el **resumen**: minutos · series hechas · récords (si los hay, con una
  fila por récord "1RM 73 kg (antes 68)" y punto verde; **los minutos se
  tocan para corregirlos** con la rueda) + "Cómo te has
  sentido" (1–5, opcional) → un solo botón **"Finalizar"**. La energía no se
  repregunta (viene de la hoja de inicio). **Solo se guardan las series
  hechas**; sin ninguna hecha, "Finalizar" ofrece descartar. **Fecha,
  duración, peso y altura se rellenan solos**. Tras guardar (o descartar) la
  app **vuelve a Inicio**, donde se ve el día marcado y las marcas al día.
- **Sin entreno en curso**: "Recomiéndame un entreno" (abre la misma hoja
  rápida) o "Añado mis datos yo" (sesión en blanco).
- Pesos: con histórico reciente manda lo levantado (progresión); si no,
  marca efectiva (test + mejores series); sin datos, "—" (decisión del usuario
  2026-11-15: nada de pesos inventados). Series/reps/descanso según el **objetivo**
  (`GOAL_SCHEME`).

### Ejercicios (desde Inicio)
- 226 ejercicios (wger), búsqueda y filtros (grupo, material; fichas
  monocromo, la elegida en blanco); lista plana con icono de línea
  **distinto por grupo** y nombres en 2 líneas.
- Detalle ("‹ Ejercicios"): nombre, músculo principal y secundarios
  (traducidos), material, nivel y pasos en el idioma elegido; nada en otro
  idioma. Las
  licencias y autores van una sola vez al pie de Perfil.
- Futuro: por qué se usa y favoritos de atletas con cita verificable
  (Fase 14); 3 fotos por ejercicio (Fase 13).

### Historial (desde Inicio → futuro InstaGym, Fase 15)
- Lista por fecha (localizada: "dom 15 nov") con ejercicios, series (cardio
  en min/km/intensidad) y valoración; borrar con confirmación. Desde un día
  del calendario: solo ese día + "Ver todas".
- Futuro **InstaGym**: feed tipo Instagram con cada sesión y sus **fotos y
  comentarios**.

### Perfil (4 tarjetas)
1. **Cuerpo**: peso y altura juntos (cada uno con "+ Registrar"), IMC,
   evolución del peso y **calorías diarias** (un número; "¿Qué es esto?"
   despliega el metabolismo basal, la explicación y el método: Mifflin-St
   Jeor × actividad de las últimas 4 semanas; estimación ±10 %, no médica).
2. **Sobre ti**: sexo, año de nacimiento, nivel y **objetivo principal**
   (crear músculo, fuerza, perder grasa, perder peso, definición,
   resistencia; decide series, reps y descanso — `GOAL_SCHEME` — y es el que
   muestra "Hoy toca").
3. **Apariencia**: **Noche** (por defecto) · **Día** (inverso); **Foto de
   Inicio** opcional (Elegir / Cambiar / Quitar).
4. **Ajustes**: idioma (NL/ES/EN/FR) y tus datos (exportar JSON / borrar
   todo con confirmación).
- Al pie, plegado: **"Licencias y créditos"** (wger CC BY-SA / CC0 y sus
  autores; pasos y traducciones de FitTrack; imagen de ejemplo generada con
  IA).
- Las marcas viven en Inicio ("Ver todo"), no en Perfil. Sin nacionalidad ni
  temas extra (Ámbar, Neón, Rubí, banderas): quitados en la Fase 11i por foco
  (el código de temas sigue en `theme.ts` / `theme-flags.ts`, sin UI).

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
- Foto de Inicio (opcional): `fittrack.homephoto.v1` (data URL).
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
