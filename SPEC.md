# SPEC — FitTrack

Monitor de entrenamiento de gimnasio para el móvil: eliges o generas un
entreno, lo haces ejercicio a ejercicio, y ves tu progreso. Sin cuenta y sin
servidor: todo se guarda en el dispositivo.

Este documento dice **qué** debe hacer el producto. El **cómo** está en el
código; el **estado** en `PROGRESS.md`; lo **pendiente** en `TASKS.md`.

## 1. Principios (no negociables)

1. **Una pantalla, un trabajo, una acción principal.** Todo lo demás es
   secundario (más discreto) o está plegado hasta que se necesita.
2. **Como una app de iPhone.** Pestañas abajo, título grande arriba, listas
   agrupadas, hojas inferiores para elegir valores, botones ≥ 44 pt.
   Referencia visual: apple.com y las apps nativas de iOS (Fitness, Salud).
3. **Durante el entreno, solo el ejercicio actual.** El resto, en filas de
   una línea.
4. **Nada inventado se presenta como real.** Datos de wger → `source:"real"`
   con atribución; lo generado localmente se declara (`source_note`, UI).
5. **Offline y privado.** 0 peticiones de red para usar la app (incluido el
   cambio de idioma).

## 2. Pantallas (app Expo; la web Astro ofrece lo mismo)

| Pestaña | Trabajo | Acción principal |
|---|---|---|
| **Resumen** | Ver cómo va la semana y empezar | "Empezar una sesión" / "Continuar entreno" |
| **Ejercicios** | Consultar la biblioteca | Buscar → abrir detalle |
| **Sesión** | Entrenar | "Siguiente ejercicio" → "Terminar y guardar" |
| **Historial** | Revisar sesiones pasadas | Abrir / borrar una sesión |
| **Perfil** | Datos personales y ajustes | Registrar peso / altura |

### Resumen
- Visible siempre: acción principal; **Esta semana** (sesiones · volumen kg ·
  días seguidos); gráfica de volumen de las últimas 4 semanas; últimas 3
  sesiones (lista) con "Ver todo" → Historial; nuevas marcas si las hay.
- Plegado en **Más estadísticas**: volumen por grupo muscular (7 días),
  marcas 1RM, calendario de actividad, peso corporal.
- Primer uso (sin sesiones): un mensaje y un botón, nada más.

### Ejercicios
- 226 ejercicios con búsqueda y filtros (grupo muscular, material).
- Detalle: nombre (EN/NL), grupo, material, nivel, instrucciones paso a
  paso, imagen y licencia/autor (CC-BY-SA).

### Sesión
- **Arranque**: dos caminos — "Recomiéndame un entreno" (asistente) o
  "Añado mis datos yo" (sesión en blanco).
- **Asistente** paso a paso: tipo (entreno / benchmark) → objetivo →
  grupos → duración → material (gym completo / mancuernas / peso
  corporal) → revisión del plan. Pesos sugeridos desde benchmarks >
  histórico > valor conservador por material; siempre editables.
- **Entreno activo** — tema **negro estilizado**: fondo con degradado
  carbón → negro (`#2A2A30 → #000000`), tarjetas `#1C1C1F`, acento naranja
  `#FF6A1F` y botón principal con **degradado naranja** (`#F55E14 →
  #B83A08`, texto blanco legible). Fuera del entreno, tema crema.
  - Banner: cronómetro, series hechas, pausar, descartar (con confirmación).
  - Ejercicio actual (tarjeta completa): series en filas
    `nº · reps · kg · ✓`; tocar un valor abre una hoja de valores; añadir /
    quitar serie; enlaces discretos "¿Máquina ocupada?" y "Quitar ejercicio".
  - **Cardio** (grupo `cardio`): filas `nº · min · km · intensidad · ✓`
    (intensidad suave / moderada / fuerte, se cambia tocando); kcal
    estimadas si hay peso corporal (METs del Compendium: 4 / 7 / 10).
  - Otros ejercicios: una fila (nombre, `3 × 10 · 20 kg` o `20 min · 3 km`,
    series hechas); tocar = pasar a ese ejercicio.
  - Máquina ocupada / fuera de servicio → el ejercicio se **aplaza** (no se
    borra) y la app ofrece alternativas del mismo grupo y patrón, con su
    propio peso; el usuario decide el ritmo.
  - Al final de la lista: "+ Añadir ejercicio", "Sugerir ejercicio" (mismo
    grupo que el actual) y "Detalles" plegado (fecha, duración, peso
    corporal, altura, notas).
  - Barra fija: a mitad → "Terminar" (secundario) + **"Siguiente
    ejercicio"**; en el último → **"Terminar y guardar"**.
  - **Al terminar**: hoja opcional "¿Cómo ha ido?" con energía del día y
    cómo te has sentido (1–5). "Guardar sesión" o "Finalizar sin valorar":
    guardar nunca depende de la valoración.
  - El progreso solo cuenta series marcadas como hechas.
  - El entreno activo sobrevive a cambiar de pestaña y a cerrar la app.
- **Benchmark**: 1RM estimado (Epley, mejor serie) o manual; se guarda como
  marca y alimenta los pesos de futuros entrenos.

### Historial
- Lista por fecha con volumen, ejercicios y series (cardio en min · km ·
  intensidad) y la valoración si la hay; borrar con confirmación.

### Perfil
- **Sobre ti** (todo opcional): sexo, año de nacimiento, nivel y objetivo
  principal. El asistente arranca con tu nivel y objetivo.
- Peso corporal (se registra aquí o en la sesión) y altura, con tendencia e
  IMC.
- **Calorías diarias**: metabolismo basal con la ecuación de
  **Mifflin-St Jeor** (peso, altura, edad, sexo; sin sexo → valor medio) ×
  factor de actividad deducido de las sesiones reales de las últimas 4
  semanas (1,2 / 1,375 / 1,55 / 1,725; 150 min de cardio/semana cuentan como
  una sesión más). Se muestra como estimación (±10 %), no consejo médico.
- Ajustes: **idioma** (NL / ES / EN / FR) y **Tus datos** (exportar JSON,
  borrar todo con confirmación).

## 3. Datos

- `data/exercises/all.json` → 226 ejercicios:
  `id, name_en, name_nl, aliases, muscle_group, secondary_muscles,
  equipment, level, instructions, image, source, license, credit`.
- Sesión: `{ id, date, type: training|benchmark, exercises: [{ exercise_id,
  sets: [{ reps, weight_kg, done?, duration_min?, distance_km?,
  intensity? }] }], notes?, duration_min?, body_weight_kg?, height_cm?,
  energy?, feeling? }` (cardio usa `duration_min`/`distance_km`/`intensity`
  con reps = kg = 0; `energy`/`feeling` de 1 a 5).
- Perfil: `benchmarks[]` (1RM por ejercicio), `height_entries[]`,
  `weight_entries[]`, `experience`, `sex?`, `birth_year?`, `goal?`.
- Persistencia: AsyncStorage (app) / localStorage (web). Sin backend.
- Fórmulas: 1RM = peso × (1 + reps/30) (Epley); volumen = Σ reps × kg.

## 4. Idiomas

- NL, ES, EN, FR. Bundles en `i18n/` con espejos idénticos en
  `app/src/i18n-data/` y `web/src/i18n/`; todos con el mismo nº de claves.

## 5. Calidad (criterios de aceptación)

- Accesibilidad: etiquetas en todo control, objetivos ≥ 44 pt, contraste
  AA, sin glifos de fuente como iconos (se dibujan: nada de "tofu" □).
- Sin desbordes horizontales de 360 a 440 px de ancho.
- Capturas y vídeo en `docs/screenshots/` actualizados en **cada commit**.
- Verificación antes de "hecho": ver `AGENTS.md` → *Verificación*.

## 6. Hoja de ruta

- **Fase 13 — Fotos de ejercicios**: 3 imágenes por ejercicio (226 × 3 =
  678), fotorrealistas, con flechas y círculos en lo importante, estilo de
  `data/images/ejemplo/`. Prompts listos en `docs/fotos/PROMPTS.md`; el
  usuario las genera y el agente las integra (carrusel en el detalle,
  declaradas como generadas con IA).
- Paridad web de las Fases 11b y 12. Detalle en `TASKS.md`.
- **Fase 7 — Sync en la nube (Supabase)**: en espera.

## Fuera de alcance (por ahora)

Cuentas y backend, sincronización entre dispositivos, dieta/suplementos,
Apple Health / Google Fit, notificaciones.
