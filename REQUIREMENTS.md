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
- **Todo entregado y verificado: R-01 … R-26.** Pendiente: Fase 7 (Supabase), en espera
  según decisión de v1 (solo datos locales).

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
