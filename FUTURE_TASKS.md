# FUTURE_TASKS — FitTrack

Peticiones del usuario marcadas como **futuras** (no se hacen todavía). Cuando
toque, pasan a `TASKS.md` como fase y se apuntan en `REQUIREMENTS.md`.

## R-173 — Objetivo de calorías por entreno (2026-11-21)
- Cada sesión tiene un objetivo de kcal (según objetivo, peso y duración).
- Si al acabar no se ha llegado, sugerir qué ejercicio hacer para llegar,
  usando la **frecuencia cardiaca acumulada** durante el entreno.
- Depende de R-174 (sin pulso real, cualquier cifra sería inventada: regla de oro).

## R-174 — Google Health / Fitbit (2026-11-21)
- Al empezar un entreno en la app o la web, iniciar automáticamente un
  ejercicio en segundo plano en Fitbit.
- Leer las calorías quemadas (y el pulso) **en tiempo real** durante la sesión.
- Necesita: cuenta de desarrollador de Google, OAuth, la API de Google
  Health / Fitbit Web API y su revisión de permisos; en el iPhone, posible
  módulo nativo. Decisión y credenciales: ⛔ del usuario.
- Comprobar antes qué permite hoy la API (iniciar un ejercicio a distancia
  puede no estar disponible; leer datos casi en tiempo real sí suele estarlo).
