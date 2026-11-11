# PROGRESS

Estado del proyecto FitTrack. El agente actualiza este archivo al cerrar cada
tarea.

## Estado actual
- [x] Fase 0 — Estructura del repo: AGENTS/SPEC/PROGRESS/TASKS/README +
      .gitignore, git init + commits.
- [x] Fase 1 — Datos: **226 ejercicios (source: real, wger CC-BY-SA)** + 226
      imágenes + scripts (sync/fetch-PyPI/generadores) + i18n 4 bundles.
- [x] Fase 2 — Web (Astro): **231 páginas**, diseño **apple.com** (home hero +
      2×2 tiles + franja gris; nav responsive con hamburguesa; /dashboard/).
- [x] Fase 3 — App (Expo): 4 pestañas + AsyncStorage + tsc 0 errores +
      bundle Metro OK; lock versionado (npm ci en el host).
- [x] Fase 4 — i18n: 4 bundles (nl/es/en/fr), **105 claves**, conmutación
      instantánea sin red; fix de botones en el <head> (DOMContentLoaded).
- [x] Fase 5 — QA: `tests/run.js` 78/78 + **`tests/runtime.js` 35/35**
      (DOM emulado sobre dist/: filtros, guardar/borrar sesión, dashboard).
- [x] Fase 6 — Datos reales: base REAL de wger (226) vía PyPI. ⛔ Solo fotos
      reales: **static.wger.de ya no existe en DNS** (no es proxy).
- [x] Fix raíz de la web interactiva (commit b7ecefe): los scripts de página
      morían (SyntaxError + import 404) → filtros, sesión y dashboard estaban
      muertos. Fix: `define:vars` + global `window.FTGym`.
- [x] App → **Expo SDK 58** (2026-11-07): Expo Go de la App Store solo
      soporta SDK 58, la app estaba en SDK 51. React 19.3.0, RN 0.88.1,
      react-native-web 0.21.4, async-storage 2.2.0, @types/react ~19.3.0,
      typescript ~6.0.3. `expo install --check` → "Dependencies are up to
      date"; `tsc --noEmit` → 0 errores; iPhone (Expo Go) → "iOS Bundled
      index.ts (982 modules)". i18next con `compatibilityJSON: 'v3'` (Hermes
      sin Intl.PluralRules). Sin ejecutar tras la subida: `bundle-check.js`,
      `tests/run.js`. Pendiente: SafeAreaView (deprecado en RN 0.88) →
      `react-native-safe-area-context`.
- [ ] **Fase 7 — Sync en la nube (Supabase)**: ⏸ EN ESPERA — decisión del
      usuario 2026-11-08: la v1 se publica con datos SOLO locales
      (AsyncStorage). Retomarse cuando el usuario lo pida. Ver TASKS.md.

## Verificaciones (output real)
- 2026-10-31 — Web: `npm run build` → "65 page(s) built in 2.88s", exit 0.
  `npm run preview -- --host --port 4322` → HTTP 200 en `/`, `/exercises/`,
  `/session/`, `/history/`, `/favicon.svg`, `/js/i18n.js`, `/js/store.js`,
  las 61 páginas `/exercises/<id>/` y los 129 assets únicos referenciados
  por las páginas (0 fallos). SSR en español por defecto verificado
  (textos + base embebida en el HTML); i18n.js sin defer en el `<head>`.
- 2026-10-31 — App (Expo 51 / RN 0.74): `tsc --noEmit` → 0 errores.
  Bundle Metro de extremo a extremo (`app/bundle-check.js`, `Metro.runBuild`)
  → `BUNDLE_OK bytes=3077046` (61 imágenes + 4 bundles i18n + base embebidos).
  4 pestañas + pantalla de detalle; persistencia AsyncStorage; sin
  `react-native-svg` (barras con `View`, igual que la web).
- 2026-10-31 — QA: `node tests/run.js` → 78/78 comprobaciones, 0 fallos
  (integridad de los 61 ejercicios, imágenes en las 3 ubicaciones, paridad
  de los 4 bundles i18n + espejos app/web, 25 vectores de lógica sobre
  `web/src/lib/gym.js`, 11 comprobaciones de paridad TS≡JS sobre
  `app/src/lib/gym.ts`, tsc 0 errores).
- 2026-10-31 — Web re-verificada con las imágenes regeneradas: build 65
  páginas + preview → HTTP 200 en 68 rutas y los 129 assets (0 fallos).
- 2026-10-31 — **Fase 6 (datos reales) cerrada vía PyPI**: allowlist del
  sandbox AMPLIADO (pypi.org, files.pythonhosted.org, raw.github, github SSR,
  world.openfoodfacts.org ahora 200; wger.de/static.wger.de/api.github.com
  siguen 403). La wheel de PyPI `wger 2.1` lleva el dataset real de wger →
  `scripts/fetch_exercises_wger_pypi.py` extrae **226 ejercicios
  `source:"real"`** (instrucciones reales, licencia CC-BY-SA + autor por
  ejercicio en `license`/`credit`; name_nl/level curados local y 16 pasos
  generados local — documentado en `source_note`).
- 2026-10-31 — Web con base real: build **230 páginas** + preview → HTTP 200
  en **233 rutas + 459 assets** (0 fallos); atribución CC-BY-SA visible en
  SSR de cada detalle ("Licencia: CC-BY-SA 3 · Autor: wger.de").
- 2026-10-31 — App con base real: `tsc --noEmit` 0 errores; bundle Metro
  `BUNDLE_OK bytes=3324990` (226 imágenes + i18n 86 claves + base real
  embebidos; `ex_license`/`ex_credit` presentes en el bundle). Atribución en
  `DetailScreen`.
- 2026-10-31 — QA con base real: `node tests/run.js` → **78/78, 0 fallos**
  (226 ejercicios, 226 PNG en las 3 ubicaciones, mapa de 226 assets, paridad
  TS≡JS, tsc 0 errores).
- 2026-10-31 — i18n: 86 claves × 4 bundles (nuevas `ex_license`,
  `ex_credit`; `footer_note` → "datos reales de wger (CC-BY-SA)").

## Decisiones tomadas
- Proyecto nuevo e independiente → propio directorio `/sandbox/fittrack`
  (sin colisión con `fitnl/`; no hacen falta ramas separadas).
- Charts del dashboard sin `react-native-svg` (no está en la cache local):
  barras dibujadas con `View`/`div` (compatible offline y en web).
- Instalación de dependencias por espejo de `fitnl/*/node_modules` (mismas
  versiones, cache npm local) — `npm install` está bloqueado (403).
- App: la lógica vive en `app/src/lib/gym.ts` como puerto 1:1 de
  `web/src/lib/gym.js` (misma semántica); `tests/run.js` comprueba la
  paridad TS≡JS con las mismas entradas. Imágenes de la app vía
  `require()` de Metro (`app/src/images.ts` generado por
  `scripts/make_image_map.py`; los PNG se copian a `app/assets/exercises/`).
- `app/metro.config.js` = `getDefaultConfig()` de `@expo/metro-config`
  (sin él Metro no resuelve el registro de assets).

## Pendiente / bloqueos
- Fase 7 (Sync Supabase) — pendiente de implementación (ver TASKS.md):
  cuenta + proyecto, login magic link, tabla `sessions` + RLS, sync
  offline-first en app y web.
- Fase 6 (fotos reales) — ⛔ `static.wger.de` **no existe ya en DNS público**
  (NXDOMAIN; no es el proxy). Alternativas: URL nueva de wger desde el host,
  o dataset con fotos en GitHub. Las imágenes actuales son placeholders
  generados (declarado en UI y `source_note`).

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
