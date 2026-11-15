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
- **Entreno activo** (tema navy):
  - Banner: cronómetro, series hechas, pausar, descartar (con confirmación).
  - Ejercicio actual (tarjeta completa): series en filas
    `nº · reps · kg · ✓`; tocar un valor abre una hoja de valores; añadir /
    quitar serie; enlaces discretos "¿Máquina ocupada?" y "Quitar ejercicio".
  - Otros ejercicios: una fila (nombre, `3 × 10 · 20 kg`, series hechas);
    tocar = pasar a ese ejercicio.
  - Máquina ocupada / fuera de servicio → el ejercicio se **aplaza** (no se
    borra) y la app ofrece alternativas del mismo grupo y patrón, con su
    propio peso; el usuario decide el ritmo.
  - Al final de la lista: "+ Añadir ejercicio", "Sugerir ejercicio" (mismo
    grupo que el actual) y "Detalles" plegado (fecha, duración, peso
    corporal, altura, notas).
  - Barra fija: a mitad → "Terminar" (secundario) + **"Siguiente
    ejercicio"**; en el último → **"Terminar y guardar"**.
  - El progreso solo cuenta series marcadas como hechas.
  - El entreno activo sobrevive a cambiar de pestaña y a cerrar la app.
- **Benchmark**: 1RM estimado (Epley, mejor serie) o manual; se guarda como
  marca y alimenta los pesos de futuros entrenos.

### Historial
- Lista por fecha con volumen, ejercicios y series; borrar con confirmación.

### Perfil
- Peso corporal (de las sesiones) y altura, con tendencia e IMC.
- Ajustes: **idioma** (NL / ES / EN / FR) y **Tus datos** (exportar JSON,
  borrar todo con confirmación).

## 3. Datos

- `data/exercises/all.json` → 226 ejercicios:
  `id, name_en, name_nl, aliases, muscle_group, secondary_muscles,
  equipment, level, instructions, image, source, license, credit`.
- Sesión: `{ id, date, type: training|benchmark, exercises: [{ exercise_id,
  sets: [{ reps, weight_kg, done? }] }], notes?, duration_min?,
  body_weight_kg?, height_cm? }`.
- Perfil: `benchmarks[]` (1RM por ejercicio), `height_entries[]`.
- Persistencia: AsyncStorage (app) / localStorage (web). Sin backend.
- Fórmulas: 1RM = peso × (1 + reps/30) (Epley); volumen = Σ reps × kg.

## 4. Idiomas

- NL, ES, EN, FR. Bundles en `i18n/` con espejos idénticos en
  `app/src/i18n-data/` y `web/src/i18n/`; todos con el mismo nº de claves.

## 5. Calidad (criterios de aceptación)

- Accesibilidad: etiquetas en todo control, objetivos ≥ 44 pt, contraste
  AA, sin glifos de fuente como iconos (se dibujan: nada de "tofu" □).
- Sin desbordes horizontales de 360 a 440 px de ancho.
- Verificación antes de "hecho": ver `AGENTS.md` → *Verificación*.

## 6. Hoja de ruta

- **Fase 12 — Más datos**: cardio con su propio registro, valoración
  opcional al terminar la sesión (energía y cómo te has sentido), más datos
  fijos en Perfil. Detalle en `TASKS.md`.
- **Fase 13 — Fotos de ejercicios**: 3 imágenes explicativas por ejercicio
  con flechas/círculos. Detalle en `TASKS.md`.
- **Fase 7 — Sync en la nube (Supabase)**: en espera.

## Fuera de alcance (por ahora)

Cuentas y backend, sincronización entre dispositivos, dieta/suplementos,
Apple Health / Google Fit, notificaciones.
