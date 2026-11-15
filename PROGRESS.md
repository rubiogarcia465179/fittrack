# PROGRESS

Estado de FitTrack y cómo se verificó. Se actualiza en cada commit
(`CLAUDE.md §2.6`); la historia completa está en el **Log** (abajo) y en git.

## Estado actual (2026-11-15)

> Fases 11c + 11d **commiteadas** en `main` (prueba "Steve Jobs" = **SÍ**,
> evaluada como versión 2.0 por decisión del usuario). Siguiente: Fase 15
> (InstaGym). Ver `TASKS.md` → "Cómo continuar".

| Área | Estado |
|---|---|
| Diseño | **Monocromo estilo X** en toda la app (negro/blanco/gris, botones blancos con texto negro, barra inferior X con iconos propios, sin reloj ni batería) |
| Inicio | Foto (cambiable) + "Empezar sesión" → hoja "Tu entreno de hoy", marcas personales, calendario, histogramas de actividad |
| Sesión | Ejercicio actual, descanso con cuenta atrás, hoja "¿Cómo se hace?", cardio, valoración, hápticos |
| Perfil | Datos fijos + calorías (explicadas) + temas (Noche/Día/Ámbar/Neón/Rubí) + nacionalidad y tema de bandera + idioma y datos |
| Idioma | **Todo en el idioma elegido** (NL/ES/EN/FR): interfaz, nombres de ejercicio, pasos "cómo se hace" (226 × 4), fechas; cambio instantáneo |
| Datos | 226 ejercicios reales de wger; iconos de línea distintos por grupo; nunca 0 kg en ejercicios con carga |
| Web (Astro) | Atrasada: lógica al día, diseño de la 11c (no el monocromo X); pasos por idioma copiados a `web/src/data/howto/` pero sin usar |
| i18n | NL/ES/EN/FR, **365 claves**, espejos idénticos |
| Fotos (Fase 13) | 678 prompts listos; esperando imágenes del usuario (hoy: foto de ejemplo marcada) |
| Nube | ⏸ en espera |

## Última verificación (2026-11-15, WSL del host, commit "foto de Inicio en Perfil")

- `npx tsc --noEmit` (app) → **0 errores**.
- `node tests/run.js` → **115/115, 0 fallos** (nuevos: pasos en 4 idiomas ×
  226 + espejos; peso corporal vs carga de `back_squat`/`crunches`).
- `npx expo export --platform web --output-dir /tmp/ft-dist` → OK.
- Capturas **01–21** (`docs/screenshots/`) con Chrome headless → **0 errores
  de consola**, revisadas (hoja de contactos + una a una las cambiadas);
  vídeo `video-iphone16.mp4` regenerado (229 fotogramas, 4,1 MB).
- `web/`: `npm run build` no ejecutado (falta `web/node_modules`, ⛔ `npm ci`).
- iPhone real: probado por el usuario (2026-11-15).
- **Prueba "Steve Jobs": SÍ** como versión 2.0 (ver Log 2026-11-15 "noche, 5").

## Decisiones vigentes

- Sin backend: AsyncStorage (app) y localStorage (web).
- `app/src/lib/gym.ts` = puerto 1:1 de `web/src/lib/gym.js` (tests de paridad).
- Iconos y gráficas dibujados con `View` (sin glifos de fuente, sin SVG).
- Diseño: tema monocromo estilo X; el acento es el blanco (`p.onAccent` =
  negro para texto sobre él); una acción principal por pantalla; sin volumen;
  sin reloj ni batería.
- Idioma: los 4 idiomas van en el bundle (interfaz, nombres y pasos), sin red.
  Pasos "cómo se hace" redactados localmente y declarados en la UI.
- Entreno recomendado: hoja previa (duración, intensidad, energía, objetivo);
  energía baja = intensidad un nivel menos; bloque de grupos menos entrenado.
- Descanso: `rest_after` del plan o 90 s; hápticos con `expo-haptics`.
- Cardio en la misma estructura de series (`duration_min`, `distance_km`,
  `intensity`; reps = kg = 0).
- Calorías: Mifflin-St Jeor × actividad deducida de las sesiones.
- Commits solo al cerrar fase + capturas/vídeo + prueba Jobs en sí + 6 docs.
- La prueba Jobs juzga FitTrack como **versión 2.0** (funciones actuales OK);
  fotos de ejemplo marcadas no bloquean; recorte 1.0 aparcado en
  `docs/FOCO-1.0.md`.

## Bloqueos (necesitan al usuario)

- ⛔ Fotos de ejercicios: las genera el usuario con `docs/fotos/PROMPTS.md`.
- ⛔ `cd web && npm ci` para compilar la web (paridad de diseño).

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
- 2026-11-15 (tarde) — **Fase 12 + tema negro + capturas/vídeo**.
  (1) **Tema de entreno negro** (petición: "negro en vez de navy, con
  degradado en el negro y el naranja"): `WORKOUT` con grises neutros de iOS
  oscuro, fondo `#2A2A30 → #000000`, CTA `#F55E14 → #B83A08` (texto blanco
  legible en todo el degradado); misma paleta en `body.workout-active` de
  la web y `theme-color` `#000000`.
  (2) **Cardio** (decisión del usuario: minutos + km + intensidad): filas
  `nº · min · km · intensidad · hecha`, intensidad que se cambia tocando,
  kcal estimadas con METs del Compendium (4/7/10) si hay peso; bloque por
  defecto de 20 min (o el último hecho) al añadir o desde el asistente;
  minutos de cardio de la semana en el Resumen; Historial con
  "20 min · 3 km · Fuerte". `normalizeSession` conserva los campos de
  cardio solo si tienen valor (sesiones de fuerza idénticas a antes).
  (3) **Valoración al terminar**: "Terminar" abre una hoja con energía y
  sensación (1–5) → "Guardar sesión" o "Finalizar sin valorar".
  (4) **Perfil**: Sobre ti (sexo, año de nacimiento, nivel, objetivo; el
  asistente arranca con nivel y objetivo), peso registrable en Perfil y
  **calorías diarias** (petición: "de manera muy científica"): metabolismo
  basal Mifflin-St Jeor (Frankenfield 2005: la ecuación más precisa) ×
  factor de actividad deducido de las sesiones de las últimas 4 semanas
  (`app/src/lib/energy.ts`, puro y testeado).
  (5) **Bugs**: `store.migrate()` perdía `height_entries` en cada lectura
  (solo sobrevivía la última altura); "Añadir/Sugerir ejercicio" salían
  aplastados (fila sin `flexDirection: 'row'`); botones de "Tus datos"
  desbordaban el texto (ahora apilados a todo el ancho).
  (6) **Dependencias** (aprobado por el usuario): `npx expo install
  @expo/metro-runtime react-native-linear-gradient` → `package.json` +1
  dependencia, lock actualizado, 4 avisos moderados de `npm audit`.
  (7) **Capturas y vídeo** regenerados con un harness nuevo versionado
  (`app/qa/shots/`: CDP sin dependencias + ffmpeg temporal).
  (8) **Fase 13**: `scripts/make_photo_prompts.js` → 678 prompts en
  `docs/fotos/` con el estilo de `data/images/ejemplo/`.
  i18n: +37 claves (312). Verificación: ver "Última verificación".
- 2026-11-15 (noche) — **Fases 11c + 11d (SIN COMMIT): Inicio, estilo X
  monocromo, descanso, hoja de inicio, prueba "Steve Jobs"**. Peticiones del
  usuario en esta pasada (todas en `REQUIREMENTS.md` R-37…R-52):
  (1) **Inicio** (antes Resumen/Main): portada sin título; sin volumen;
  "Empezar sesión" directo; calendario con días de entreno; marcas
  personales visibles (3 tarjetas blancas, 1RM de historial + benchmarks).
  (2) **Hoja "Tu entreno de hoy"** al empezar un entreno recomendado:
  duración, intensidad, energía de hoy y objetivo → "Continuar al entreno"
  (`QuickStartSheet.tsx`; recuerda la última elección).
  (3) **Estilo**: primero coche/Tesla (11c, gris + naranja, foto de fondo,
  barra flotante tipo Instagram) y después, a petición del usuario,
  **monocromo estilo X** en toda la app (11d): negro puro, texto blanco,
  gris secundario, botones blancos con texto negro, barra inferior X de
  ancho completo y solo iconos, sin reloj ni batería. Nuevo token
  `onAccent` en la paleta; barrido de todos los `'#fff'` sobre el acento.
  (4) **Prueba "Steve Jobs"** pedida por el usuario y añadida a `CLAUDE.md`
  como paso obligatorio antes de cada commit. Veredicto inicial NO (dos
  lenguajes de diseño, sin temporizador de descanso, 0 kg, "Otro", nombres
  en inglés, "Main", foto repetida, placeholders, sin hápticos, sin probar
  en iPhone). Arreglado: tema único, **temporizador de descanso**
  (`rest_after`/90 s, +15 s, Saltar, `Vibration`), nunca 0 kg
  (`conservativeOneRm('other')` = 15 en app y web), "Otro" oculto, pestaña
  "Inicio/Home/Start/Accueil", foto solo en Inicio, iconos de línea en
  lugar de placeholders (biblioteca, historial, detalle). Veredicto actual:
  **NO** (pendiente: nombres traducidos → Fase 14; hápticos ⛔; iPhone ⛔;
  paridad web).
  (5) **Docs para traspaso**: `CLAUDE.md` con "Si acabas de llegar al repo"
  y la regla de actualizar los 6 documentos en cada commit; `SPEC.md`
  reescrito con la visión actual; `TASKS.md` con "Cómo continuar" y el
  orden de trabajo; `AGENTS.md` con el tema único y `onAccent`.
  (6) **Extras**: `docs/EJERCICIOS.md` (226 nombres en inglés,
  `scripts/make_exercise_list.js`); harness con `tapLabel` y detección de
  elementos tapados.
  Verificación: ver "Última verificación" arriba.
- 2026-11-15 (noche, 2) — **SIN COMMIT. Cierre de puntos Jobs + Inicio +
  temas + nacionalidad + skill `stevejobs`**.
  (1) **Nombres ES/FR** de los 226 ejercicios: traducción local en
  `data/exercises/names-i18n.json`, fusionada con
  `scripts/merge_exercise_names.js` (falla si falta un id; `source_note` lo
  declara); `exName()` en toda la app; la búsqueda encuentra ES/FR (app y web).
  (2) **Inicio**: foto + "Empezar sesión" arriba; foto propia opcional
  ("Cambiar foto", web con `pickPhoto.web.ts`; iPhone ⛔ `expo-image-picker`);
  sin fecha ni semana ni racha; calendario rediseñado (lunes primero, círculos,
  cabecera ligera, leyenda); **Actividad**: histogramas de hora del entreno
  (desde `created_at`) y de día de la semana. Historial sin volumen.
  (3) **Temas** en Perfil: Noche, Día (inverso exacto), Ámbar, Neón, Rubí
  (pares complementarios). **Nacionalidad** (20 países, mini-bandera) +
  interruptor aparte "Usar los colores de mi país" (`theme-flags.ts`;
  oscuro teñido + acento vivo; Japón/Canadá en claro). Barrido de colores
  fijos → tokens (`p.onAccent`, `p.card`…), para que Día y banderas no se
  rompan.
  (4) Explicación sencilla de **metabolismo basal vs gasto diario** en Perfil.
  (5) **Skill `stevejobs`** (`.claude/skills/stevejobs/SKILL.md`) + comando
  `/SteveJobs` (`.claude/commands/SteveJobs.md`); `CLAUDE.md §2.5` la usa.
  Verificación: tsc 0; tests 96/96; export web OK; 17 capturas sin errores
  de consola (incluye Día, Ámbar y bandera de España); vídeo regenerado.
  **Prueba "Steve Jobs": NO** — solo quedan bloqueos del usuario: hápticos
  (⛔ `expo-haptics`), prueba en iPhone real, y la web sin el diseño nuevo
  (⛔ `npm ci`).
- 2026-11-15 (noche, 3) — **SIN COMMIT.** Bandera de España en rojo y amarillo
  reales (todas las banderas ahora reconocibles: fondo = color de la bandera
  oscurecido al 45 %, España 62 %); cambio de idioma verificado con capturas
  (FR y NL, nombres de ejercicio incluidos); hoja **"¿Cómo se hace?"** en la
  sesión (fotos de ejemplo marcadas, qué entrena con 11 músculos traducidos,
  pasos de wger) y `scripts/make_photo_map.js` para añadir fotos reales;
  **`expo-haptics` y `expo-image-picker` instalados** (aprobado): háptico al
  marcar serie / fin de descanso / guardar, y foto propia también en iPhone;
  **iconos propios** de la barra (estilo Instagram: contorno/relleno);
  equipo traducido ("Barbell"→"Barra", "Cable"→"Polea"/"Kabel").
  Verificación: tsc 0; tests 96/96; 20 capturas sin errores; vídeo al día
  (antes del arreglo de "Barra").
  **/SteveJobs analyze: NO** — imágenes de ejemplo repetidas e iconos iguales
  en la biblioteca (autenticidad), pasos en inglés dentro de la app en otros
  idiomas, demasiadas funciones para una 1.0 (foco), sin probar en iPhone
  real. Detalle y lista "Para pasar a SÍ" en TASKS (Fase 11d).

- 2026-11-15 (noche, 4) — **SIN COMMIT. Idioma completo, iconos por grupo.**

Petición: "todo lo escrito debe cambiar al idioma elegido" (la hoja "¿Cómo se
hace?" salía en inglés) + "¿qué harías para subir el foco a 10?".

Hecho:
- Pasos "cómo se hace" para principiantes en **NL/ES/EN/FR** (226 × 3,
  `data/exercises/howto/*.json`, redactados localmente) →
  `scripts/sync_howto.js` → `app/src/howto.ts` (`howtoFor`). Usados en la hoja
  de la sesión y en el detalle del ejercicio. Nota de fuente en la UI
  ("Explicación sencilla redactada por FitTrack").
- Fechas localizadas: Historial ya no muestra `2026-11-15` sino "dom 15 nov";
  meses en neerlandés (antes caían al inglés); campo "fecha" de la sesión
  traducido (`field_date`).
- Iconos de línea **distintos por grupo** (`GroupGlyph`): pecho, espalda en V,
  piernas, hombros (press), brazos (bíceps), core (abdominales), cardio
  (pulso). Antes core/pecho/brazos eran el mismo "—".
- Bug: `back_squat` (wger "other") se sugería con **0 kg** porque su texto dice
  "Dip under the bar" ("dip" = peso corporal). Heurística corregida en app y
  web; solo cambia `back_squat` (verificado sobre los 226); 3 tests nuevos.
- Captura nueva **21-howto-nl** (pasos en neerlandés).

Verificación: tsc 0 errores · tests 115/115 · export web OK · 21 capturas, 0
errores de consola · vídeo 227 fotogramas.

**Veredicto `/stevejobs analyze`: NO.** Motivos (por orden):
1. Foco: 5 pestañas, 5 temas + 20 banderas, marcas + benchmarks, histogramas,
   "¿Máquina ocupada?", asistente aparte y hoja rápida — demasiadas ideas
   buenas para una 1.0 (principio 1).
2. La misma foto de ejemplo en los 226 ejercicios: marcada con honestidad,
   pero sigue siendo un placeholder en el momento clave (principio 7).
3. Nunca probada en un iPhone real (principio 10).
Lo que ya aprobaría: un solo lenguaje visual, el idioma completo y la hoja de
inicio rápido. Puntuación media 6,4/10 (foco 4).
Para pasar a SÍ → `TASKS.md` Fase 11d.

- 2026-11-15 (noche, 5) — **Commit Fases 11c + 11d.** Decisiones del usuario:
  evaluar FitTrack como **versión 2.0** (este número de funciones es
  aceptable), commitear aunque falten las fotos reales (la de ejemplo va
  marcada) y guardar el recorte 1.0 en `docs/FOCO-1.0.md` sin aplicarlo. El
  usuario probó la app en un iPhone real.
  **Veredicto `/stevejobs analyze` (marco 2.0): SÍ.** Motivos: un solo
  lenguaje visual de la primera a la última pantalla; el flujo central sigue
  en 2 toques (Empezar sesión → Continuar al entreno) y las funciones extra
  quedan en segundo plano; todo en el idioma elegido; nada falso (la foto de
  ejemplo lo dice); probado en el dispositivo real. Pendiente que no bloquea:
  fotos reales (Fase 13), paridad de diseño de la web (⛔ `npm ci`), "por qué
  se usa" por ejercicio (Fase 14). Puntuación media 7,6/10 (foco 7 como 2.0,
  autenticidad 7 por la foto de ejemplo).
  Verificación: tsc 0 · tests 115/115 · export web OK · 21 capturas, 0 errores
  de consola · vídeo 227 fotogramas.

- 2026-11-15 (noche, 6) — **Commit: foto de Inicio en Perfil.** Petición del
  usuario: cambiar la foto de Inicio desde Perfil y quitar "Cambiar foto" de
  Inicio. Nuevo `app/src/lib/homePhoto.ts`; tarjeta "Foto de Inicio" en Perfil
  (miniatura, Cambiar foto, Restablecer); 3 claves i18n nuevas (365).
  Verificación: tsc 0 · tests 115/115 · export web OK · 21 capturas, 0
  errores de consola (01 sin botón, 15 con la tarjeta) · vídeo 229 fotogramas.
  **Veredicto `/stevejobs analyze` (marco 2.0): SÍ** — la primera pantalla
  pierde un control y el ajuste vive donde viven los ajustes; nada más cambia.
