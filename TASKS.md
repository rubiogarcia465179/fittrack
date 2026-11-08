# TASKS — FitTrack

Pendientes con estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado.

## Fase 0 — Estructura
- [x] Estructura del repo (AGENTS/SPEC/PROGRESS/TASKS/README/.gitignore)
- [x] git init + commits (repo local, sin remote; el host lo copia)

## Fase 1 — Datos
- [x] `data/exercises/all.json` — **226 ejercicios (source: real, wger CC-BY-SA)**
      (backup seed de 61: `data/exercises/seed-v1.json`)
- [x] `data/images/` — 226 imágenes placeholder (fotos reales ⛔, ver Fase 6)
- [x] `data/datasets.json` — metadatos (source: real, count 226)
- [x] `scripts/sync_data.py` — copia base+i18n+imágenes a `app/` y `web/`
- [x] `scripts/fetch_exercises_wger_pypi.py` — fetcher de la wheel PyPI `wger`
- [x] `scripts/generate_exercise_images.py` — 226 imágenes (fallback
      `fallback_spec(equipment, muscle_group)`)
- [x] `scripts/make_image_map.py` — mapa id→require() de Metro (226)
- [x] `scripts/generate_i18n.py` — **105 claves × 4 bundles** (incluye
      hero/tiles de home y ex_license/ex_credit)

## Fase 2 — Web (Astro)
- [x] Setup Astro 4 + Tailwind 3.4; **231 páginas** (4 + home + dashboard +
      226 detalle + session + history)
- [x] **Diseño apple.com**: home con hero + grid 2×2 de tiles + franja gris
      (tokens: AppBlue #0071e3, radio 18px, SF Pro stack, nav 48px translúcida)
- [x] **Nav responsive**: enlaces inline en escritorio; hamburguesa con menú
      a pantalla completa en móvil (cierre con Escape, scroll bloqueado)
- [x] Rutas: `/` (home apple), `/dashboard/` (métricas), `/exercises/`
      (226 + búsqueda + filtros grupo/material), `/exercises/<id>/`,
      `/session/`, `/history/`
- [x] Atribución CC-BY-SA visible en cada detalle
- [x] **Bug raíz de scripts de página corregido** (commit b7ecefe):
      `const EX = { JSON.stringify(ex) }` literal (SyntaxError) e
      `import '/src/lib/gym.js'` (404) mataban TODO el JS. Fix: `define:vars`
      + global `window.FTGym` (`public/js/gym.js`, generado por
      `scripts/generate_gym_browser.py`)
- [x] Bug `session.astro`: escribía `s['sess_reps']` en vez de `s.reps`
      (imposible fijar reps/peso) → corregido
- [x] Verificación: build 231 páginas; preview --host → 233+ rutas y 462
      assets HTTP 200 (0 fallos)

## Fase 3 — App (Expo)
- [x] Expo SDK 51 / RN 0.74 (espejo de node_modules de fitnl/app)
- [x] 4 pestañas + detalle; persistencia AsyncStorage (`fittrack.data.v1`)
- [x] Lógica `src/lib/gym.ts` (puerto 1:1 de `web/src/lib/gym.js`)
- [x] Imágenes embebidas (`src/images.ts`, 226 require de Metro)
- [x] Header 48px estilo nav apple.com + tab bar con highlight
- [x] `app/package-lock.json` versionado (`npm ci` funciona en el host)
- [x] Verificación: `tsc --noEmit` 0 errores + bundle Metro
      (**3.33 MB BUNDLE_OK**)

## Fase 4 — i18n
- [x] Bundles nl/es/en/fr (**105 claves**, paridad programática)
- [x] Conmutación instantánea: web con `DOMContentLoaded` (fix del bug de
      botones que no respondían) y app con bundles embebidos
- [x] `tests` verifican espejos app/web idénticos a `i18n/`

## Fase 5 — QA
- [x] `tests/run.js` — datos + lógica + i18n + paridad TS≡JS: **78/78**
- [x] `tests/runtime.js` — **DOM emulado sobre dist/ real: 35/35**
      (filtros, búsqueda, crear/guardar sesión, borrar, dashboard, i18n)
- [x] Todos los assets 200 (web, 462)

## Fase 6 — Datos reales
- [x] Base REAL: 226 ejercicios de wger (CC-BY-SA) vía wheel de PyPI
- [x] `name_nl`/`level` curados localmente (documentado en `source_note`)
- ⛔ **Fotos reales**: `static.wger.de` **no existe ya en DNS** (NXDOMAIN
      público, verificado) — no es bloqueo de proxy. Alternativas:
      (a) URL nueva de wger si el usuario la ve desde su host,
      (b) dataset con fotos en GitHub (raw.githubusercontent.com accesible).

## Fase 7 — Sync en la nube: Supabase (decisión del usuario: gratis y
## escalable) — ⏸ EN ESPERA (v1 publica con datos SOLO locales)
- Decision 2026-11-08: la primera versión se publica sin nube; los datos
  viven en AsyncStorage (`fittrack.data.v1`). Supabase se retoma cuando el
  usuario lo pida.
- [ ] Cuenta Supabase (la crea el usuario o me da acceso) + proyecto free
      (500 MB BD, 50k auth; auto-pausa si 1 semana inactivo)
- [ ] Login **magic link** (sin contraseña)
- [ ] Esquema: tabla `sessions` (mismo shape que `fittrack.data.v1`) +
      `user_id`; RLS: solo sus filas
- [ ] App: login + sync local (AsyncStorage) ↔ nube, caché offline
- [ ] Web de Astro: misma cuenta desde el cliente
- [ ] Export/import JSON local como puente de migración
- [ ] Documentar en README: costes (0 € en free), privacidad (datos fuera
      del dispositivo), exportar/borrar cuenta

## Fase 7b — Pulido de UX para publicación (2026-11-08) — HECHA
- [x] Icono de app (1024) + splash (2048×2732) generados
      (`scripts/make_app_assets.py`) y cableados en `app.json` (iOS
      splash + Android adaptiveIcon) — requisito de tienda.
- [x] Iconos de la tabbar y empty states **dibujados con Views**
      (`src/components/TabIcon.tsx`): emojis (📊🏋️➕🕘) y ✕/← quedaban
      como cuadros vacíos sin fuente de emoji; ahora son formas propias
      (bar chart, haltera, +, reloj, X de borrar, target vacío) que
      renderizan en cualquier plataforma.
- [x] Sistema de diseño: tokens SHADOW/GRADIENT en `theme.ts`; tipografía
  fluida `useScale()` (`src/scale.ts`, base 393px → máx 1,12× en iPhone 18);
  títulos 32px, subtítulos 15px, metadatos 13px, inputs 16px; tarjetas con
  sombra suave Apple; CTA "Guardar sesión" y CTAs de empty states con
  degradado azul vertical + sombra.
- [x] Tabbar: icono en gris tenue → azul activo (sin bloque de fondo),
  activeOpacity 0.5.
- [x] Empty states con marca circular + CTA "Empezar una sesión" (dashboard
  e historial) — onboarding del primer uso.
- [x] Verificación: tsc 0; expo export web OK; harnesses Chromium
  devices/geometry/check-scroll/dup-scroll → 0 fallos en 6 dispositivos;
  tests/run.js 78/78; bundle-check BUNDLE_OK.

## Fase 7c — Features de publicación + UX (2026-11-08) — HECHA
- [x] **Pickers de valores** (`src/components/PickerSheet.tsx`): peso,
  reps, duración y peso corporal se eligen tocando chips grandes (sin
  teclado), con valor propio ("Otro valor" + Usar) y CTA a pantalla
  completa. 3 series por defecto al añadir un ejercicio; los valores se
  prellenan con los últimos usados (menos toques).
- [x] **Borrar entradas**: por serie (botón X roja ≥44px) y por ejercicio
  (link "Eliminar") — ya existentes, rediseñados con targets grandes.
- [x] **Exportar JSON** (`store.exportData` + `DataSection`): copia todo
  el dataset al portapapeles con confirmación inline ("Datos copiados").
- [x] **Borrar todos los datos** (`store.clearAll` + `ConfirmDialog`):
  diálogo de confirmación propio (Modal) → `onDataChanged` limpia el
  estado. Reemplaza a `Alert.alert`, que es **no-op en react-native-web**.
- [x] **Calendario** en la pestaña Resumen (`src/components/Calendar.tsx`):
  verde = entrenaste (nº de series), rojo suave = no entrenaste, anillo
  azul = hoy, navegación ‹ › por meses, celdas auto-adaptadas al ancho.
- [x] **Horizontal / tablet**: contenido centrado con max-width 640
  (`useWide` en `scale.ts`), biblioteca a 2 columnas, sin desbordes en
  landscape en 6 tamaños; `orientation: "default"` en `app.json`.
- [x] **Plural correcto** (`lib/plural.ts`): "1 ejercicio" / "3
  ejercicios", "1 serie" / "3 series" en dashboard, historial, sesión y
  diálogos; fecha legible "Nov 8" (fmtDay) en vez de ISO.
- [x] Bugs corregidos en el loop de 5 iteraciones: `cal_today` perdido en
  el bundle i18n (archivos sin extensión); `Alert.alert()` no-op en web;
  chips 70–100 cortados por la fila "Otro valor" → hoja `maxHeight:85%`
  con rejilla scrollable; etiqueta "Serie 1/2/3" recuperada.
- [x] Verificación: tsc 0; expo export web OK; bundle-check BUNDLE_OK
  3.14 MB; tests/run.js 78/78; Chromium devices/geometry/dup-scroll2/
  wide-flow → 0 fallos en iPhone 16/17/18, iPhone SE, Galaxy S24/S25
  (portrait + landscape).

## Testing en el host (documentado en README.md)
- [x] Web: `cd web && npm ci && npm run build && npm run preview -- --host`
- [x] App: `cd app && npm ci && npx expo start` + Expo Go (QR) — Android e
      iPhone (guía completa en README.md)
