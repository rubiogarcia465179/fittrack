# AGENTS.md

Reglas para cualquier agente (o persona) que trabaje en FitTrack.

- **Qué construir**: `SPEC.md`. **Qué falta**: `TASKS.md`. **Qué se hizo y
  cómo se verificó**: `PROGRESS.md` (actualízalo al cerrar cada tarea).
- Requisitos con ID trazable (R-xx): `REQUIREMENTS.md`.
- Escribe docs y commits en español; código y nombres en inglés.

## 1. Estructura

```
data/      base de ejercicios (JSON) + imágenes        ← fuente de verdad
scripts/   sync_data.py (copia data/ e i18n/ a app/), generadores
i18n/      nl/es/en/fr — espejo idéntico en app/src/i18n-data/
tests/     run.js (datos + i18n + lógica + copia de seguridad + tsc)
app/       Expo SDK 58 / RN 0.88 — su propio package.json
web/       la web = build web de la app (build.js, serve.js; sin dependencias)
```
La raíz no tiene `package.json`: los comandos `npm` van en `app/` o `web/`.

## 2. Reglas de producto y diseño

Resumen de lo aprendido con las skills `impeccable` y `accessibility` (ver
`SPEC.md §1`):

- **Una acción principal por pantalla.** Si añades un botón, decide qué deja
  de ser primario. Lo poco frecuente va plegado ("Más opciones" en la
  sesión, "¿Qué es esto?" en calorías, "Más" en temas).
- **Navegación (versión "Foco a 10")**: 3 pestañas `TABS = ['dashboard',
  'session', 'profile']` en `App.tsx`. `history` y `library` siguen siendo
  valores de `tab` pero **no** están en la barra: se abren desde filas de
  Inicio y llevan `BackBar` (`app/src/components/BackBar.tsx`); mientras
  están abiertas, Inicio sigue marcado. Antes de añadir una pestaña, pregunta
  al usuario.
- **Un solo camino para empezar**: "Empezar sesión" → `QuickStartSheet`.
  `WorkoutBuilderScreen` (asistente) se conserva en el código pero **no se
  usa** (está en la rama `v1`).
- **"Hoy toca"**: `app/src/lib/nextSplit.ts` (`orderedSplits`, `nextSplit`,
  `mondayPushSkipped`, `splitLabel`) es la única fuente de qué grupos tocan.
  `App.tsx` guarda `splitSkip` ("Cambiar") y pasa `todayGroups` a Inicio;
  la hoja rápida usa el mismo bloque. Regla del lunes: el empuje va al final.
- **Marcas personales**: `app/src/lib/records.ts` es la única fuente
  (`effectiveRecords` = máx(test, mejor serie Epley), `recordDays` = días de
  récord para el calendario, `recordsAsBenchmarks` para el generador,
  `BENCHMARK_TEST` = los 5 clásicos). Nunca calcules marcas a mano en una
  pantalla. Las marcas no se escriben a mano: salen de sesiones o del test
  (sesión `type: 'benchmark'` que arranca `startBenchmark` en `App.tsx`).
- **Calendario**: `DayStat.pr` → círculo `RECORD_GREEN` (`#00E676`, texto
  negro) en todos los temas.
- **Cuerpo 3D: fuera de main** (2026-11-15, prueba Jobs: no). Todo vive en
  la rama `cuerpo-3d` (modelo `app/assets/models/body.glb` de Z-Anatomy, CC
  BY-SA; `scripts/build_body_model.mjs`; `Body3D.tsx`; créditos en
  `docs/CREDITOS-3D.md`). En main se desinstalaron three,
  @react-three/fiber, expo-gl y @types/three; al cambiar a esa rama, `npm ci`.
- **Capturas con WebGL**: `app/qa/shots/shoot.js` lanza Chrome con
  `--use-angle=swiftshader --enable-unsafe-swiftshader` y ofrece
  `drag(ariaLabel, dx, dy)` (arrastre real por CDP) para girar el cuerpo.
- **Expo Go**: nada de módulos nativos que no traiga Expo Go. `Gradient.tsx`
  pinta el degradado con franjas de `View` (sin `react-native-linear-gradient`).
  Nada de `Modal` encadenados en iOS: la hoja final de la sesión es una capa
  absoluta.
- **Pesos**: `weightForExercise` devuelve `null` sin marca ni histórico y
  `generateWorkout` pone 0 → la sesión muestra "—". Una serie se completa
  sola al indicar reps + peso (`setReady` en `SessionScreen`).
- **Progresión** (`lib/progression.ts`): `progressionFor` → +2,5 kg si la
  última sesión (≤ 21 días) completó todas las reps; `App.startWorkout` la
  aplica y guarda `draft[].progress` ("Mantener"). Las sesiones empiezan
  con las **marcas efectivas** (`effBench`) para pesos y récords en directo.
- **Guardar**: solo series hechas (`completedExercises` en
  `lib/session-save.ts`, incluye cardio por minutos).
- **Guía de UX para otra app**: `docs/UX-PLAYBOOK.md`; manual completo
  portable en `docs/kit/` (R-129).
- **Sin ejercicios casi iguales**: `movementKey` (`lib/workout.ts`) quita
  material/postura y compara las dos primeras palabras; `generateWorkout` no
  repite clave.
- **Bucle de revisión (Fase 11l)**: brief, log y receta en
  `docs/LOOP-11l.md`. Hojas de contacto: `ffmpeg hstack` de 7 capturas
  (ver la receta); los revisores son agentes de solo lectura.
- **Tras guardar o descartar** la app vuelve a Inicio (`App.handleSaved` /
  `handleDiscard`); los avisos se anuncian a VoiceOver (`flash`).
- **Aplazados**: sus series hechas se guardan (`completedExercises(draft,
  postponed)`) y cuentan en "x/y series"; "Saltar" devuelve lo hecho a la
  lista. Test en `tests/run.js`.
- **Hoja "Tu entreno de hoy"**: trabaja sobre una copia; solo "Continuar"
  llama a `App.quickStart(qs)` (aplica y guarda en `QS_KEY`).
- **Pesos**: todo peso recomendado pasa por `roundW` (2,5 kg; 5 kg desde
  50), también desde marcas.
- **i18n**: toda clave nueva en `i18n/*.json` y en su espejo
  `app/src/i18n-data/` (o `python3 scripts/sync_data.py`). Francés en "tu".
- **Vibración**: `lib/haptics.ts` → `restDone()` (Vibration de RN + háptico)
  al terminar el descanso; `tapLight()` al marcar series; `success()` al
  guardar.
- **Web = la app** (R-131, 2026-11-16): `cd web && npm run build` ejecuta
  `expo export --platform web` de `app/` → `web/dist/` (+ `404.html`);
  `npm run preview` la sirve en :8080. Plantilla HTML en
  `app/public/index.html` (fondo negro, `lang="es"`, favicon). El sitio Astro
  anterior vive en la rama `web-astro` (no se mantiene). Lo que difiere por
  plataforma va en módulos `*.web.ts`.
- **Ramas**: `main` (actual), `SteveJobs` (versión "Foco a 10", ya
  fusionada) y `v1` (versión anterior, 5 pestañas). Por defecto se trabaja y
  commitea en `main` (`CLAUDE.md §1`).
- **Patrones de iOS antes que inventos**: pestañas = secciones (nunca
  acciones), título grande por pantalla (sin barra de marca global), listas
  agrupadas con separadores finos, hojas inferiores para elegir valores,
  ajustes (idioma, datos) en Perfil.
- **Durante el entreno**, solo el ejercicio actual se muestra completo.
- **Tema único monocromo estilo X** (decisión del usuario 2026-11-15): toda
  la app usa `WORKOUT` de `app/src/theme.ts` (`ThemeProvider active` fijo en
  `App.tsx`): fondo `#000`, texto `#E7E9EA`, secundario `#71767B`,
  separadores `#2F3336`, superficies `#16181C`. El **acento es el blanco**:
  botones blancos con texto negro, selección y estados marcados en blanco.
  Para texto/iconos sobre el acento usa **`p.onAccent`** (negro), nunca
  `'#fff'` a mano. `DEFAULT` (crema) ya no se usa.
- **Temas (UI)**: solo **Noche y Día** en Perfil (`BASIC_THEMES`, Fase 11i).
  Ámbar/Neón/Rubí y las banderas siguen en el código sin UI; un usuario que ya
  los tenía guardados los conserva hasta que elija Noche o Día.
- **Temas (código)**: `THEMES` en `app/src/theme.ts` (night, day, amber, neon, ruby) y
  banderas en `app/src/theme-flags.ts` (`flag:XX`); `paletteFor(id)` en
  `theme-context.tsx`. Nunca escribas colores a mano en pantallas: usa
  `p.*` (incluido `p.onAccent`), o el tema Día/banderas se rompen.
- **Nombres de ejercicio**: siempre con `exName(e, lang)` (`app/src/lib/names.ts`).
- **Todo en el idioma elegido** (NL/ES/EN/FR), cambio instantáneo sin red:
  pasos "cómo se hace" con `howtoFor(id, lang, fallback)` (`app/src/howto.ts`,
  nunca `exercise.instructions` en pantalla); fechas con `fmtDay`/`fmtDate`
  (`SessionScreen.tsx`), nunca la ISO en bruto; ninguna cadena visible fuera
  de i18n (solo unidades: kg, min, km, reps).
- **Foto de Inicio**: `app/src/lib/homePhoto.ts` (`loadHomePhoto`/
  `saveHomePhoto`, clave `fittrack.homephoto.v1`); se elige solo en Perfil →
  Apariencia. **Sin foto propia no hay foto** (nada de stock en Inicio).
- **Iconos de grupo**: `GroupGlyph` (`app/src/components/GroupGlyph.tsx`, vía
  `ExerciseGlyph`): uno distinto por grupo, trazo como la barra inferior, sin
  repetir un icono de pestaña.
- **Barra inferior estilo X**: ancho completo, negra, línea fina, solo iconos
  (`accessibilityLabel` con el nombre). Sin reloj ni batería en pantallas.
- **Sin imágenes placeholder** visibles salvo la foto de ejemplo de
  "¿Cómo se hace?", que va **marcada** hasta la Fase 13; en listas, iconos de
  línea por grupo (`ExerciseGlyph` con `color={p.text}`).
- **Iconos dibujados** (Views/SVG). Nunca glifos Unicode ni emoji como icono:
  Montserrat no los tiene y salen como "tofu" (□).
- Objetivos táctiles ≥ 44 pt; contraste AA; `accessibilityLabel` /
  `accessibilityRole` / `accessibilityState` en todo control.
- Números con `fontVariant: ['tabular-nums']`.
- Paridad: automática (la web es la app). Comprueba en las capturas (que son
  el build web) todo lo que toque `*.web.ts`.

## 3. Reglas de datos

- **Regla de oro: nada inventado se publica como real.** Lo que viene de wger
  lleva `source:"real"` y atribución CC-BY-SA (`license`/`credit`); lo curado
  o generado localmente se documenta en `source_note` y aquí.
- Base actual: 205 ejercicios reales de wger (226 antes de quitar duplicados) (extraídos de la wheel de PyPI
  `wger 2.1` con `scripts/fetch_exercises_wger_pypi.py`). `name_nl` y `level`
  son curados localmente; 16 ejercicios llevan pasos generados localmente.
- **Pasos para principiantes por idioma**: `data/exercises/howto/<lang>.json`
  (205 × 3 pasos, redactados localmente por FitTrack; la UI lo dice:
  "Explicación sencilla redactada por FitTrack"). Tras editarlos:
  `node scripts/sync_howto.js` (copia a `app/src/data/howto/`; falla si
  falta un id). Los tests comprueban cobertura
  y espejos.
- **Peso corporal vs carga** (`isBodyweightExercise`, app y web): máquina en el
  texto → carga; pista de peso corporal en el NOMBRE → peso corporal; barra/
  mancuerna/kettlebell en el texto → carga; si no, pistas en el texto.
- Imágenes: placeholders generados (`scripts/generate_exercise_images.py`);
  las fotos de wger ya no existen (`static.wger.de` sin DNS). La UI lo dice.
- Tras tocar `data/` o `i18n/`: `python3 scripts/sync_data.py` (o copiar los
  JSON de i18n a los dos espejos) y `node tests/run.js`.
- APIs externas (si se usan): User-Agent propio, ≤ 2 req/s, backoff
  exponencial ante 429/503, máx. 8 reintentos.

## 4. Entorno y dependencias

- **Módulos por plataforma**: `X.ts` (iOS/Android) + `X.web.ts` (web, Metro
  lo elige solo) con la MISMA API: `pickPhoto`, `sessionPhotos`, `backupFile`,
  `restAlert`, `Gradient`. tsc solo comprueba la versión nativa; la web se
  comprueba con `expo export` y las capturas.

- Dependencias aprobadas recientes: `expo-file-system` (~58.0.13, fotos del
  diario y copia de seguridad) y `expo-notifications` (~58.1.9, aviso del
  descanso), ambas 2026-11-16 con `npx expo install` y en `app.json → plugins`;
  `react-native-webview` (14.0.1, 2026-11-16: reproductor de YouTube en la
  hoja; `components/VideoPlayer(.web).tsx`), `expo-haptics`, `expo-image-picker`,
  `react-native-svg` (15.16.0, lo usa `BarChart`),
  `react-native-safe-area-context` (5.11, petición del usuario: sustituye al
  `SafeAreaView` obsoleto de RN; `SafeAreaProvider` envuelve la app). three, @react-three/fiber,
  expo-gl y @types/three se aprobaron y se **quitaron** de main con el cuerpo
  3D (siguen en la rama `cuerpo-3d`). Cualquier otra, preguntar.

- Se trabaja en el host del usuario (Windows + WSL Ubuntu 24.04, repo en
  `~/fittrack`). Ejecuta node/npm/tsc **dentro de WSL**
  (`wsl.exe -d Ubuntu-24.04 sh -c 'cd ~/fittrack/app && …'`): el node de
  Windows falla con rutas UNC.
- **No añadas dependencias** sin aprobación del usuario. Si una tarea las
  necesita, márcala ⛔ en `TASKS.md` con el comando exacto.
- Estado (2026-11-15): `app/node_modules` completo (se instalaron
  `react-native-linear-gradient` y `@expo/metro-runtime` con aprobación del
  usuario). `web/` ya no tiene dependencias (es el build de la app).
- Desde Git Bash de Windows, las rutas `/tmp/...` dentro de `wsl.exe sh -c`
  se reescriben: usa `MSYS_NO_PATHCONV=1`.
- Capturas y vídeo: harness versionado en `app/qa/shots/` (`shoot.js`
  + `scenario.js` con Node de Windows y Chrome headless; `tap(texto)` y
  `tapLabel(aria-label)` solo tocan lo que de verdad recibe el clic;
  `make-video.js` con ffmpeg temporal de `imageio-ffmpeg` en un venv de
  `/tmp` — si `/tmp/ffvenv` no existe, recréalo como indica el script). Guía
  en `docs/screenshots/README.md`.
- WSL es aarch64 (ARM): el ffmpeg de `imageio-ffmpeg` es
  `ffmpeg-linux-aarch64-*`.
- Scripts de datos/documentación: `scripts/make_photo_prompts.js` (prompts
  de fotos, Fase 13) y `scripts/make_exercise_list.js` (`docs/EJERCICIOS.md`).

## 5. Verificación antes de decir "hecho"

| Qué | Comando | Objetivo |
|---|---|---|
| Tipos (app) | `cd app && npx tsc --noEmit` | 0 errores |
| Tests | `node tests/run.js` | 0 fallos (incluye paridad i18n y tsc) |
| Web | `cd web && npm run build && npm run preview -- --host` | build verde, HTTP 200 en rutas y assets |
| App web | `cd app && npx expo export --platform web` | export OK |
| Visual | `app/qa/shots/shoot.js` → `docs/screenshots/` (iPhone 16) | capturas revisadas una a una, 0 errores de consola |
| Vídeo | `app/qa/shots/make-video.js` → `docs/screenshots/video-iphone16.mp4` | regenerado |

**Reglas de commit y de documentación (del usuario): ver `CLAUDE.md`** —
solo al terminar una fase, en `main`, con tests + capturas + vídeo + revisión
visual + prueba "Steve Jobs" en sí + los 6 documentos actualizados.

Si algo no se puede ejecutar, dilo con el error real; no lo des por bueno.

## 6. Roles

- **Datos** — base de ejercicios, imágenes, `data/datasets.json`, `source`.
- **App** — Expo: 3 pestañas (Inicio · Entrenar · Perfil), AsyncStorage.
- **Web** — el build web de la app (`web/`).
- **i18n** — 4 bundles con el mismo nº de claves; cambio de idioma sin red.
- **QA** — `tests/`, capturas, criterios de `SPEC.md §5`.

## 7. Skills instaladas (`.claude/skills/`)

- `impeccable` — crítica y mejora de UI/UX (`/impeccable critique`, `distill`,
  `polish`…).
- `accessibility` — auditoría WCAG 2.2 AA en iOS/Android/Web.
- `iphone-duo-react-native` — soporte del iPhone plegable.
- `security-audit` — revisión de seguridad.

## Skill `stevejobs`: modo `refine`

`/SteveJobs refine [pantalla]` **actúa** (no solo juzga): restar → plegar →
fusionar → acortar; una acción principal por pantalla; jerarquía por tamaño;
un acento; estados vacíos cuidados; luego capturas y `analyze`. No añade
funciones, dependencias ni pantallas; lo que quite algo pedido por el usuario
se propone como ⛔ en TASKS. Detalle en `.claude/skills/stevejobs/SKILL.md`.
- **Catálogo sin duplicados** (2026-11-16): `scripts/dedupe_catalog.js`
  fusiona (id viejo → id que queda en `data/exercises/merged-ids.json`,
  genera `app/src/lib/merged-ids.ts`); el store migra historial y marcas, y
  App el entreno en curso. Después: `sync_data.py`, `sync_howto.js`,
  `make_image_map.py`, `make_photo_map.js`.
- **Un ejercicio = una vista**: `ExerciseHowTo` (sesión y Ejercicios); ya no
  existe `DetailScreen`.
- **Diario (Fase 15/16)**: `Session.photos` (ids) + `Session.comments`; cada
  foto es un archivo `<documentos>/photos/<id>.jpg` en iOS/Android y un data
  URL en `fittrack.photo.<id>` en web (`lib/sessionPhotos(.web).ts`);
  `store.updateSession` cambia fotos/comentarios. Las capturas usan una
  foto de ejemplo (`fittrack.photo.demo1`, en `shoot.js`).
- **Vídeos (R-133/R-134)**: `data/exercises/videos.json` (id → url, título,
  canal, `checked`). Para cambiar uno: edita la url y ejecuta
  `python3 scripts/check_videos.py` (oEmbed: quita los que no existen o no se
  pueden incrustar) y `node scripts/make_video_map.js` → `app/src/videos.ts`.
  Siempre en inglés y de canales de tutorial; nunca un enlace sin comprobar.
- **Dibujos (Fase 13)**: `data/images/photos/<id>-1.png/-2.png` (líneas en
  negro sobre transparente, PNG gris+alfa; el tinte lo pone la app) +
  `credits.json` (autor, licencia, página de Commons). Solo Everkinetic y
  solo revisados a mano (el nombre de Commons no basta). Tras añadir o
  cambiar: `node scripts/make_photo_map.js && node scripts/photo_status.js`.
  Wikimedia limita las descargas: miniaturas estándar (500 px) y pausa.
- **Web pública (R-136)**: `app/index.ts` elige `WebPlanner` si
  `Platform.OS === 'web' && process.env.EXPO_PUBLIC_WEB_MODE === 'planner'`
  (lo ponen `web/build.js` y `netlify.toml`). Capturas de la web:
  `bash web/qa.sh` (3 anchos → `docs/screenshots/web/`, escenario
  `app/qa/shots/scenario-web.js`). `shoot.js` acepta `--size WxH` y
  `--scenario <ruta>`. La web prefiere clásicos con dibujo (`prefer` de
  `generateWorkout`) y excluye avanzados y lo que pide máquina/barra según
  el material.
- **Sin OpenAI (R-148)**: se quitaron el generador por API de OpenAI y la
  guía de Codex; no hay ningún flujo con `OPENAI_API_KEY`. Ejemplos de estilo
  en `docs/fotos/referencias/` (los 156 de Everkinetic); trabajos en
  `docs/fotos/prompts-dibujos.json`.
- **Dibujos del agente web (R-149)**: `add_drawings.py` acepta `<id>-1/2/3.png`
  (sustituye lo que haya); `exercisePhotos.ts` lleva `credits[]` y `slots[]`
  **por imagen** (un ejercicio mezcla Everkinetic y generados: nunca un crédito
  único). Lista de los que hay que rehacer: `docs/fotos/DIBUJOS-A-ARREGLAR.md`.
- **Banca en la web (R-150)**: `app/src/lib/benchEstimate.ts` (1RM Epley →
  nivel, series, intensidad y marcas por cocientes); solo lo usa
  `WebPlanner.tsx`. Cambiar un cociente = revisar los tests "R-150".
- **Sesión en la web (R-152)**: `app/src/web/WebSession.tsx` (pantalla) +
  `app/src/lib/webSession.ts` (estado puro, probado). La sesión va en
  memoria; al terminar se guarda una copia en localStorage (R-169).
- **Fase 24**: pesos estándar y discos en `app/src/lib/plates.ts`
  (`snapWeight`, `stepWeight`, `weightChoices`, `loadFor`); consejos y
  mensajes motivadores en `lib/restTips.ts` (+ claves `tip_N` / `gg_N` en i18n, plurales
  v3 `clave` / `clave_plural`); WhatsApp e historial local en
  `lib/webLog.ts` + `web/WebHistory.tsx`; `schemeFor` / `applyTired` en
  `lib/workout.ts`; componentes `LoadLine`, `RestPreview`, `MotivationCard`.
  Logo: `python3 scripts/make_logo.py` regenera icon, adaptive, splash,
  `logo-mark.png` y favicons. La web ya guarda (solo en el navegador) los
  entrenos terminados e importados.
- **Mancuernas (R-183)**: todo ejercicio cuyo `name_en` dice "dumbbell"
  lleva `equipment: dumbbell` (test). `singleDumbbell(name_en)` en
  `lib/plates.ts` marca los de UNA mancuerna (goblet, pullover, concentración,
  kickback, a una mano…): total = esa mancuerna y sin "por mano" (`perHand`).
- **Mensajes al terminar (R-182)**: `MotivationCard` + `gg_N`; sin nombre de
  personas reales ni sus frases características (test).
- **Sesión: foco y Cambiar (R-176…R-178)**: `lib/sessionFocus.ts` (puro,
  probado) decide el ejercicio actual de la app (`nextPendingIndex`,
  `otherPending`, `positionOf`, `restSecondsLeft`, `moveItem`, `swapEntry`);
  la web usa `swapExercise` / `moveExercise` / `laterExercise` de
  `lib/webSession.ts`. La hoja es `components/ChangeSheet.tsx` (la misma en
  app y web); la web recibe las alternativas de `WebPlanner.alternatives`
  (mismas exclusiones que el generador, `allowed`). EAS: `appVersionSource:
  remote` + `autoIncrement` (el número de build lo lleva EAS).
- **Tiempo de la web (R-153)**: `app/src/lib/webFit.ts` ajusta la sesión al
  tiempo (máximo); `WebPlanner.build` genera la base sin `duration_min` y
  pide ejercicios extra con `more()` (grupo con menos, sin repetir
  `movementKey`).
- **Dibujos generados por el usuario (R-137)**: `docs/fotos/PROMPTS-DIBUJOS.md`
  (`node scripts/make_drawing_prompts.js`) → imágenes en
  `data/images/photos/inbox/<id>-1.png/-2.png` → `python3 scripts/add_drawings.py`
  (limpia igual que Everkinetic y marca `kind: drawing`, autor "IA") →
  `make_photo_map.js` y `photo_status.js`. La app dice "Dibujo generado con IA".
- **Atribución CC BY-SA 3.0 (R-139)**: cada dibujo de Everkinetic lleva en la
  app autor + licencia + "(modificado)" y enlace al original; Perfil y el pie
  de la web enlazan la licencia y `docs/CREDITOS-DIBUJOS.md` (lo genera
  `make_photo_map.js` desde `credits.json`: título, fuente, cambios por
  archivo). Las versiones modificadas son CC BY-SA 3.0
  (`data/images/photos/LICENSE.md`). Si cambias cómo se procesan los dibujos,
  actualiza la lista de cambios en esos tres sitios.
- **Icono (R-141)**: fuente `docs/icon/icon.svg` (+ `adaptive-foreground.svg`);
  PNG en `app/assets/` (icon, adaptive-icon, splash) y `app/public/` (favicons,
  apple-touch-icon); `app.json`: fondo `#000000` en splash e icono adaptativo.
  Detalles y cómo regenerarlo: `docs/icon/README.md`.
- **Tiendas (R-142)**: `docs/store/` (README con pasos y privacidad, fichas
  por idioma desde `listing.json`, capturas `apple/` y `google/`). Capturas:
  `shoot.js --size 440x956 --dpr 3 --scenario app/qa/shots/scenario-store.js`
  (y `360x720`) → `docs/store/raw/` (fuera de git) → `python3
  scripts/make_store_frames.py`. `app.json`: solo iPhone, vertical; build con
  `npx eas-cli build` (perfiles en `app/eas.json`). El perfil `development`
  necesita `expo-dev-client` (dependencia: pedir aprobación).
- **Nombres (R-143)**: en pantalla, siempre `exName(e, lang)` (EN/NL →
  `display_en`/`display_nl`). Para renombrar: edita
  `data/exercises/names-display.json` y ejecuta `node scripts/merge_exercise_names.js`
  (falla si falta un id). No cambies `name_en`: lo usan `movementKey`,
  `isBodyweightExercise` y los filtros de la web.
