# PROGRESS

Estado de FitTrack y cómo se verificó. Se actualiza al cerrar cada tarea;
la historia completa está en el **Log** (abajo) y en git.

## Estado actual (2026-11-15)

| Área | Estado |
|---|---|
| Datos | 226 ejercicios reales de wger (CC-BY-SA); imágenes placeholder |
| App (Expo SDK 58) | 5 pestañas; sesión con asistente, benchmarks, material ocupado; **Resumen y Sesión simplificados (Fase 11b)** |
| Web (Astro) | Paridad hasta Fase 11; **pendiente** paridad de la Fase 11b |
| i18n | NL/ES/EN/FR, **275 claves**, espejos idénticos |
| Nube (Supabase) | ⏸ en espera (v1 solo local) |
| Siguiente | Fase 12 (más datos) y Fase 13 (fotos) — ver `TASKS.md` |

## Última verificación (2026-11-15, WSL del host)

- `npx tsc --noEmit` (app) → **1 error, de entorno**: falta el módulo
  `react-native-linear-gradient` en `node_modules` (está en `package.json`).
  El error previo `TS2698` de `SessionScreen.tsx` (spread de
  `StyleSheet.absoluteFill`) quedó corregido.
- `node tests/run.js` → **76/77**: el único fallo es la comprobación de
  `tsc` (mismo error de entorno). Paridad i18n (275 claves × 4 + espejos):
  OK.
- `npx expo export --platform web` → **no ejecutable**: falta
  `@expo/metro-runtime`. Sin build web no hay capturas ni vídeo nuevos; las
  de `docs/screenshots/` son de la Fase 11 (diseño anterior).
- Intento de restaurar ambos paquetes desde la caché npm (`--offline`,
  `--no-save`): `ENOTCACHED`. `package.json`/lock sin cambios.

## Decisiones vigentes

- Sin backend: AsyncStorage (app) y localStorage (web).
- Lógica de la app (`app/src/lib/gym.ts`) = puerto 1:1 de
  `web/src/lib/gym.js`; `tests/run.js` comprueba la paridad.
- Gráficas e iconos dibujados con `View`/`div` (sin `react-native-svg`, sin
  glifos de fuente).
- Diseño: una acción principal por pantalla, divulgación progresiva,
  patrones de iOS; ajustes (idioma, datos) en Perfil (Fase 11b).

## Bloqueos

- ⛔ Capturas/vídeo y `tsc` limpio: `cd app && npm install` con red.
- ⛔ Fotos de ejercicios (Fase 13): falta una vía de generación de imágenes
  o un banco de fotos con licencia.
- ⛔ Fotos reales de wger: `static.wger.de` ya no existe en DNS.

## Log
- 2026-10-31 — Repo inicializado; estructura base y docs (Fase 0).

- 2026-10-31 — Fase 2 (web) cerrada: build + preview 200 OK. Correcciones:
  rutas de imagen `/images/exercises/<id>.png` (fix en sync_data.py),
  getStaticPaths() para las 61 rutas de detalle, symlinks conservados en el
  espejo de node_modules.

- 2026-10-31 — Imágenes de ejercicios regeneradas (61 PNG 640×420 con poses
  por grupo muscular, `scripts/generate_exercise_images.py`) y commitadas.

- 2026-10-31 — Fase 3 (app Expo) cerrada: 4 pestañas + detalle,
  AsyncStorage, espejo de node_modules + `metro.config.js`, tsc 0 errores,
  bundle Metro 3.07 MB. Fase 4 (i18n app) cerrada: 4 bundles embebidos,
  conmutación instantánea. Fase 5 (QA) cerrada: `tests/run.js` 78/78, 0
  fallos; web re-verificada 68 rutas + 129 assets con las nuevas imágenes.

- 2026-10-31 — Fase 6 (datos reales) cerrada vía PyPI: allowlist ampliado →
  wheel de PyPI `wger 2.1` extraída → **226 ejercicios `source:"real"`**
  (CC-BY-SA, atribución por ejercicio). 226 imágenes placeholder generadas.
  Web 230 páginas / 233 rutas / 459 assets (0 fallos); app tsc 0 + bundle
  3.32 MB; tests 78/78. i18n 86 claves. Queda ⛔ solo fotos reales
  (static.wger.de 403).
- 2026-10-31 (noche) — Rediseño web a diseño apple.com (home hero + tiles;
  nav responsive con hamburguesa; /dashboard/) + fix de botones de idioma
  (DOMContentLoaded). Fix raíz del bug de scripts (b7ecefe): define:vars +
  global FTGym; bug reps/peso de session.astro. tests/runtime.js 35/35 sobre
  dist real; run.js 78/78; 462 assets 200; app tsc 0 + bundle 3.33 MB.
  Decidida Fase 7: sync en la nube con Supabase (gratis, escalable).

- 2026-11-08 — Iteraciones 1–5 de UX móvil completas (5/5), verificadas con
  Chromium real (156.0.8078.79 vía playwright-core) sobre el build web de
  producción (`expo export --platform web`, http://localhost:8095) en 6
  tamaños: iPhone 16 (393×852), iPhone 17 (402×874), iPhone 18 (440×956),
  iPhone SE (375×667), Galaxy S24 (360×780), Galaxy S25 (384×832).
  Harnesses en /tmp/qa: devices.js (render + overflow + flujo completo de
  sesión), geometry.js (bounding boxes exactas: header, steppers, targets,
  barra de guardado, teclado), check-scroll.js, dup-scroll*.js. Fixes en
  `app/src/screens/SessionScreen.tsx` y compañía: tagline solo ≥480px,
  minWidth:0 en filas de steppers, tap real en +/- (onPress) + hold-to-repeat
  sin doble conteo, KeyboardAvoidingView + barra de guardado como footer
  flex, targets ≥44px, auto-scroll a la tarjeta nueva, y (iter. 5) re-pulsar
  un ejercicio ya en el draft → sin Alert: limpia búsqueda y scrollTo a su
  tarjeta (offsets por onLayout). Verificación final: devices/geometry/
  check-scroll/dup-scroll → 0 fallos en los 6 dispositivos; tsc 0;
  expo export web OK; bundle-check.js BUNDLE_OK 3.08 MB; tests/run.js 78/78.

- 2026-11-08 — **Iteraciones 6–10: features de publicación + UX** (loop
  "implementar→verificar→corregir" ×5, verificado en Chromium real):
  (1) **Pickers de valores** — peso / reps / duración / peso corporal se
  eligen tocando una hoja de chips grandes (sin teclado) con valor propio;
  3 series por defecto al añadir un ejercicio y prellenado con los últimos
  valores usados en esa misma sesión. (2) **Borrar entradas**: por serie
  (X roja ≥44px) y por ejercicio. (3) **Exportar JSON** (copia al
  portapapeles con confirmación inline). (4) **Borrar todos los datos**
  (diálogo de confirmación propio, dos pasos). (5) **Calendario** en la
  pestaña Resumen: verde = entrenaste (con nº de series), rojo = no
  entrenaste, anillo azul = hoy, navegación por meses, celdas
  auto-adaptadas al ancho. (6) **Horizontal/tablet**: contenido centrado
  (max-width 640), biblioteca a 2 columnas, sin desbordes en 6 tamaños en
  landscape (orientation "default" en app.json). (7) Plural correcto
  ("1 ejercicio" / "3 ejercicios", helper `lib/plural.ts`) y fecha legible
  ("Nov 8" en vez de ISO). Bugs reales corregidos en el loop: `cal_today`
  escrito a archivos sin extensión (se perdía en el bundle de i18n);
  `Alert.alert()` es **no-op en react-native-web** (export/borrar no
  confirmaban en web) → reemplazado por `ConfirmDialog` (Modal propio)
  que funciona en web y nativa; la hoja de pickers se superponía a la
  rejilla con muchos valores (chips 70–100 cortados) → `maxHeight:85%` +
  rejilla con scroll; etiqueta "Serie 1/2/3" recuperada. Verificación
  final: tsc 0; expo export web OK; bundle-check.js BUNDLE_OK 3.14 MB;
  tests/run.js 78/78; Chromium devices/geometry/dup-scroll2/wide-flow →
  **0 FALLOS** en iPhone 16/17/18, iPhone SE, Galaxy S24/S25 (portrait y
  landscape).

- 2026-11-08 — Pulido de UX para publicación (Fase 7b, ver TASKS.md):
  icono 1024 + splash 2048×2732 (`scripts/make_app_assets.py`, cableados en
  app.json: iOS splash + Android adaptiveIcon); iconos de tabbar y empty
  states dibujados con Views (`src/components/TabIcon.tsx`: bar chart,
  haltera, +, reloj, X, target) — los emojis y el ✕ quedaban como cuadros
  vacíos sin fuente de emoji; sistema de diseño (SHADOW/GRADIENT en
  theme.ts, tipografía fluida useScale(), títulos 32px, tarjetas con
  sombra, CTA con degradado azul + sombra); tabbar icono gris→azul; empty
  states con CTA "Empezar una sesión" (onboarding). Fase 7 (Supabase) en
  ESPERA: v1 publica con datos solo locales (AsyncStorage). Git
  re-inicializado en el repo (bcafc7a = estado antes de esta fase; commit
  siguiente con todo). Verificación: tsc 0; expo export OK; devices/
  geometry/check-scroll/dup-scroll 0 fallos × 6 dispositivos; run.js 78/78;
  bundle-check BUNDLE_OK.

- 2026-11-08 — **Fase 8: 5 tareas de producto (interacción + benchmarks +
  generación inteligente + modos de material + tema activo)**:
  (T1) Retroalimentación inmediata en toda interacción: pressed/selected/
  disabled/loading/success/error en botones, casillas y hojas; toasts
  breves (sin notificaciones durante el scroll), confirmación de guardado
  que sobrevive al cambio de pantalla (toast de app en App.tsx),
  anti-duplicado (guardar bloqueado mientras se guarda; re-pulsar un
  ejercicio ya en el draft → scroll a su tarjeta, sin duplicar; botón
  "Comprobar" de material aplazado deshabilitado hasta el intervalo).
  (T2) **Benchmark Session**: tipo de sesión nuevo (builder → benchmark),
  1RM estimado (Epley) del mejor set o entrada manual por ejercicio,
  "Marcas" en el Resumen con 1RM por ejercicio, badge en Historial,
  persistencia en `profile.benchmarks`.
  (T3A) **Generación de entrenamiento**: builder (tipo, grupos, modo de
  material, experiencia, intensidad, duración objetivo) → plan
  determinista (ejercicio, grupo, peso recomendado, sets, reps, descanso,
  duración estimada). Peso desde 1RM (benchmark > histórico >
  conservador por material, nunca máximas), escalado por reps/intensidad;
  siempre editable. (T3B/C) **Material ocupado**: estados
  Disponible/Ocupado/Indisponible por ejercicio; "Buscar alternativa"
  (mismo grupo + patrón de movimiento + modo de material + peso
  recalculado, NO copiado); **aplazamiento temporal** (no borrado) con
  reintento configurable a los 10 min, contador visible, confirmación de
  disponibilidad (sin suponer tracking en vivo) y sin re-proponer
  material marcado ocupado. Progreso/series intactas durante todo el
  proceso. (T4) **Modos de material**: Gym completo / Solo mancuernas /
  Solo peso corporal — el generador Y las alternativas respetan el modo.
  (T5) **Sistema de color + estado de workout activo**: tokens crema
  #F3EEE3 / acento #D9541E / navy #0E1730; al empezar, la app entera
  pasa a navy (fondo, header, tabbar, textos claros) con banner
  persistente "Entrenamiento activo" (tiempo, progreso de series,
  pausar/reanudar, descartar); pausado = ámbar; al guardar/descartar
  vuelve a crema; sobrevive navegación y refresh (persistido en
  AsyncStorage `fittrack.active.v1`). Implementación: `theme.ts`
  (dos paletas + RADII), `theme-context.tsx` (ThemeProvider),
  `lib/workout.ts` (motor puro), `lib/session.ts` (estado activo),
  `lib/types.ts`, `WorkoutBuilderScreen.tsx`, store (benchmarks),
  i18n +70 claves × 4 idiomas. Verificación: tsc 0; tests/run.js
  78/78; motor 32/32 (unit tests node); Chromium flow-v3/refresh-v3/
  dup-verify/devices/geometry/dup-scroll2/wide-flow → **0 FALLOS** en
  iPhone 16/17/18, iPhone SE, Galaxy S24/S25 (portrait y landscape),
  incluyendo: tema navy al empezar, draft persistido tras refresh,
  countdown 10 min de reintento, retorno a crema al guardar, alternativas
  sin duplicar y sin romper el progreso.

- 2026-11-08 — **Fase 9: UX premium + wizard paso a paso (R-14..R-26)**:
  arranque de sesión con dos caminos claros; wizard de generación paso a
  paso (6 pasos, Atrás, puntos de progreso, revisión con plan generado);
  "Sugerir ejercicio" en sesión y lista de 226 en bottom sheet bajo
  demanda; Montserrat embebida (nativa + web); cajas estilo apple (radio,
  hairline, shadow); picker de peso responsivo sin overflow; barra inferior
  compacta icon-first; dashboard compacto (stats+actividad sin scroll en
  iPhone SE); progreso por flag `done` por serie; postergación dirigida por
  el usuario. Verificación: 78/78 + motor 43/43 + tsc 0 + expo export OK +
  smoke-v1 + harnesses Chromium 0 FALLOS + capturas verificadas.

- 2026-11-10 — **Pulido de accesibilidad y detalles (dogfood visual)**:
  tras grabar el flujo completo en video (Chromium, iPhone 16) y revisar
  fotograma a fotograma, se corrigieron:
  (1) **Contraste de `dim`** — el texto "atenuado" quedaba por debajo de
  WCAG AA en ambas paletas (crema 2.6–3.0:1, navy 3.7:1 sobre tarjeta).
  Nuevos valores medidos: `DEFAULT.dim #646C82` (5.1:1 tarjeta / 4.5:1
  fondo) y `WORKOUT.dim #8896B5` (5.2:1 tarjeta / 6.0:1 fondo) → legibilidad
  de metadatos, etiquetas de serie y placeholders mejorada en ambos temas.
  (2) **Puntos de progreso del wizard** — ahora tres estados
  reconocibles: anteriores (relleno tenue), actual (anillo acento + núcleo,
  mayor tamaño), siguientes (contorno); antes solo "relleno vs borde" sin
  distinguir el paso en curso.
  (3) **Chips de estado de material** — "Disponible/Ocupado/Fuera de
  servicio" ya no se fuerzan a ancho igual (flex:1), que hacía "Fuera de
  servicio" saltar a dos líneas; ahora caben en una línea y se centran.
  (4) **Chips de grupos musculares del wizard** — "Cuerpo completo" se
  truncaba a "Cuerpo co…" (numberOfLines=1); ahora permite 2 líneas con
  fuente 14 y sin truncar.
  Además: **harnesses de QA actualizados al flujo real** (start screen +
  wizard de 6 pasos + hoja de búsqueda) — antes probaban el builder
  antiguo directo y fallaban por desajuste, no por bug; `flow.js` con
  `startWorkout/openSearch/searchAndAdd` compartidos. Verificación:
  tsc 0; tests/run.js 78/78; motor 43/43; smoke-v1 + devices + geometry +
  dup-verify + dup-scroll2 + refresh-v3 + wide-flow → **0 FALLOS** en las
  6 matrices de dispositivos; capturas del repo regeneradas; video
  `docs/screenshots/video-iphone16.webm` (31 s, VP9) del flujo completo.

- 2026-11-10 — **Fase 9c: Paridad web (Astro al nivel de la app)**: la web
  estaba en "Fase 2 básica" (inputs numéricos, sin wizard ni tema activo);
  ahora replica la UX premium de la app:
  (1) **Sistema de diseño** — crema/naranja/navy + Montserrat (self-hosted),
  cards radio 20px hairline, y tema navy `body.workout-active` por
  variables CSS (una clase recolorea toda la web, como el ThemeProvider).
  (2) **Sesión** (`session.astro`) — arranque "¿Qué quieres hacer?",
  **wizard 6 pasos** (5 en benchmark) con progreso de 3 estados, generación
  determinista, sesión activa navy (banner+cronómetro+progreso), ValueBox
  con hoja de valor, "Hecha" por serie, estado de material + alternativas,
  sugerir, búsqueda en hoja, notas+peso corporal, guardar con resumen (PRs)
  y retorno a crema.
  (3) **Motor `workout.js`** puerto 1:1 de `workout.ts`, verificado de
  paridad contra el TS compilado (0 diffs).
  (4) **i18n web 234 claves** regenerado desde `i18n/*.json` (fuente única
  con la app; antes 105) + `store.js` con sesión activa persistente y
  export/clear.
  (5) **Páginas nuevas** `/benchmarks/` y `/data/` (export JSON + borrar).
  (6) **Bug real corregido**: `store.js.read()` hacía `Object.assign(null,
  …)` → `FTStore.active()` siempre devolvía `null`; el tema navy nunca
  activaba y la sesión activa no sobrevivía al refresh.
  Verificación: tests/run.js 78/78; tests/runtime.js 50/50 (DOM emulado
  sobre `dist/` actualizado al flujo wizard); harness Chromium web-flow.js
  **50 comprobaciones, 0 fallos, 0 errores de consola**; build 233 páginas.
- 2026-11-10 — **Fase 10: Sesión simplificada + pestaña Perfil + tema
  premium (degradados)**: petición del usuario — (1) la pantalla de sesión
  activa era "menos simple que la página por defecto": ahora solo muestra lo
  importante (estado, cronómetro, ejercicios/series, "Hecha", añadir/sugerir,
  guardar); los campos secundarios (fecha, duración, peso corporal, **altura
  personal**, notas) se plegan tras una barra **"Detalles"** (con resumen del
  valor actual y chevron), expandible a un toque. (2) **Nueva 5ª pestaña
  "Perfil"** para datos estables en el tiempo, opcionales: peso corporal
  (leído de las sesiones) con tendencia + IMC, y **altura** con tendencia y
  botón "Registrar" (hoja de valores, cm); si el usuario no los usa, la
  pestaña queda vacía sin forzar nada. (3) **Tema premium**: la sesión activa
  (y la pestaña Perfil) pinta un **degradado** en todo el fondo — navy
  profundo `#182656 → #070D1D` y crema sutil `#F5F0E6 → #EEE7D9` — y la CTA
  "Guardar sesión" usa un **degradado naranja** `#F05B1F → #BC3D06`; acentos
  naranja oscurecidos (`#C44A0D`/`#F05B1F`). Componente `Gradient` con
  entrada `.web.tsx` (CSS) porque `react-native-linear-gradient` no tiene
  build web (su `requireNativeComponent` rompía el bundle) y entrada nativa.
  Modelo: `Session.height_cm`, `Profile.height_entries[]`,
  `store.logHeight()/heightHistory()`; `normalizeSession` conserva
  `height_cm` (app `gym.ts` ≡ web `gym.js`). i18n: +17 claves (249) en los 4
  bundles + espejos.
  Verificación: `tsc` 0; `tests/run.js` **78/78 estable 10/10** (corregido
  flaky de `normalizeSession`: la paridad TS≡JS llamaba `new Date()` dos
  veces y cruzaba milisegundos → ahora `created_at` explícito); `runtime.js`
  50/50; 7 harnesses Chromium **0 FALLOS** (geometry/wide-flow/refresh-v3
  adaptados a "Detalles" expandible + navy nuevo); web `astro build` 233
  páginas + `web-flow.js` 50 comprobaciones, 0 fallos. Capturas del repo
  regeneradas 01–09 (+08 detalles, +09 perfil).
- 2026-11-11 — **Fase 11: Flujo "ejercicio actual" + cajas uniformes + mp4**:
  petición del usuario — la sesión, mientras se entrena, debía ser **más
  intuitiva y con menos cosas en pantalla**: "ejercicio actual, acabarlo, y
  después el siguiente (que la app te indica), o sugerir uno nuevo del mismo
  grupo muscular". (1) **Foco en el ejercicio ACTUAL**: cada tarjeta del
  plan es la "actual" según un índice; la actual marca con una franja
  superior "● AHORA · Ejercicio N de M" + borde naranja y la app centra la
  tarjeta en la parte visible al montar y al avanzar (scroll de foco).
  **La acción "Acabar ejercicio" vive en la barra fija inferior** (siempre
  visible, sin scroll) junto a "Guardar sesión", con la leyenda
  **"Siguiente: [nombre completo]"** sobre los botones (en el último,
  "Último ejercicio" → al pulsar, "¡Sesión completada!" + avance). El resto
  de tarjetas queda **atenuado** (opacity 0.58) con botón **"Ir allí"**
  (salta el foco). "Sugerir ejercicio" ahora propone del **mismo grupo
  muscular** que el actual (reutiliza `suggestNextExercise` con `groups`).
  Al añadir un ejercicio el foco salta a él. Las píldoras de estado
  (Disponible/Ocupado/Fuera de servicio) se muestran **solo en el ejercicio
  actual** — el resto, ruido.
  (2) **Cajas uniformes**: el box de Fecha de "Detalles" medía 45px vs 62px
  de los ValueBox (reps/kg) → ahora mismo tamaño (valor + unidad).
  (3) **Colores premium en APP Y WEB (paridad)**: la web seguía con el navy
  plano viejo (`#0E1730`) sin degradado; ahora `body.workout-active` usa
  el mismo navy premium que la app — fondo
  `linear-gradient(#182656 → #070D1D)` (attachment fixed), acento
  `#F05B1F`, CTA `#F05B1F → #BC3D06`, `--bg #070D1D` — y el `meta
  theme-color` sigue al tema (`#070D1D`). Medido en vivo: app
  `linear-gradient(rgb(24,38,86)→rgb(7,13,29))` y web idéntico.
  (4) **Video MP4** (`docs/screenshots/video-iphone16.mp4`, H.264, 33 s,
  con "Acabar ejercicio" en la barra fija) + webm; `record-video.js` copia
  el .webm más reciente por mtime. i18n: +10 claves (259) en 4 bundles +
  espejos.
  Verificación: 7 harnesses Chromium **0 FALLOS** (geometry adaptado a la
  barra fija en 2 filas: leyenda arriba, botones abajo; dup-verify/
  dup-scroll2 adaptados a la franja de foco; smoke/devices/refresh-v3/
  wide-flow con reintento de navegación — `networkidle` daba
  ERR_EMPTY_RESPONSE con http.server mono-proceso bajo carga);
  `tests/run.js` 78/78; `runtime.js` 50/50; web build 233 páginas +
  `web-flow.js` **51 comprobaciones, 0 fallos** (nuevas aserciones:
  theme-color premium + fondo degradado); capturas 01–09 y video mp4/webm
  regenerados con el diseño final.
- 2026-11-15 — **Fase 11b: Resumen y Sesión simplificados** (skill
  `impeccable`, crítica + `distill`). Petición del usuario: la sesión, al
  empezar, estaba sobrecargada; quería toda la funcionalidad pero simple,
  con apple.com y las apps de iPhone como referencia.
  (1) **Resumen**: de ~12 bloques a 4 visibles — acción principal
  ("Empezar una sesión" / "Continuar entreno" con punto verde), "Esta
  semana" (sesiones · volumen · días seguidos) en una sola tarjeta,
  gráfica semanal y últimas 3 sesiones como lista agrupada con "Ver todo".
  Grupos musculares, marcas 1RM, calendario y peso corporal pasan a "Más
  estadísticas" (plegado). Antes no había ningún botón para empezar cuando
  ya existían sesiones.
  (2) **Cabecera global eliminada**: el wordmark y las 4 píldoras de idioma
  ocupaban 48 px en todas las pantallas. Cada pantalla tiene su título
  grande; el idioma (nombres completos, `radiogroup`) y "Tus datos" viven
  en Perfil.
  (3) **Sesión activa**: banner con cronómetro grande + "x/y series hechas"
  (sin rótulo "ENTRENAMIENTO ACTIVO"); iconos de pausa/reanudar/cerrar
  dibujados (los glifos ❚❚ ▶ ✕ salían como □). Fuera el título "Sesión" y
  su subtítulo. El ejercicio actual es lo primero: sin franja "AHORA"
  anidada (posición "1/2" junto al nombre, 1RM en la línea de metadatos),
  cabecera de columnas única (`Serie · reps · kg · Hecha`) en vez de 4
  rótulos por serie, sin X roja por serie ("Quitar serie" quita la
  última), "¿Máquina ocupada?" despliega Ocupado / Fuera de servicio solo
  cuando hace falta (antes 3 chips fijos). Los demás ejercicios: filas de
  una línea (`3 × 10 · 20 kg`, series hechas, ✓ si completo) — tocar = ir
  allí. Añadir / Sugerir (una fila) y "Detalles" al final de la lista.
  (4) **Barra fija con una acción principal**: a mitad, "Terminar"
  (contorno) + "Siguiente ejercicio" (degradado); en el último, "Terminar y
  guardar" a todo el ancho. La leyenda "Siguiente: X" solo cuando aporta.
  (5) Objetivos táctiles 44 pt (pausa, cerrar, "Hecha"), números tabulares,
  roles accesibles (`checkbox`, `header`, `radio`).
  i18n: +16 claves (275) en los 4 bundles + espejos.
  Verificación: ver "Última verificación" arriba (tsc 1 error de entorno,
  tests 76/77 por ese mismo motivo; sin capturas por falta de
  dependencias). Paridad web pendiente (TASKS).
  Docs reescritos: `SPEC.md` (simple, completo), `AGENTS.md` (entorno real,
  reglas de diseño, skills instaladas), `TASKS.md` (activo arriba, hecho
  resumido), `PROGRESS.md` (estado al día).
