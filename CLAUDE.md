# CLAUDE.md — reglas de siempre

Instrucciones que se aplican en **todas** las sesiones y a **cualquier
agente** que reciba este repo.

## 0. Si acabas de llegar al repo

1. Lee `SPEC.md` (qué quiere el usuario: visión, diseño, pantallas).
2. Lee `TASKS.md` → sección **"Cómo continuar"** y trabaja en su orden.
3. Mira `PROGRESS.md` (estado real, última verificación, qué hay sin
   commitear) y las capturas de `docs/screenshots/`.
4. `AGENTS.md` tiene el entorno, la estructura y los comandos.
5. Lo marcado ⛔ necesita una decisión o aprobación del usuario: pregunta.

## 1. Cuándo se commitea

- **Solo al terminar una fase completa** de `TASKS.md` (todas sus casillas
  `[x]`, o las que queden marcadas ⛔ con su motivo) **y** con la prueba
  "Steve Jobs" en **sí** (§2.5). Si el usuario pide expresamente un commit
  antes, se hace (y se anota).
- Siempre en `main`, nunca en ramas.
- Mensaje en español: qué cambió, por qué y la verificación real (números:
  tests, tsc, capturas, veredicto).

## 2. Antes de CADA commit (en este orden)

1. **Tests y tipos**: `npx tsc --noEmit` (app) = 0 errores y
   `node tests/run.js` = 0 fallos.
2. **Build web de la app**: `npx expo export --platform web --output-dir /tmp/ft-dist`.
3. **Capturas + vídeo**: regenerar `docs/screenshots/NN-*.png` y
   `docs/screenshots/video-iphone16.mp4` con `app/qa/shots/` (pasos en
   `docs/screenshots/README.md`). Si la UI cambió, añadir los pasos nuevos
   a `app/qa/shots/scenario.js`.
4. **Comprobar que se ve bien**: abrir y mirar **cada** captura. Revisar:
   nada cortado/solapado/desbordado; ningún icono "tofu" □ ni emoji; una
   sola acción principal por pantalla; contraste legible; objetivos ≥ 44 pt;
   coherencia con `SPEC.md §1` (monocromo estilo X, botones blancos con
   texto negro, sin reloj ni batería); 0 errores de consola del harness.
   Si algo falla: arreglar, regenerar y volver a mirar.
5. **Prueba "Steve Jobs"**: ejecutar la skill `stevejobs` en modo `analyze`
   (`/SteveJobs analyze` o `/stevejobs analyze`; crítica imaginada a partir de
   sus principios públicos). Pregunta: *¿aprobaría Steve Jobs lanzar esta
   versión como producto de Apple?* Responder **sí/no** con motivos
   concretos, mirando las capturas reales.
   - **"No"** → arreglar todo lo que impide el "sí" y repetir 1–5. No se
     commitea con un "no".
   - Lo que no cabe en la fase (dependencia nueva, decisión del usuario,
     prueba en dispositivo) → `TASKS.md` como ⛔ con su motivo y se le dice
     al usuario; nunca se ignora.
   - El veredicto y sus motivos se anotan en el log de `PROGRESS.md`.
   - **Marco (decisión del usuario, 2026-11-15)**: se evalúa FitTrack como una
     **versión 2.0**: el número actual de funciones es aceptable (el recorte
     para una 1.0 está aparcado en `docs/FOCO-1.0.md`). Las fotos de ejemplo
     **marcadas como tales** no bloquean el commit mientras la Fase 13 esté
     pendiente. Sí bloquea todo lo demás: diseño, idioma, bugs, datos falsos.
6. **Actualizar los 6 documentos** para que otro agente pueda continuar sin
   contexto previo:
   - `SPEC.md` — la visión y las pantallas tal como el usuario las quiere
     ahora (si cambió algo de producto o diseño).
   - `TASKS.md` — "Cómo continuar", lo pendiente en orden, lo hecho, los ⛔.
   - `PROGRESS.md` — estado, última verificación (output real), entrada de
     log con lo hecho, decisiones y veredicto Jobs.
   - `REQUIREMENTS.md` — cada petición nueva del usuario como R-xx con
     estado y verificación.
   - `AGENTS.md` — entorno, comandos y reglas técnicas si cambiaron.
   - `CLAUDE.md` — si el usuario dio una regla nueva "para siempre".
   (Y `docs/screenshots/README.md` si cambió la lista de capturas.)
7. Commit con capturas, vídeo, código y docs juntos.

Si un paso no se puede ejecutar (p. ej. falta una dependencia), se dice con el
error real y se apunta en `PROGRESS.md`; no se da por bueno.

## 3. Siempre

- Ejecutar node/npm/tsc/tests **dentro de WSL**
  (`wsl.exe -d Ubuntu-24.04 sh -c 'cd ~/fittrack && …'`); para rutas `/tmp`
  desde Git Bash, `MSYS_NO_PATHCONV=1`.
- No añadir dependencias ni ejecutar `npm install`/`npm ci` sin aprobación.
- Paridad app ↔ web: si no da tiempo, se apunta en `TASKS.md`.
- i18n: toda cadena nueva en los 4 idiomas (NL/ES/EN/FR) y en los 3 espejos.
- Regla de oro de datos: nada inventado se presenta como real; citas de
  personas reales solo con fuente verificable.
- Mensajes del usuario a mitad de tarea: se apuntan en `TASKS.md` /
  `REQUIREMENTS.md` aunque no se hagan en ese momento.
