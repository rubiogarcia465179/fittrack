# AGENTS.md

Reglas para cualquier agente (o persona) que trabaje en FitTrack.

- **Qué construir**: `SPEC.md`. **Qué falta**: `TASKS.md`. **Qué se hizo y
  cómo se verificó**: `PROGRESS.md` (actualízalo al cerrar cada tarea).
- Requisitos con ID trazable (R-xx): `REQUIREMENTS.md`.
- Escribe docs y commits en español; código y nombres en inglés.

## 1. Estructura

```
data/      base de ejercicios (JSON) + imágenes        ← fuente de verdad
scripts/   sync_data.py (copia data/ e i18n/ a app/ y web/), generadores
i18n/      nl/es/en/fr — espejos idénticos en app/src/i18n-data/ y web/src/i18n/
tests/     run.js (datos + lógica + i18n + tsc), runtime.js (web)
app/       Expo SDK 58 / RN 0.88 — su propio package.json
web/       Astro 4 + Tailwind 3.4 — su propio package.json
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
- **Vibración**: `lib/haptics.ts` → `restDone()` (Vibration de RN + háptico)
  al terminar el descanso; `tapLight()` al marcar series; `success()` al
  guardar.
- **Web**: `web/node_modules` instalado (`npm ci`, aprobado 2026-11-15) y
  `npm run build` OK; `web/public/js/i18n.js` se regenera con
  `python3 scripts/generate_web_i18n.py`. La paridad de diseño está EN PAUSA
  por decisión del usuario (TASKS).
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
- Paridad: lo que cambie en la app debe llegar a la web (Astro) y viceversa;
  si no da tiempo, se apunta en `TASKS.md`.

## 3. Reglas de datos

- **Regla de oro: nada inventado se publica como real.** Lo que viene de wger
  lleva `source:"real"` y atribución CC-BY-SA (`license`/`credit`); lo curado
  o generado localmente se documenta en `source_note` y aquí.
- Base actual: 226 ejercicios reales de wger (extraídos de la wheel de PyPI
  `wger 2.1` con `scripts/fetch_exercises_wger_pypi.py`). `name_nl` y `level`
  son curados localmente; 16 ejercicios llevan pasos generados localmente.
- **Pasos para principiantes por idioma**: `data/exercises/howto/<lang>.json`
  (226 × 3 pasos, redactados localmente por FitTrack; la UI lo dice:
  "Explicación sencilla redactada por FitTrack"). Tras editarlos:
  `node scripts/sync_howto.js` (copia a `app/src/data/howto/` y
  `web/src/data/howto/`; falla si falta un id). Los tests comprueban cobertura
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

- Dependencias aprobadas recientes: `expo-haptics`, `expo-image-picker`,
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
  usuario). `web/node_modules` **no** está instalado (`cd web && npm ci`
  pendiente de aprobación).
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
- **Web** — Astro: mismo contenido que la app.
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
