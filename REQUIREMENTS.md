# FitTrack — Requisitos (trackable)

Documento de seguimiento de TODOS los requisitos dados por el usuario.
Estado: `[DONE]` = cumplido y verificado · `[TODO]` = pendiente.

Leyenda de verificación:
- **repo**: `tests/run.js` (paridad app↔web) — objetivo 0 fallos.
- **engine**: `node /tmp/qa/workout-test.js` — objetivo 0 fallos.
- **device**: harness Chromium (`flow-v3.js`, `devices.js`, `geometry.js`, …) — objetivo 0 fallos.
- **visual**: inspección por Playwright (overflow, colores) o screenshots.
- **manual**: pasos que puede repetir cualquier persona/agente en `http://localhost:8095/`.

Resumen rápido:
- **Entregado y verificado: R-01 … R-26.**
- **R-27 … R-35 (Fases 11b y 12)**: entregados.
- **R-37 … R-53 (Fases 11c/11d)**: la mayoría hechos, sin commit (prueba Jobs en NO); pendientes R-47…R-51.
- Pendiente: R-36 (fotos, Fase 13), paridad web; Fase 7 (Supabase) en espera.

---

## ENTREGADO (Fase 8 — commit `69d637b`, empujado a origin)

### R-01 [DONE] Task 1 — UI responsiveness y feedback
- Feedback inmediato en clics, selecciones, navegación, acciones de workout (press-scale + transiciones rápidas).
- Estados: pressed, selected, active, loading, success, disabled, error (toasts, no popups; nada dispara al hacer scroll).
- Confirmación clara al registrar series; guardado con estado de carga; doble-clic repetido no duplica.
- Verificación: `flow-v3.js` 0 fallos; `dup-verify.js` 0 fallos (re-tap de ejercicio = scroll al card, sin duplicar).

### R-02 [DONE] Task 2 — Sesión Benchmark
- Tipo de workout "Benchmark": elegir grupos → ejercicios sugeridos → registrar peso/reps.
- 1RM estimado (Epley) del mejor set o 1RM manual por ejercicio.
- Guardado en el perfil (`profile.benchmarks`), visible en dashboard ("Marcas") e historial; actualizable.
- Verificación: `flow-v3.js` sección B (1RM estimado ≈ 117, badge en historial, card "Marcas").

### R-03 [DONE] Task 3A — Generación inteligente
- Motor puro `lib/workout.ts`: pesos desde benchmarks → historial → conservador (nunca máximos),
  escalados por reps/intensidad; siempre sobrescribibles por el usuario.
- Cada ejercicio: nombre, grupo, peso recomendado, series×reps, descanso, duración estimada.
- Verificación: `workout-test.js` 32/32; `flow-v3.js` sección A (plan, modo mancuernas respeta el material).

### R-04 [DONE] Task 3B — Sustitución dinámica de ejercicio
- Alternativa mismo grupo/patrón, respeta modo de material, peso RECALCULADO (no copiado).
- El original se APLAZA (no se borra); series y progreso se conservan; se puede aceptar o pedir otra.
- Verificación: `flow-v3.js` sección C (alternativa ≠ original, entra al draft, progreso intacto).

### R-05 [DONE] Task 4 — Material (disponible / ocupado / fuera de servicio)
- Chips de estado por ejercicio; modos Full gym / Solo mancuernas / Solo peso corporal;
  0 kg para peso corporal. Verificación: `flow-v3.js` A+C; `workout-test.js` (filtrado por modo).

### R-06 [DONE] Task 5 — Doble tema + estado de workout activo
- Por defecto crema `#F3EEE3`; al iniciar: navy `#0E1730` con tipografía de alto contraste;
  banner "Workout active" persistente, pausa (ámbar), reanudar, descartar; al guardar/descartar → crema.
- Estado NO es solo color (texto + punto + indicador en tabbar).
- Verificación: `flow-v3.js` A (navy, pausa, reanudar); `refresh-v3.js` 0 fallos.

### R-07 [DONE] Persistencia del workout activo
- Sobrevive navegación entre pestañas Y recarga de página (AsyncStorage).
- Verificación: `refresh-v3.js` (refresh → sigue navy → guardar → crema).

### R-08 [DONE] Feedback a nivel de app
- Toasts de guardado/descarte que sobreviven al desmontar la pantalla; confirmaciones con modal
  propio (`ConfirmDialog`) — `Alert.alert` es no-op en este RN-web.

### R-09 [DONE] i18n (ES/EN/FR/NL)
- 203 claves por idioma; cambio instantáneo sin red; sync `i18n/` → `app/src/i18n-data/` vía `scripts/sync_data.py`.

### R-10 [DONE] Matriz de dispositivos (sin desbordes)
- iPhone 16/17/18/SE, Galaxy S24/S25, vertical + horizontal. Verificación: `devices.js` 0 fallos.

---

## ENTREGADO (pase actual — cambios en working tree, pendientes de commit)

### R-11 [DONE] Aplazado: SIN cuenta atrás, el usuario decide
- Quitada la cuenta de 10 min. Al marcar "Ocupado": el ejercicio se mueve a "Aplazados" y
  aparece al instante la primera sugerencia con "Usar". El usuario avanza con "Otra sugerencia"
  a su ritmo (intento 1, 2, 3…). Tras ~5 intentos, el ejercicio ORIGINAL vuelve a aparecer como
  opción con "Hacerlo ahora" (el usuario decide si lo hace). Sin temporizadores.
- Verificación: `flow-v3.js` sección C (0 fallos): aplaza → intento 1 → uso → intento 2 →
  original vuelve → "Hacerlo ahora" → vuelve al draft → progreso intacto.

### R-12 [DONE] Progreso real: solo cuenta lo completado
- Los valores prellenados (sugeridos) NO cuentan como "hechas". Cada serie tiene un círculo
  verde "Hecha" (tap para marcar/desmarcar) y las cajas de reps/peso pasan a verde al completarse.
- La barra y el "N/M sets done" del banner reflejan solo series marcadas (antes mostraba
  "9/15 hechas" al abrir, sin haber hecho nada).
- Verificación: `tsc --noEmit` 0; `flow-v3.js` 0 fallos. (Re-visual con screenshots en R-26.)

### R-13 [DONE] Fix interpolación i18n
- Los placeholders son `{{n}}` (delimitador por defecto de i18next); "intento {{n}}" ahora
  interpola. Verificado con el módulo i18next real.

---

## PENDIENTE (nuevos requisitos del pase actual)

### Flujo de sesión

### R-14 [DONE] Inicio de sesión: dos opciones claras
- Al abrir "Sesión" (sin workout activo), pantalla de arranque con DOS tarjetas grandes:
  "Recomiéndame un entreno" (abre el wizard R-17) y "Añado mis datos yo" (sesión en blanco
  con estructura de fecha/duración/notas). Sin asunciones; sin scroll.

### R-15 [DONE] Botón "Sugerir ejercicio" dentro de la sesión
- En cualquier sesión (manual o recomendada), un botón visible "Sugerir ejercicio" propone el
  siguiente ejercicio (según benchmarks/historial/material) con peso recomendado; se puede
  aceptar o descartar. Alternativa al buscar.

### R-16 [DONE] Borrar la sección redundante de "Elige un ejercicio"
- Hoy la sesión muestra SIEMPRE la búsqueda + lista completa de 226 ejercicios (causa del
  scroll excesivo). Quitarla: la búsqueda pasa a una hoja inferior (bottom sheet) que se abre
  bajo demanda (causada por el botón "Añadir ejercicio"/"Sugerir ejercicio").

### Generación paso a paso

### R-17 [DONE] Wizard paso a paso (pestaña nueva)
- En vez de un formulario largo, un asistente con UNO por pantalla (puntos de progreso,
  botón "Atrás", objetivos grandes, sin scroll):
  1) Entrenamiento / Benchmark
  2) **OBJETIVO**: crear músculo / perder grasa / definir / perder peso / fuerza / resistencia.
     Cada objetivo define su esquema series×reps (p. ej. músculo 3-4×8-12, grasa 3×15-20,
     fuerza 4-5×5, definición 3×10-12, perder peso 3×12-20 + más grupos, resistencia 2-3×20).
  3) Grupos musculares
  4) Duración + experiencia + intensidad
  5) Material
  6) Revisión del plan → Empezar

### R-18 [DONE] Motor: objetivo → esquema
- `generateWorkout()` acepta `goal` y usa su esquema de series/reps/descanso (hoy solo usa
  intensidad). Tests unitarios nuevos en `workout-test.js`.

### Visual "como si Apple lo hubiera hecho"

### R-19 [DONE] Montserrat
- Fuente Montserrat (Regular/Medium/SemiBold/Bold) empaquetada en el app (TTF oficiales vía
  relay SSH, offline), cargada en native (`expo-font`) y web (`@font-face`), aplicada a todo
  el texto. En el sandbox no hay acceso a Google Fonts; se valida con el build web.

### R-20 [DONE] Cajas estilo apple.com
- Radio 24px, borde hairline 1px, sombra suave, padding generoso, aplicado de forma UNIFORME a
  cards/chips/sheets. Corrige la fila de chips de 343px hardcoded del picker (desborda en 360px).

### R-21 [DONE] Picker de peso/valores (fix overflow)
- Ancho responsivo (sin overflow de contenido en cajas en ningún tamaño de pantalla), botón
  de confirmación siempre visible POR ENCIMA del teclado (el overflow inferior reportado),
  handle de arrastre, altura máx 85%.

### R-22 [DONE] Barra inferior estilo Instagram
- Sin etiquetas (solo iconos), hairline arriba, estados activos marcados con claridad
  (color + peso), espaciado uniforme, altura compacta.

### R-23 [DONE] Borrar la caja `gen_cta`
- El card naranja grande "Generate a personalized workout →" del dashboard se elimina
  (las entradas son: tile "Session" + pantalla de arranque R-14).

### R-24 [DONE] Mínimo scroll (regla de la abuela)
- Dashboard compacto: título + stats + actividad visibles sin deslizar; gráficos más bajos.
- Sesión compacta: filas de serie ajustadas, picker bajo demanda (R-16), registro sin scroll.
- Historial compacto. Verificado con midas de Playwright (contenidos visibles sin scroll
  en iPhone 16 y SE).
- Verificación: `fold.js`/`dash-scroll.js` — stats + actividad sin scroll (SE e iPhone 16);
  gráfico de grupos y marcas en segunda pantalla. Fix de barras que se subían al título del
  gráfico (BarChart: altura de plot reservada para valor + etiqueta).

### Verificación final

### R-25 [DONE] Batería completa + commit + push
- `tests/run.js` 78/78 · `workout-test.js` 43/43 (11 tests de objetivo) · `tsc --noEmit` 0 ·
  `expo export` OK.
- Chromium: `smoke-v1.js` 0 FALLOS (start→wizard→sesión→manual, 2 devices) + `refresh-v3` /
  `dup-verify` / `devices` / `geometry` / `dup-scroll2` / `wide-flow` → **0 FALLOS** (6 harnesses,
  6 dispositivos). Overflow horizontal: 0.
- Verificación: commit + push a origin/main.

### R-26 [DONE] Screenshots de iPhone en el repo
- `docs/screenshots/`: 7 capturas reales (build web en viewport iPhone 16 393×852) — dashboard
  con datos, arranque, wizard (objetivo + revisión con plan), sesión activa (tema navy), filas de
  serie con "Hecha", picker de valor — más README. Verificadas una a una.

## FASE 11b — Simplificación (2026-11-15)

Petición: "la pantalla al empezar la sesión estaba sobrecargada; quiero toda la funcionalidad
pero simple, como apple.com y las apps de iPhone".

### R-27 [DONE] Resumen con una sola acción principal
- "Empezar una sesión" / "Continuar entreno" siempre visible; "Esta semana" en una fila;
  una gráfica; últimas sesiones en lista; el resto tras "Más estadísticas".
- Verificación: repo ✔ · visual ✔ (capturas 01–02).

### R-28 [DONE] Ajustes en Perfil, sin cabecera global
- Idioma (nombres completos) y "Tus datos" en Perfil; cada pantalla con título grande.
- Verificación: repo ✔ · visual ✔.

### R-29 [DONE] Sesión centrada en el ejercicio actual
- Ejercicio actual completo; los demás en una línea; columnas únicas; sin X por serie;
  "¿Máquina ocupada?" plegado; añadir/sugerir/detalles al final.
- Verificación: repo ✔ · visual ✔ · iPhone real pendiente.

### R-30 [DONE] Una acción principal en la barra fija + iconos sin tofu
- "Siguiente ejercicio" → "Terminar y guardar"; "Terminar" secundaria; pausa/reanudar/cerrar
  dibujados.
- Verificación: repo ✔ · visual ✔.

## FASE 12 + tema negro (2026-11-15)

### R-31 [DONE] Tema de entreno negro con degradados
- Fondo carbón → negro y CTA con degradado naranja, en app y web. Verificación: visual ✔ (capturas 04–07).

### R-32 [DONE] Cardio: minutos + km + intensidad
- Registro, kcal estimadas, minutos en el Resumen, Historial. Verificación: repo ✔ (tests) · visual ✔ (06, 08).

### R-33 [DONE] Valoración opcional al terminar la sesión
- Energía y sensación 1–5; "Finalizar sin valorar". Verificación: repo ✔ · visual ✔ (07, 08).

### R-34 [DONE] Perfil con datos fijos + calorías diarias
- Sexo, año, nivel, objetivo, peso; Mifflin-St Jeor × actividad real. Verificación: repo ✔ (tests de fórmula) · visual ✔ (09, 10).

### R-35 [DONE] Capturas y vídeo en cada commit
- Harness `app/qa/shots/`; regla en `AGENTS.md`. Verificación: capturas 01–10 + mp4 de este commit.

### R-36 [TODO] Fotos de ejercicios (Fase 13)
- Prompts listos (`docs/fotos/PROMPTS.md`, 678). Pendiente: imágenes del usuario e integración.

## FASES 11c / 11d — Inicio, estilo X, prueba "Steve Jobs" (2026-11-15, sin commit)

### R-37 [DONE] Inicio sin volumen, sin título y con un botón directo
- "Empezar sesión" en la portada; nada de "RESUMEN" arriba; volumen fuera.
### R-38 [DONE] Calendario de días de entreno en Inicio
### R-39 [DONE] Marcas personales (PRs) resumidas en Inicio
- 3 mejores 1RM en tarjetas blancas + "Ver todo".
### R-40 [DONE] Hoja previa al entreno recomendado
- Duración, intensidad, energía de hoy, objetivo → "Continuar al entreno".
### R-41 [DONE] Estilo X monocromo en toda la app
- Negro puro, botones blancos con texto negro, calendario/marcas en blanco con texto negro.
### R-42 [DONE] Barra inferior como la de X
### R-43 [DONE] Sin hora ni batería en ninguna pantalla
### R-44 [DONE] Colores uniformes (sin mezcla verde/gris/naranja; sin texto naranja)
### R-45 [DONE] Temporizador de descanso entre series (feedback "Steve Jobs")
### R-46 [DONE] Detalles de confianza: nunca 0 kg, sin "Otro", pestaña localizada
### R-47 [TODO] Nombres de ejercicios en el idioma de la app (Fase 14)
### R-48 [TODO·⛔] Hápticos al marcar series (`expo-haptics`, aprobación)
### R-49 [DONE] Probar en iPhone real (usuario, 2026-11-15; ver R-68)
### R-50 [TODO] InstaGym: fotos y comentarios por sesión, feed tipo Instagram; calendario → sesión (Fase 15; ⛔ `expo-image-picker`)
### R-51 [TODO] Biblioteca: explicación, músculo, por qué se usa y favoritos de atletas con cita verificable (Fase 14)
### R-52 [DONE] Proceso: CLAUDE.md con prueba "Steve Jobs" antes de cada commit, capturas+vídeo, commits solo por fase y los 6 documentos actualizados en cada commit para traspaso a otro agente
### R-53 [DONE] `docs/EJERCICIOS.md` con los 226 nombres en inglés

## Pasada 2026-11-15 (noche, 2) — sin commit

### R-54 [DONE] Nombres de ejercicios traducidos (ES/FR) — cierra R-47
### R-55 [DONE] Inicio: foto + empezar arriba; sin fecha/semana/racha; calendario rediseñado; histograma de actividad al final
### R-56 [DONE·parcial] Foto propia en Inicio (web hecho; iPhone ⛔ `expo-image-picker`)
### R-57 [DONE] Temas en Perfil: inverso (Día) + 3 temas de dos colores opuestos (Ámbar, Neón, Rubí)
### R-58 [DONE] Nacionalidad (20 países) + opción aparte para usar los colores de la bandera como tema
### R-59 [DONE] Explicación sencilla de calorías diarias vs metabolismo basal
### R-60 [TODO] Explicación de cada ejercicio para principiantes (cómo se hace, músculos) — Fase 14
### R-61 [DONE] Skill `stevejobs` (`/stevejobs`, `/SteveJobs`): analyze · suggest · review · cut · keynote · ship

## Pasada 2026-11-15 (noche, 4) — sin commit

### R-62 [DONE] Todo lo escrito en el idioma elegido, con un dataset por idioma y cambio instantáneo — cierra R-60 (pasos)
- Pasos "cómo se hace" NL/ES/EN/FR (226 × 3) en `data/exercises/howto/`; fechas y meses localizados.
- Verificación: tests 115/115 (cobertura 4 × 226 + espejos), capturas 07 (ES) y 21 (NL).
### R-63 [DONE·aparcado] "¿Qué harías para subir el foco a 10?" → propuesta guardada en `docs/FOCO-1.0.md`; el usuario la aparca ("ignorar por ahora")
### R-64 [DONE] Iconos distintos por grupo muscular en biblioteca/historial/sesión (punto Jobs)
### R-65 [DONE] Nunca 0 kg en sentadilla trasera (bug de clasificación peso corporal)
### R-66 [DONE] La prueba Steve Jobs evalúa FitTrack como **versión 2.0** (este nº de funciones es aceptable) — regla en `CLAUDE.md §2.5`
### R-67 [DONE] Commitear aunque falten las fotos reales (la de ejemplo va marcada; Fase 13 sigue pendiente)
### R-68 [DONE] Prueba en iPhone real — hecha por el usuario (2026-11-15); cierra R-49
### R-69 [DONE] Cambiar la foto de Inicio desde Perfil y quitar "Cambiar foto" de Inicio
- Perfil → "Foto de Inicio": miniatura, "Cambiar foto", "Restablecer". Verificación: capturas 01 y 15.
### R-70 [DONE·sin commit] Aplicar el recorte "Foco a 10" (`docs/FOCO-1.0.md`) como versión mejorada, para verla y que pase la prueba Jobs — Jobs SÍ; esperando visto bueno
### R-71 [DONE·sin commit] Simplificar Perfil (6 tarjetas) e Inicio ("Hoy toca", filas, un gráfico)
### R-72 [DONE·sin commit] "¿Quitar la foto de Inicio o ponerla de fondo?" → quitada la de stock (auténtico o nada; de fondo resta contraste); tu foto solo si la eliges en Perfil

## Pasada 2026-11-15 (noche, 8)

### R-73 [DONE] Ramas: commitear la versión "Foco a 10" en `SteveJobs`, dejar la anterior en `v1`, fusionar `SteveJobs` en `main` y actualizar SPEC y AGENTS
### R-74 [DONE] "¿Y si no quiero Piernas y core hoy?" → "Cambiar" (un toque); propuesta por defecto sin decisiones
### R-75 [DONE] Evitar las horas punta típicas: el lunes (día de pecho) el empuje va al final, con una línea que lo explica
### R-76 [DONE] Confirmar que el objetivo (perder peso / ganar músculo) cambia series y reps → sí (`GOAL_SCHEME`); ahora se ve en "Hoy toca"
### R-77 [DROPPED] Máquinas Matrix de Basic-Fit en la base — el usuario lo descartó
### R-78 [DONE] Marcas personales: por defecto desde datos (sesiones) y test "Establecer marcas" desde Perfil con ejercicios típicos para compararse (press de banca, sentadilla, peso muerto, press militar, curl de bíceps)
### R-79 [DONE] Día de récord = círculo verde llamativo en el calendario
### R-80 [DONE] Mapa del cuerpo en Inicio: negro con contorno blanco; grupos de la semana 1 verde · 2 naranja · 3 rojo; hombre/mujer según Perfil; forma según IMC (mejor cerca del IMC sano)
### R-81 [DONE] Siluetas mucho más suaves, como arte → `react-native-svg` (aprobado) y curvas Bézier

## Pasada 2026-11-15 (noche, 9)

### R-82 [DONE] "3+ veces" ya no en rojo (se leía como alarma) → violeta `#BF5AF2`
### R-83 [DONE·parcial] `npm ci` de la web aprobado y hecho; build OK. Paridad web en pausa por el usuario
### R-84 [DONE] Imagen 3D en Inicio que el usuario puede girar para ver frente y espalda y qué músculos ha trabajado, usando las SVG de referencia (front.svg / back.svg)
### R-85 [DONE] Vibración del móvil al acabar el descanso
### R-86 [TODO·⛔] Durante la sesión, ver estado y cuenta atrás del descanso con el móvil bloqueado y marcar "hecho" desde ahí u otra app (Live Activity / notificación) — requiere build propia y dependencia nueva; decide el usuario
### R-87 [DROPPED] Basic-Fit — el usuario pidió olvidarlo

## Pasada 2026-11-15 (noche, 10)

### R-88 [DONE] Figura 3D que se gira con el dedo en cualquier ángulo, sin botones delante/detrás, como una cámara exterior — three + @react-three/fiber + expo-gl (aprobados)
### R-89 [TODO·⏸] Live Activity completa como funcionalidad futura (pantalla de bloqueo con estado, cuenta atrás del descanso y "Serie hecha") — en espera por decisión del usuario; sustituye a R-86

## Pasada 2026-11-15 (noche, 11)

### R-90 [DONE·rama] Cuerpo 3D "exactamente como la lámina" con músculos trabajados en color → écorché de Z-Anatomy (CC BY-SA), en la rama `cuerpo-3d`
### R-91 [DONE] Quitar el cuerpo de main y guardarlo en una rama aparte (prueba Jobs: no)
### R-92 [TODO] "¿Qué más para llevarlo todo a un 10?" → propuesta en TASKS (Foco a 10, fase 2); decide el usuario

## Pasada 2026-11-15 (noche, 12)

### R-93 [DONE] Perfil más corto (marcas fuera; idioma + datos juntos) → 4 tarjetas
### R-94 [DONE] Sesión con una sola acción arriba; "Detalles" en la hoja final
### R-95 [DONE] Temas: solo Noche y Día (fuera Ámbar, Neón, Rubí y banderas)
### R-96 [DONE] Primer arranque que invita a establecer marcas
### R-97 [⏸] Foto de ejemplo en "¿Cómo se hace?": la resuelve el usuario; de momento, la de ejemplo
### R-98 [DONE] Skill stevejobs: modo para mejorar la app (simple, clara, minimalista, artística) → `refine`

## Pasada 2026-11-15 (noche, 13)

### R-99 [DONE] En el último ejercicio, poder terminar la sesión (hoja final sin Modal; error visible)
### R-100 [DONE] Serie completa al indicar peso y reps; "—" sin peso; ✓ activo solo con la serie completa
### R-101 [DONE] Peso recomendado solo desde los históricos (o la marca del test); si no hay, "—"
### R-102 [DONE] Peso, altura, duración y fecha por defecto: no se piden al terminar
### R-103 [DONE] Licencias al final de Perfil, no en cada ejercicio
### R-104 [DONE] Error en Expo Go "BVLinearGradient": degradado sin módulo nativo
### R-105 [DONE] SafeAreaView obsoleto → react-native-safe-area-context (aviso fuera)

### R-106 [DONE] Hoja final: solo "Finalizar"
### R-107 [DONE] Selector de números tipo ruleta (alarma del iPhone), sin "Usar"; números grandes con teclado; altura con cm/m
### R-108 [DONE] Iterar ≥ 3 veces con la prueba Jobs (refine + analyze)

## Pasada 2026-11-16

### R-109 [DONE] Documentación reutilizable: un solo prompt para otra app con la misma UX (`docs/UX-PLAYBOOK.md`)
### R-110 [DONE] Proponer funciones nuevas, convencer, revisarlas con 2 agentes UX y aplicar su feedback (`docs/PROPUESTAS-11k.md`: A resumen, B progresión, C récord en directo aplicadas; D discos descartada)

### R-111 [DONE] Bucle de 10 rondas: 2 agentes UX sugieren, solo se acepta lo perfecto, `/SteveJobs analyze` por ronda y la nota nunca baja (10 rondas, 77 → 87, ninguna nota bajó; `docs/LOOP-11l.md`)

## Pasada 2026-11-16 (tarde)

### R-115 [DONE] "Comprueba el progreso y continúa con las tareas": rondas 5–10 de la Fase 11l hechas con la misma receta, docs al día y commit (verificación: tsc 0 · tests 130/130 · export web OK · capturas 01–32 con 0 errores de consola · vídeo 324 fotogramas · prueba Jobs SÍ, 87)
### R-112 [DONE] Añadir al playbook todos los detalles aprendidos (`docs/UX-PLAYBOOK.md` §7 bucle y §8 lista de detalles)
### R-113 [DONE] Arreglar los pendientes salvo la vibración (ejercicios casi iguales; nombre del récord en 2 líneas)
### R-114 [DONE] Documentar estado y siguiente paso para otro agente (TASKS "Cómo continuar", PROGRESS, final de `docs/LOOP-11l.md`)

## Pasada 2026-11-16 (noche)

### R-116 [DONE] Aplazados: "Hacerlo ahora" disponible desde el primer momento (sustituye la regla de ~5 intentos de R-11) (verificación: captura 33; `POSTPONE_RETURN_AT` eliminado)
### R-117 [DONE] Títulos de ejercicio en la sesión: "como lo haría Steve Jobs" (decide la prueba Jobs) → minúsculas en negrita, sin MAYÚSCULAS (estilo Apple; capturas 05–07)
### R-118 [DONE] El detalle de ejercicio pasa a ser la hoja "¿Cómo se hace?" (una sola vista del ejercicio) (`DetailScreen` eliminado; captura 31)
### R-119 [DONE] Quitar los duplicados del catálogo de ejercicios (21 fusionados, 226 → 205; `scripts/dedupe_catalog.js`, `data/exercises/merged-ids.json`, migración del historial; tests)
### R-120 [DONE] Quitar todo lo duplicado en la app (Inicio sin "N sesiones este mes"; Historial sin "N ejercicios"; una sola vista de ejercicio)
### R-121 [⏸] No probar todavía en iPhone (decisión del usuario)
### R-122 [DONE] Seguir después con la siguiente tarea (Fase 15 InstaGym) mientras la prueba Jobs lo apruebe (Fase 15 hecha; Jobs SÍ, 89; capturas 11–13 y 34)

### R-123 [DONE] Descartar la Fase 14 (por qué se usa + favoritos de atletas) tras el NO de la prueba Jobs al plan (2026-11-16; anotado en TASKS)

### R-124 [DONE] Copia de seguridad: exportar e importar TODOS los datos (sesiones, perfil, fotos) a un archivo (2026-11-16, Fase 16; Jobs SÍ 90, tests 151/151)
### R-125 [DONE] Probar ya el aviso del descanso con el móvil bloqueado (notificación local; aprueba `expo-notifications`) (2026-11-16, Fase 16; Jobs SÍ 90, tests 151/151)
### R-126 [DONE] Fotos del diario como archivos (aprueba `expo-file-system`) (2026-11-16, Fase 16; Jobs SÍ 90, tests 151/151)
### R-127 [DONE] Descartar la calculadora de discos (2026-11-16)
### R-128 [⏸] Prueba en iPhone real: la hace el usuario (2026-11-16)
### R-129 [DONE] Manuales completos para que otra app, desde cero y de forma autónoma, llegue a la misma calidad (2026-11-16; Fase 17, `docs/kit/`)
### R-130 [DONE] Después: 5 vueltas del bucle /stevejobs analyze → suggest → aplicar, para pulir la app para producción (2026-11-16; Fase 18, 86 → 90, `docs/LOOP-18.md`)
### R-131 [DONE] Aprobado `cd web && npm ci` → paridad web. Decisión: la web = build web de la app; Astro en la rama `web-astro` (2026-11-16, Fase 19)
### R-132 [EN CURSO] Generar o buscar en internet las fotos de PROMPTS.md y llevar la cuenta de cuáles están hechas y cuáles no (2026-11-16; sin generador de imágenes aquí → dibujos reales de Everkinetic: 63/205 revisados e instalados; cuenta en `docs/fotos/STATUS.md`)
### R-133 [DONE] Un vídeo de YouTube (en inglés) por ejercicio, con un acceso en la ficha; ¿lo aprobaría Steve Jobs? (2026-11-16; Fase 20: 203 vídeos comprobados; Jobs: sí como fila de texto)
### R-134 [DONE] Vídeo incrustado en la app (no salir de la app); aprobado `react-native-webview` (2026-11-16; Fase 20, captura 35)
