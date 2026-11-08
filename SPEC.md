# SPEC — FitTrack

Monitor de progreso de gimnasio: base de ejercicios, registro de sesiones
(juegos × repeticiones × peso), historial y dashboard de resumen. Interfaz
web estática + app Android/iOS (Expo). **Sin backend en el MVP**: datos
embebidos (JSON) y persistencia local (localStorage / AsyncStorage).

## Ámbito

### 1. Base de ejercicios (`data/exercises/all.json`)
- ≥ 50 ejercicios. Campos: `id`, `name_en`, `name_nl`, `aliases`,
  `muscle_group` (chest/back/legs/shoulders/arms/core/cardio/full_body),
  `secondary_muscles`, `equipment` (barbell/dumbbell/machine/cable/bodyweight/other),
  `level` (beginner/intermediate/advanced), `instructions` (paso a paso),
  `image` (ruta), `source` ("seed" | "real").
- Fuente: `seed` (fuentes reales inaccesibles desde el sandbox). Las
  instrucciones en inglés (idioma de origen del dataset); nombre en NL y EN.

### 2. Sesiones (modelo de datos, persistencia local)
- `session: { id, date, exercises: [{ exercise_id, sets: [{ reps, weight_kg, rpe? }] }], notes?, duration_min? }`
- Peso corporal opcional por sesión para el dashboard de peso.

### 3. Dashboard de resumen
- Volumen semanal (kg totales), frecuencia (sesiones/semana), PR estimados
  (1RM = peso × (1 + reps/30), Epley), progresión por grupo muscular, racha
  de días, tendencia de peso corporal.

### 4. Web (Astro 4, `output: 'static'` + Tailwind 3.4)
- `/` — dashboard (métricas + últimos registros).
- `/exercises/` — biblioteca: búsqueda, filtros por grupo/equipo, detalle con
  instrucciones e imagen (SSR).
- `/session/` — registro de nueva sesión (ejercicio → sets → reps/peso).
- `/history/` — historial de sesiones.
- i18n: HTML inicial en idioma por defecto; JS embebido traduce en memoria
  (0 peticiones de red).
- Accesibilidad: labels, aria, foco visible, contraste; mobile-first.

### 5. App (Expo SDK 51 / React Native 0.74)
- Mismas 4 vistas en pestañas: Dashboard, Biblioteca, Sesión, Historial.
- Persistencia en AsyncStorage; mismo modelo de datos que la web.

### 6. i18n
- Bundles `nl/es/en/fr` en `i18n/` (y espejos en `web/src/i18n/` y
  `app/src/i18n-data/`). Cada bundle completo e idéntico en nº de claves.

## Fases y criterios de aceptación

- **Fase 0 — Estructura** (repo + docs + git): estructura del prompt
  creada; `git init` + primer commit.
- **Fase 1 — Datos**: `data/exercises/all.json` con ≥ 50 ejercicios
  (source: seed); imágenes placeholder generadas; `data/datasets.json`;
  `scripts/sync_data.py` + `scripts/rehydrate.sh`.
  Aceptación: JSON válido, todos los campos presentes, tests de integridad en
  verde.
- **Fase 2 — Web**: 4 páginas; `npm run build` verde; `npm run preview
  -- --host` → HTTP 200 en cada ruta y en todos los assets; datos SSR.
- **Fase 3 — App**: `npx tsc --noEmit` 0 errores; bundle Metro OK; 4
  pestañas; persistencia funcional.
- **Fase 4 — i18n**: 4 bundles completos, mismo nº de claves que `en.json`;
  conmutación instantánea en web y app (sin red).
- **Fase 5 — QA**: `node tests/run.js` → 0 fallos; verificación de todos los
  assets referenciados (200).
- **Fase 6 — Datos reales (⛔ bloqueado)**: regenerar la base desde wger u
  otra fuente pública con fotos reales. Requiere allowlist del sandbox o
  ejecución fuera (instrucciones en `TASKS.md`).

## Fuera de alcance (MVP)
- Backend/API, cuentas de usuario, sincronización multi-dispositivo,
  supleméntos/dieta, integraciones (Apple Health, Google Fit), notificaciones.
  (Posibles fases posteriores.)
