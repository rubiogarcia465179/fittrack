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
