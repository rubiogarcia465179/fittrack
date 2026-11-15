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
  de ser primario. Lo poco frecuente va plegado ("Más estadísticas",
  "Detalles", "¿Máquina ocupada?").
- **Patrones de iOS antes que inventos**: pestañas = secciones (nunca
  acciones), título grande por pantalla (sin barra de marca global), listas
  agrupadas con separadores finos, hojas inferiores para elegir valores,
  ajustes (idioma, datos) en Perfil.
- **Durante el entreno**, solo el ejercicio actual se muestra completo.
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
- Imágenes: placeholders generados (`scripts/generate_exercise_images.py`);
  las fotos de wger ya no existen (`static.wger.de` sin DNS). La UI lo dice.
- Tras tocar `data/` o `i18n/`: `python3 scripts/sync_data.py` (o copiar los
  JSON de i18n a los dos espejos) y `node tests/run.js`.
- APIs externas (si se usan): User-Agent propio, ≤ 2 req/s, backoff
  exponencial ante 429/503, máx. 8 reintentos.

## 4. Entorno y dependencias

- Se trabaja en el host del usuario (Windows + WSL Ubuntu 24.04, repo en
  `~/fittrack`). Ejecuta node/npm/tsc **dentro de WSL**
  (`wsl.exe -d Ubuntu-24.04 sh -c 'cd ~/fittrack/app && …'`): el node de
  Windows falla con rutas UNC.
- **No añadas dependencias** sin aprobación del usuario. Si una tarea las
  necesita, márcala ⛔ en `TASKS.md` con el comando exacto.
- Estado conocido (2026-11-15): en `app/node_modules` faltan
  `react-native-linear-gradient` (declarada en `package.json`) y
  `@expo/metro-runtime` (necesaria para `expo export --platform web`).
  Consecuencia: `tsc` da 1 error de módulo y no se pueden generar capturas
  ni vídeo hasta ejecutar `npm install` en `app/` con red.
- Los harnesses de Chromium de fases anteriores vivían en `/tmp/qa` y ya no
  existen; `app/qa/` conserva shims y `devices.js`.

## 5. Verificación antes de decir "hecho"

| Qué | Comando | Objetivo |
|---|---|---|
| Tipos (app) | `cd app && npx tsc --noEmit` | 0 errores |
| Tests | `node tests/run.js` | 0 fallos (incluye paridad i18n y tsc) |
| Web | `cd web && npm run build && npm run preview -- --host` | build verde, HTTP 200 en rutas y assets |
| App web | `cd app && npx expo export --platform web` | export OK |
| Visual | capturas en `docs/screenshots/` (iPhone 16, 393×852) | regeneradas si cambió la UI |

Si algo no se puede ejecutar, dilo con el error real; no lo des por bueno.

## 6. Roles

- **Datos** — base de ejercicios, imágenes, `data/datasets.json`, `source`.
- **App** — Expo: 5 pestañas, AsyncStorage.
- **Web** — Astro: mismo contenido que la app.
- **i18n** — 4 bundles con el mismo nº de claves; cambio de idioma sin red.
- **QA** — `tests/`, capturas, criterios de `SPEC.md §5`.

## 7. Skills instaladas (`.claude/skills/`)

- `impeccable` — crítica y mejora de UI/UX (`/impeccable critique`, `distill`,
  `polish`…).
- `accessibility` — auditoría WCAG 2.2 AA en iOS/Android/Web.
- `iphone-duo-react-native` — soporte del iPhone plegable.
- `security-audit` — revisión de seguridad.
