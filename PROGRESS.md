# PROGRESS

Estado de FitTrack y cómo se verificó. Se actualiza en cada commit
(`CLAUDE.md §2.6`); la historia completa está en el **Log** (abajo) y en git.

## Estado actual (2026-11-16)

> `main` = versión "Foco a 10" (rama `SteveJobs` fusionada; la anterior en
> `v1`) + Fase 11e (Hoy toca con Cambiar, marcas desde datos, días de récord
> en verde, mapa del cuerpo SVG) + Fases 11f–11m, 15 (diario con fotos) y
> 16 (copia de seguridad, aviso del descanso bloqueado, fotos como
> archivos). Fase 14 descartada. Siguiente: manuales (R-129) y 5 vueltas
> Jobs (R-130).

| Área | Estado |
|---|---|
| Diseño | **Monocromo estilo X** en toda la app (negro/blanco/gris, botones blancos con texto negro, barra inferior X con iconos propios, sin reloj ni batería) |
| Inicio | Foto (cambiable) + "Empezar sesión" → hoja "Tu entreno de hoy", marcas personales, calendario, histogramas de actividad |
| Sesión | Ejercicio actual, descanso con cuenta atrás, hoja "¿Cómo se hace?", cardio, valoración, hápticos |
| Perfil | Datos fijos + calorías (explicadas) + temas (Noche/Día/Ámbar/Neón/Rubí) + nacionalidad y tema de bandera + idioma y datos |
| Idioma | **Todo en el idioma elegido** (NL/ES/EN/FR): interfaz, nombres de ejercicio, pasos "cómo se hace" (226 × 4), fechas; cambio instantáneo |
| Datos | 205 ejercicios reales de wger (sin duplicados); iconos de línea distintos por grupo; nunca 0 kg en ejercicios con carga |
| Web | **Una pantalla que crea un entreno** (mismo código, `EXPO_PUBLIC_WEB_MODE=planner`); Astro en la rama `web-astro` |
| Copia de seguridad | Perfil → Guardar / Restaurar (un archivo con todo, fotos incluidas) |
| Primer arranque | Un solo paso: "Hoy toca" + "Empezar sesión", marcas y Ejercicios (calendario e Historial aparecen con la 1.ª sesión) |
| i18n | NL/ES/EN/FR, **413 claves**, espejos idénticos; francés todo en "tu" |
| Imágenes (Fase 13) | **205/205 ejercicios con 3 dibujos** (156 de Everkinetic + 459 generados por el agente web, R-149); 306 por rehacer (`docs/fotos/DIBUJOS-A-ARREGLAR.md`); cuenta en `docs/fotos/STATUS.md` |
| Nube | ⏸ en espera |

## Fase 13 en curso

- 2026-11-21 (R-149): los 459 huecos llenos con los dibujos del agente web;
  306 por rehacer (`docs/fotos/DIBUJOS-A-ARREGLAR.md`).

## Última verificación commiteada (2026-11-21, WSL, commit dibujos + banca web)

- tsc **0** · tests **141/141** · export OK · capturas app 01–40 **errors none**
  (revisadas en hojas de contacto) · capturas web 24 a 393/834/1440
  **errors none** (nueva `2b-banca`) · vídeo 781 fotogramas ·
  **Jobs: NO** (dibujos por rehacer); commit por petición expresa del usuario.

## Verificación anterior (2026-11-16, WSL del host, commit Fase 21)

- tsc **0** · tests **129/129** · export OK · capturas app 01–39 **errors none**
  (miniaturas con dibujo en las listas; revisadas en hojas de contacto) ·
  capturas web 21 a 393/834/1440 **errors none** · vídeo 762 fotogramas ·
  **Jobs web SÍ, 86, Foco 10** (`docs/LOOP-21.md`) · app SÍ 90.

## Verificación anterior (commit Fase 13 · dibujos)

- tsc **0** · tests **129/129** · export OK · capturas 01–35 **errors none**
  (31 y 35 ahora con dibujo real, revisadas) · vídeo 559 fotogramas · **Jobs SÍ, 90**.

## Verificación anterior (commit Fase 20)

- tsc **0** · tests **129/129** · export OK · capturas 01–35 **errors none**
  (nueva 35: vídeo dentro de la hoja; cambian 08, 20, 31 con la fila) ·
  vídeo regenerado · **Jobs SÍ, 90**. Reproductor nativo sin probar en iPhone (R-128).

## Verificación anterior (commit Fase 19)

- tsc **0** · tests **129/129** (sin las secciones de la web Astro) · export OK ·
  `cd web && npm run build` OK y `npm run preview` sirve página, favicon y
  bundle (200) · capturas 01–34 **errors none** (sin cambios visibles) · **Jobs SÍ, 90**.

## Verificación anterior (commit Fase 18)

- tsc **0** · tests **151/151** · export OK · capturas 01–34 **errors none**
  (cambiadas en el bucle: 05–07, 09–14, 16, 18–19, 21, 25–26, 28, 30–34,
  revisadas) · vídeo **396 fotogramas** · **Jobs SÍ, 90/90** (`docs/LOOP-18.md`).
- Sin probar en dispositivo (R-128).

## Verificación anterior (commit Fase 16)

- `npx tsc --noEmit` (app) → **0 errores** · `node tests/run.js` → **151/151, 0 fallos**.
- `npx expo export --platform web` → OK · `npx expo config --type prebuild` → OK (plugins).
- Capturas **01–34**, **errors none**; cambia solo la 16 (Tus datos), revisada;
  el resto idénticas píxel a píxel. Vídeo **396 fotogramas**.
- **Prueba "Steve Jobs": SÍ, 90** (ver Log "Fase 16").
- Sin probar en dispositivo (lo hace el usuario, R-128).

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
- ⛔ Prueba en iPhone real (usuario, R-128): copia → Archivos, restaurar,
  aviso del descanso con el móvil bloqueado (necesita build de desarrollo).

## Log
- 2026-11-21 (2) — **Web: seguir la sesión (R-152), tiempo real (R-153),
  aclaración de la banca (R-154).** "Empezar entreno" bajo "Otro entreno"
  abre una sesión de una serie cada vez (tiempo total, Serie hecha,
  descanso grande con +15 s / Saltar y vibración, ¿Terminar?, "Bien hecho").
  La sesión ahora cabe en el tiempo elegido (antes 45 min podían ser 60+);
  opciones 1 h 30 y 2 h. Arreglos vistos en capturas: el pie de la web
  desbordaba en móvil (ahora se parte en líneas) y el resumen decía
  "2 × 10 × 42,5 kg" (ahora "2 × 10 reps · 42,5 kg"). Verificación: tsc 0 ·
  tests 150/150 · export OK · capturas web a 393/834/1440 errors none
  (nuevas `2c-2h`, `6-serie`, `6-descanso`, `6-terminar`, `6-resumen`),
  revisadas. Jobs (analyze): la web sigue en **NO** solo por los dibujos
  por rehacer (R-151); la sesión nueva en sí: un botón por pantalla, número
  grande, nada que configurar — sí.
- 2026-11-21 — **Dibujos (R-149) + banca en la web (R-150).** Entraron los
  459 dibujos del agente web (`fittrack-dibujos/`): revisados a mano en
  hojas de contacto. El usuario pidió (a mitad de tarea) añadirlos **todos**
  aunque no estén bien y hacer la lista de los que hay que rehacer:
  `docs/fotos/DIBUJOS-A-ARREGLAR.md` (306: 29 otro ejercicio, 6 duplicados,
  14 siluetas, 244 maniquíes, 6 cara/pelo, 7 calzado). `add_drawings.py`
  acepta `-3`; `make_photo_map.js` da crédito **por imagen** (`credits[]`,
  `slots[]`) para no quitar la atribución de Everkinetic en los ejercicios
  mixtos; etiqueta nueva "Técnica" para la 3.ª; créditos de Perfil y pie de
  la web mencionan los dibujos con IA. Web: pregunta "Press de banca · tu
  peso para 8 repeticiones" → 1RM Epley → nivel (<45 / <95 kg),
  series ±1, intensidad y marcas estimadas por cocientes prudentes
  (`lib/benchEstimate.ts`); los pesos salen en cada fila (mancuernas por
  mano). 8 tests nuevos. **Veredicto Jobs (analyze): NO** — lo que ama: la
  web ya da pesos concretos con una sola pregunta; cada ejercicio tiene
  dibujo. Por qué no: 29 dibujos enseñan otro ejercicio (p. ej. bicicleta en
  "Aperturas en polea") = dato falso; 14 siluetas salen como manchas
  blancas; mezcla de maniquíes y figuras anatómicas en el mismo ejercicio =
  dos lenguajes visuales. Para pasar a SÍ: rehacer los 306 de la lista.
  Commit hecho por petición expresa del usuario (`CLAUDE.md §1`).
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

- 2026-11-15 (noche, 7) — **SIN COMMIT. Versión "Foco a 10" (mejorada).**
  Petición: aplicar el recorte de `docs/FOCO-1.0.md` "para ver cómo queda",
  como versión mejorada, simplificando Perfil e Inicio; y "¿quitar la foto de
  Inicio o ponerla de fondo?". Hecho: 3 pestañas (Inicio · Entrenar · Perfil;
  Historial y Ejercicios desde Inicio con `BackBar`); Inicio con "Hoy toca:
  <grupos>" (`lib/nextSplit.ts`, compartido con la hoja rápida), sin foto de
  stock, calendario → historial de ese día, un solo gráfico; sin asistente
  ni "Personalizar entreno"; sesión con "Más opciones"; Perfil en 6 tarjetas
  (Cuerpo, Calorías plegadas, Sobre ti, Apariencia con "Más" temas y foto,
  Idioma, Tus datos). 12 claves i18n nuevas (376); "Sesión" → "Entrenar".
  Verificación: tsc 0 · tests 115/115 · export web OK · 22 capturas, 0
  errores de consola, revisadas (corregidos: accesos rápidos descentrados,
  puntos de "Más" en diagonal) · vídeo 251 fotogramas.
  **Veredicto `/stevejobs analyze`: SÍ** (incluso con el listón de una 1.0):
  la primera pantalla dice qué hacer hoy y la acción está a un toque; 3
  pestañas; una tarea por pantalla; lo raro, plegado; nada decorativo ni de
  stock. Pendiente que no bloquea: fotos reales (Fase 13), web (⛔ `npm ci`).
  **No se commitea hasta que el usuario lo vea** (último commit `37d851e`).

- 2026-11-15 (noche, 8) — **Ramas + Fase 11e.** Ramas: `v1` (37d851e, versión
  anterior), `SteveJobs` (68c4ec6, "Foco a 10"), fusionada en `main`
  (d99d3c5); SPEC/AGENTS al día (b40e9b4). Fase 11e: "Hoy toca" con
  **Cambiar** + regla del lunes + objetivo/duración; **marcas desde datos**
  (`lib/records.ts`) y test **"Establecer marcas"** (5 clásicos: banca,
  sentadilla, peso muerto, press militar, curl con barra) desde Perfil; sin 1RM
  manual; el generador usa la marca efectiva; **días de récord en verde**
  (`#00E676`); **mapa del cuerpo** semanal con **react-native-svg**
  (aprobado): curvas Bézier, frente/espalda, hombre/mujer, IMC; sustituye al
  histograma. Máquinas Matrix de Basic-Fit: investigado (Basic-Fit confirma
  Matrix, sin lista pública) y **descartado por el usuario**. 12 claves i18n
  nuevas (388). Verificación arriba.
  **Veredicto `/stevejobs analyze`: SÍ.** La primera pantalla dice qué toca
  y deja cambiarlo con un toque (default inteligente + salida fácil, sin
  menús); el cuerpo responde de un vistazo "¿qué me queda esta semana?";
  las marcas son reales. Reserva: el rojo de "3+" se lee como alarma
  (anotado en TASKS, decide el usuario). Primera versión del cuerpo hecha con
  Views → rechazada por "robot"; rehecha en SVG.

- 2026-11-15 (noche, 9) — **Fase 11f: cuerpo que se gira + vibración.**
  "3+" pasa a violeta (aceptado). `npm ci` de la web aprobado: build OK, i18n
  web regenerado; paridad web **en pausa** por el usuario. Mapa muscular
  rehecho con las **SVG de referencia del usuario** (`body/paths.ts`) en una
  peana con perspectiva que se gira con el dedo o con "Delante / Detrás"
  (sin dependencias nuevas; cara visible por opacidad porque
  `backfaceVisibility` falla en web). Vibración clara al acabar el descanso
  (`restDone()`). Pantalla de bloqueo (Live Activity): ⛔ necesita build
  propia + dependencias, se pregunta al usuario.
  **Veredicto `/stevejobs analyze`: SÍ** — manipulación directa (giras el
  cuerpo con el dedo y responde), arte de calidad, colores sin alarma.

- 2026-11-15 (noche, 10) — **Fase 11g: cuerpo en 3D real.** El usuario pidió
  girar la figura con el dedo en cualquier ángulo, sin botones, "como una
  cámara exterior". Aprobadas three, @react-three/fiber y expo-gl (+
  @types/three). `Body3D.tsx`: figura de volúmenes (tronco y extremidades
  como superficies de revolución, músculos como placas sobre la piel),
  contorno blanco por casco invertido, luz principal + contraluz, órbita
  libre con inercia suave. Primera versión ("globos") y segunda (piernas
  blancas: perfil del lathe del revés) corregidas tras mirarlas; músculos de
  piernas hundidos dentro del muslo → sacados a la superficie. Se borran
  `BodyMap.tsx` y `body/paths.ts` (en git). Harness: SwiftShader + `drag()`.
  Live Activity: **futuro, en espera** (decisión del usuario).
  **Veredicto `/stevejobs analyze`: SÍ** — manipulación directa real: tocas el
  cuerpo y gira e inclina en 3D. Siguiente nivel opcional: malla esculpida.

- 2026-11-15 (noche, 11) — **Fase 11h: fuera el cuerpo 3D.** El usuario pidió
  el cuerpo "exactamente como" una lámina anatómica: se construyó un écorché
  real con Z-Anatomy (CC BY-SA 4.0, BodyParts3D): músculos superficiales,
  cara, tendones, cráneo y huesos de manos/pies; 2,9 MB; script
  reproducible. `/stevejobs analyze`: **NO** (cadáver sin piel en la
  portada, dos lenguajes visuales, todo rojo, ocupa la pantalla, solo
  masculino, sin probar en iPhone). A petición del usuario: guardado en la
  rama `cuerpo-3d` (f05885f) y retirado de main con sus dependencias
  (three, @react-three/fiber, expo-gl, @types/three) y 6 claves i18n.
  **Veredicto para Inicio sin cuerpo: SÍ.**

- 2026-11-15 (noche, 12) — **Fase 11i: Foco a 10, fase 2.** Perfil de 7 a 4
  tarjetas (marcas fuera, calorías dentro de Cuerpo, idioma dentro de
  "Tus datos"); sesión con un solo acceso rápido ("Detalles" pasa a la hoja
  "¿Cómo ha ido?"); temas solo Noche y Día (fuera Ámbar/Neón/Rubí, banderas y
  nacionalidad; 10 claves i18n menos, 2 nuevas para el primer arranque);
  primer arranque con "Empieza por tus marcas" + "Establecer marcas". Foto de
  ejemplo: la resuelve el usuario aparte. Skill `stevejobs`: modo `refine`.
  **Veredicto `/stevejobs analyze`: SÍ** — una acción por pantalla, nada
  que sobre en Perfil ni en la sesión, y el primer minuto ya guía.

- 2026-11-15 (noche, 13) — **Fase 11j.** Probando en iPhone con Expo Go: error
  "View config not found for component BVLinearGradient" → `Gradient.tsx` sin
  `react-native-linear-gradient`. Peticiones: terminar en el último ejercicio
  (hoja final sin Modal + error visible), serie completa al indicar reps y
  peso, "—" sin peso, peso solo desde datos, sin "Detalles" (valores
  automáticos), licencias al pie de Perfil. 4 claves i18n nuevas (380).
  **Veredicto `/stevejobs analyze`: SÍ** — menos toques por serie, nada
  inventado, el final de la sesión es un toque.

- 2026-11-15 (noche, 14) — **SafeAreaView.** Aviso de Expo Go ("SafeAreaView
  has been deprecated") → `react-native-safe-area-context` (instalada con
  `npx expo install`, a petición del usuario) con `SafeAreaProvider` en App.
  Verificación: tsc 0 · tests 0 fallos · export web e iOS OK · 22 capturas, 0
  errores de consola (sin cambios visuales) · vídeo 183 fotogramas.

- 2026-11-16 — **Fase 11k.** Hoja final con un solo "Finalizar"; rueda tipo
  alarma del iPhone (sin "Usar", "Escribir", altura cm/m). 3 iteraciones
  refine → analyze con capturas (subtítulos fuera, evolución ≥ 3 puntos,
  "Añadir ejercicio" al final, fuera "1/3", "—" en filas plegadas, 1RM de
  series hechas, "+ Registrar" con contorno, historial agrupado). Petición
  del usuario: proponer funciones y pasarlas por 2 agentes UX → aplicadas
  A (resumen dentro de la hoja final; sin volumen por SPEC), B (progresión
  +2,5 kg con "Mantener"), C (récord en directo); D (discos por lado)
  descartada por suponer barra de 20 kg. Bugs del revisor: se guardaban
  series sin hacer (ahora solo las hechas) y el generador bajaba el peso con
  histórico. Nueva guía `docs/UX-PLAYBOOK.md`. i18n 388 claves.
  **Veredicto `/stevejobs analyze`: SÍ** — el final de la sesión por fin
  tiene su momento (resumen + récord), una marca verde con un solo
  significado, nada inventado (1RM y pesos solo de datos). Pendiente menor:
  ejercicios casi iguales en el generador, nombre del récord cortado,
  prueba en iPhone (⛔).

- 2026-11-16 (tarde) — **Fase 11l en curso.** Petición: bucle de 10 rondas
  con 2 revisores UX, aceptar solo lo perfecto, `/SteveJobs analyze` por ronda
  sin que baje ninguna nota, todo al playbook, arreglar pendientes (salvo
  vibración). Hecho: pendientes (movementKey; récord en 2 líneas) y rondas
  1–4 (78, 79, 80, 81). Rechazadas: títulos sin mayúsculas (SPEC, ⛔),
  cambiar datos de capturas para tapar un duplicado del catálogo (⛔ fusionar
  duplicados). El clasificador de seguridad falló a ratos; se comprobó con
  `git status` que los revisores no tocaron archivos. Playbook: §7 (bucle)
  y §8 (lista de detalles). **Veredicto ronda 4: SÍ (81).**

- 2026-11-16 (tarde) — **Fase 11l cerrada** (rondas 5–10 en esta pasada;
  detalle en `docs/LOOP-11l.md`). 2 revisores UX de solo lectura por ronda;
  aceptado solo lo perfecto. Fallos reales arreglados: series hechas de
  ejercicios aplazados que no se guardaban; "Quitar serie/ejercicio" borraba
  trabajo hecho sin avisar; "Borrar todos los datos" dejaba el perfil viejo
  en pantalla y la foto de Inicio; cancelar "Tu entreno de hoy" no
  cancelaba; duración guardada siempre = reloj (ahora corregible en "Bien
  hecho"); pesos imposibles ("37,1 kg") desde marcas; borrar la última
  sesión del día filtrado decía "aún no hay sesiones"; ruedas sin acciones
  de VoiceOver; casilla de cardio sin minutos; descanso tras la última
  serie; "Hacerlo ahora"/"Usar" sin foco. Pulido: fichas a 44 pt, primer
  arranque y nota del lunes más cortos, barra fija sin "Siguiente: X", "×"
  sin series cierra sin preguntar, Historial de un día sin fecha repetida,
  músculos como texto, serie "Test" y 1RM como texto, aviso a ancho
  completo, detalle con "CÓMO SE HACE", francés en "tu", "Ver todas".
  Rechazado con motivo (y ⛔ al usuario): "Hacerlo ahora" desde el inicio
  (R-11). **Prueba Jobs: SÍ** — 87 (Foco 9 · Simplicidad 10 · Cómo funciona
  10 · Punta a punta 10 · Oficio 10 · Artes liberales 9 · Autenticidad 10 ·
  1.ª impresión 9 · Funciona solo 10); motivos: cada pantalla con una
  acción, nada falso (pesos, minutos, diálogos), datos que no se pierden.
  Para subir más: Foco/1.ª impresión (Historial con el récord del día,
  Ejercicios con el título primero).

- 2026-11-16 (noche) — **Fase 11m** (decisiones del usuario): "Hacerlo
  ahora" en aplazados desde el primer momento (R-116; "Usar" con contorno,
  botones a 44 pt, nombres en 2 líneas, subtítulo nuevo); títulos de
  ejercicio en minúsculas y negrita (R-117, "como lo haría Jobs"); la
  pantalla de detalle se elimina: un ejercicio se ve siempre en la hoja
  "¿Cómo se hace?" con material · nivel (R-118); catálogo 226 → 205 (21
  duplicados fusionados con `scripts/dedupe_catalog.js`; historial, marcas
  y entreno en curso migran con `merged-ids`) (R-119); fuera "N sesiones
  este mes" (Inicio) y "N ejercicios" (Historial), repetidos (R-120).
  Verificación: tsc 0 · tests 135/135 · export OK · capturas 01–33, 0
  errores · vídeo 373 fotogramas. **Prueba Jobs: SÍ — 88** (Foco 9→10: una
  vista por ejercicio, nada repetido; resto igual). Siguiente: Fase 15.

- 2026-11-16 (noche) — **Fase 15 InstaGym**: el Historial pasa a diario:
  cada sesión es un post con fotos (4:3, deslizables), series, sensación y
  comentarios; acciones de texto "Añadir foto · Comentar" (+ "Quitar foto");
  comentario en la propia tarjeta ("Publicar"); tocar un comentario →
  "¿Borrar este comentario?"; "+ Añadir foto" opcional en "Bien hecho".
  Fotos en su propia clave (`lib/sessionPhotos.ts`, `store.updateSession`),
  fuera de la exportación; se borran con la sesión y con "Borrar todo".
  Fallo visto en las capturas y arreglado: la foto se salía de la tarjeta.
  Verificación: tsc 0 · tests 135/135 · export OK · capturas 01–34, 0
  errores · vídeo 393 fotogramas. **Prueba Jobs: SÍ — 89** (Artes liberales
  9→10: el diario con tus fotos y notas hace la app personal sin ruido
  social). ⛔: `expo-file-system` (dependencia) y paridad web (`npm ci`).

- 2026-11-16 — **Fase 16** (R-124…R-128). Peticiones: "Implement 1 [copia
  de seguridad]. 2 I do myself [iPhone]. Can you try 3 already [aviso del
  descanso bloqueado]? Do 4 [fotos como archivos]. Drop 5 [discos]".
  `npx expo install expo-file-system expo-notifications` (aprobadas).
  Copia v2 con fotos y foto de Inicio; restaurar valida (`parseBackup`:
  app, versión ≤ 2, sesiones con id) y confirma con fecha y nº de sesiones.
  Fotos nativas en archivos con migración automática de las viejas.
  Notificación local con permiso en el primer descanso, sin banner con la
  app abierta. 16 tests nuevos (ida y vuelta, ids fusionados, rechazo de
  archivos ajenos/más nuevos, v1). Verificación: tsc 0, 151/151, export OK,
  capturas sin errores (cambia la 16), vídeo 396 fotogramas.
  **Jobs SÍ, 90**: la copia cumple "sin cuenta" sin miedo a perderlo todo;
  el permiso se pide cuando tiene sentido. Pega: tres botones de contorno
  seguidos en "Tus datos" y nada probado en el teléfono real (R-128).
  Peticiones nuevas apuntadas: manuales para otra app (R-129) y 5 vueltas
  Jobs (R-130).

- 2026-11-16 — **Fase 17: manual portable** (R-129). Petición: "update
  documentations and manuals, so that I can give those to a separate app, and
  starting from zero, it will reach the same level of quality". Nuevo
  `docs/kit/` (README, 01-BOOTSTRAP, 02-METHOD, 03-ENGINEERING,
  04-QUALITY-GATES, 05-LESSONS, `templates/` con los 6 docs + brief de
  revisores + log del bucle). UX-PLAYBOOK enlaza el kit y suma copia de
  seguridad y permisos en contexto; AGENTS corregido (205 ejercicios, fotos
  como archivos). Solo documentación: la app no cambia (última prueba Jobs
  SÍ 90, Fase 16; tests 151/151).

- 2026-11-16 — **Fase 18: 5 vueltas Jobs** (R-130). Petición: "enter the
  /stevejobs and analyze, suggest, apply changes loop. Do this loop 5 times
  … ready for production". Base 86 (juzgando las 34 capturas) → **90/90**.
  V1 nombres a 2 líneas, mismo orden "min · series", "Guardar una copia";
  V2 Ejercicios alfabéticos, botones del aplazado iguales; V3 cabecera con
  lo que entrenas; V4 sin nota del lunes en el primer arranque; V5 sin
  calendario ni Historial vacíos en el primer arranque. Rechazada: tarjetas
  de marcas sin relleno (petición explícita del usuario). Verificación: tsc 0,
  151/151, export OK, capturas sin errores, vídeo 396 fotogramas.
  **Jobs SÍ, 90/90**; lo único pendiente para producción es el iPhone real
  (R-128). Lecciones añadidas a `docs/kit/05-LESSONS.md`.

- 2026-11-16 — **Fase 19: la web ES la app** (R-131). El usuario aprobó
  `cd web && npm ci` (hecho; el build Astro pasaba, 212 páginas) y eligió
  "Use the app's web build": `web/` pasa a ser `build.js` + `serve.js` +
  README (sin dependencias) que compilan `app/` con `expo export --platform
  web`; plantilla `app/public/index.html` (fondo negro, `lang="es"`,
  favicon). Astro guardado en la rama `web-astro`. Fuera de main:
  `tests/runtime.js`, `generate_web_i18n.py`, `generate_gym_browser.py`,
  espejos `web/src/*`, `docs/web-screenshots/`. Tests: los vectores de
  lógica corren sobre `gym.ts` (129/129). Preparado para la Fase 13: hoja
  "¿Cómo se hace?" con dibujos de línea teñidos al tema y crédito
  Everkinetic; `scripts/fetch_everkinetic.py`, `scripts/photo_status.js`;
  PROMPTS regenerado para 205 ejercicios (615). **Jobs SÍ, 90** (una sola
  app en todas las plataformas: punta a punta).

- 2026-11-16 — **Fase 20: vídeo por ejercicio dentro de la app** (R-133,
  R-134). Peticiones: "find a link to a youtube video … always keep the
  videos in english … Would SteveJobs approve this?" y "Can you embed the
  video … so the user never needs to leave the app?". Prueba Jobs al plan:
  **sí** como fila de texto con vídeos comprobados; **no** a una caja grande
  con miniatura ni a enlaces de búsqueda. Búsqueda en YouTube (una petición
  por ejercicio, con pausa), elección por puntuación (canales de tutorial,
  0:30–15:00, título con el movimiento) + revisión a mano (27 cambiados),
  oEmbed para comprobar que existe y se puede incrustar (1 sustituido):
  **203/205**. Reproductor con `react-native-webview` (aprobado; HTML con
  `baseUrl` https para evitar el error 153 de YouTube) y `<iframe>` en web.
  Verificación: tsc 0, 129/129, export OK, capturas sin errores (35 nueva),
  vídeo regenerado. **Jobs SÍ, 90**: enseñar el movimiento una vez vale más
  que tres párrafos, y no se sale de la app.

- 2026-11-16 — **Fase 13 (dibujos reales)** (R-132). Petición: "try to
  generate yourself or find online the pictures … keep a track of which
  pictures have been generated vs which ones not". Aquí no hay generador de
  imágenes (ni modelo ni API): en su lugar, los dibujos de **Everkinetic**
  en Wikimedia Commons (CC BY-SA 3.0, mismo tipo de licencia que wger).
  1089 archivos → 449 ejercicios con 2 fotogramas → 77 candidatos por
  nombre → **revisión visual de cada uno**: 63 instalados, 9 rechazados
  (press de banca de Commons = inclinado; mancuerna en vez de barra; boca
  abajo en vez de boca arriba; máquina en vez de barras), 5 a medio bajar
  por el límite de Wikimedia (429). Fondo transparente (alfa = oscuridad),
  recortados, gris+alfa (2,4 MB); orden invertido donde el 1.º era el final.
  `docs/fotos/STATUS.md`: ✏️ 126 · ⬜ 489 de 615 huecos. Capturas 31 y 35
  con dibujo. **Jobs SÍ, 90**: las líneas blancas encajan con el estilo X
  mejor que una foto de stock; todo real y acreditado.

- 2026-11-16 — Capturas **36–39** (dibujos: sentadilla, dominadas,
  elevaciones laterales y tema Día) y galería `docs/fotos/dibujos.png` (los
  63 dibujos) a petición del usuario ("I don't see the new exercises
  images"). Push a GitHub con la clave de rubiogarcia465179
  (`core.sshCommand` del repo). Capturas 01–39 sin errores de consola.

- 2026-11-16/17 — **Fase 21 + dibujos (trabajo autónomo nocturno)** (R-136,
  R-137, R-138). Peticiones: web solo-web de una pantalla (pedir datos →
  sesión; idioma arriba a la derecha; adaptable) y 10 vueltas Jobs hasta
  Foco 10; mostrar el dibujo en las listas; dibujos para el resto; 5 vueltas
  Jobs y commit al final. Hecho: `WebPlanner` con el mismo código de la app
  (modo de build), 10 vueltas 68 → **86, Foco 10** (`docs/LOOP-21.md`),
  miniaturas `ExerciseThumb` en todas las listas, `howto` centrada en
  pantallas anchas, NL "Halterstang"/"Dumbbell". Dibujos: +13 coincidencias
  revisadas a mano (78 en total, 156 imágenes); dibujar a mano no alcanza la
  calidad (Jobs: "nada barato"), así que `PROMPTS-DIBUJOS.md` (117) +
  `add_drawings.py` (marcados "generado con IA"). Verificación: tsc 0,
  129/129, capturas app 01–39 y web 21 sin errores, vídeo 762 fotogramas.

- 2026-11-17 — **Atribución CC BY-SA 3.0 de Everkinetic** (R-139). Petición:
  "Can you properly attribute to everkinetic, following their licenses?".
  Antes solo "Dibujo: Everkinetic, CC BY-SA 3.0" sin enlaces ni cambios.
  Ahora: título/autor + fuente + licencia + cambios (TASL) — en la hoja
  "¿Cómo se hace?" (texto "(modificado)" que abre el original en Commons),
  en Perfil → Licencias y créditos (cambios, ShareAlike y enlaces a la
  licencia y a la lista) y en el pie de la web; `docs/CREDITOS-DIBUJOS.md`
  (156 archivos: original, autor, licencia, cambios), `LICENSE.md` de la
  carpeta, README y la galería con la línea de licencia. Verificación: tsc 0,
  129/129, capturas app 01–39 y web sin errores.

- 2026-11-17 — **Prompts para OpenAI vía Codex** (R-140). Petición: "give me
  the exact prompt to give OpenAI to generate the images according to the
  everkinetic ones … for everyone … maintain a list … I will open a session
  with codex" y "provide the folder to take images as example. Add in the
  prompt". Hecho: `docs/fotos/referencias/` (los 156 dibujos de Everkinetic en
  negro sobre blanco, 2 MB), 254 prompts (127 ejercicios × 2) que nombran esa
  carpeta y los 4 ejemplos a adjuntar (2 generales + 2 del mismo grupo y
  material; la imagen 2 adjunta además la 1), `prompts-dibujos.json`,
  `scripts/generate_drawings_openai.py` (curl, sin dependencias, dry-run
  probado), `add_drawings.py` que actualiza mapa, créditos, STATUS (con lista
  de pendientes) y prompts, y la guía `docs/fotos/CODEX-DIBUJOS.md`.

- 2026-11-17 — **Icono nuevo** (R-141). Petición: "The icon of both app and
  website is a bit ugly … a very appealing icon, that would be approved by
  SteveJobs". El viejo: mancuerna genérica azul con esquinas blancas
  pegadas (iOS ya redondea). 3 rondas de conceptos (barra inclinada, perfil
  de barra, check, check+barra, disco, disco con aro, barra "heroica")
  juzgados a 180/60/29/16 px sobre fondos claro y oscuro. **Gana el círculo
  blanco con check negro**: una idea, se lee a 16 px, es el botón de "serie
  hecha" (el icono es el momento central de la app) y monocromo. Refinado:
  centrado óptico, profundidad sutil. Aplicado a icono iOS/Android
  (adaptativo con fondo negro), splash negro, favicon 32/192, apple-touch-icon
  y la cabecera de la web. Vista previa: `docs/icon/preview.png`. Jobs (crítica
  imaginada): SÍ — restricción que destaca entre iconos de colores; reserva:
  por sí solo no dice "gimnasio", lo dice el nombre debajo.

- 2026-11-17 — **Fase 22: paquete de tiendas** (R-142). Petición: "Can you
  do 5?" (preparar App Store y Google Play). `app.json` listo para revisión
  (bundle ID, solo iPhone y vertical, texto del permiso de fotos, cifrado
  declarado, permiso de notificaciones), `app/eas.json`, fichas en 4 idiomas
  (límites de Apple/Google comprobados por script), 40 capturas a los
  tamaños exigidos (Apple 6,9" 1320×2868; Google 1080×2160) con titular,
  gráficos destacados 1024×500, `/privacy.html` y `/support.html` en la web
  (4 idiomas, honestas: sin recogida de datos; YouTube al tocar "Ver vídeo"),
  y la guía `docs/store/README.md`. Verificación: `expo config` válido, web
  build con las dos páginas, capturas de tienda sin errores de consola.

- 2026-11-17 — **Fase 23** (R-128, R-143…R-145). Tras `/stevejobs Critique`
  (NO, 77/90: sin iPhone, dos lenguajes visuales, imagen de ejemplo falsa,
  nombres de base de datos, demasiadas funciones), el usuario: "I tested
  already on iphone and works well … Fix 4. drop 5, 3, 2. And where there is
  no image, show no drawing, unless a image is added in the codebase".
  Hecho: iPhone fuera de pendientes; 205 nombres de pantalla EN/NL naturales
  (sin tocar la lógica, que sigue con los de wger); hoja sin imagen cuando no
  hay imagen propia (captura 40); crédito de la imagen de ejemplo fuera.
  Verificación: tsc 0, tests 133/133, capturas app 01–40, web y tienda sin
  errores, vídeo 801 fotogramas.
