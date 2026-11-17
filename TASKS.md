# TASKS — FitTrack

Estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado (con motivo) ·
`⏸` en espera. El detalle de lo hecho está en `PROGRESS.md` y en git.

## Cómo continuar (para el siguiente agente)

1. Lee `CLAUDE.md` (reglas de siempre) y `SPEC.md` (qué quiere el usuario).
2. Trabaja **en el orden de esta lista**, de arriba abajo.
3. **No commitees** hasta cerrar una fase y que la prueba "Steve Jobs" dé
   **sí** (`CLAUDE.md §2`; se evalúa como **versión 2.0**). Estado al
   2026-11-16: **Fases 11l, 11m y 15 en `main`** (Jobs 89). Fase 14
   **descartada** (R-123). **Fase 16** (copia de seguridad, aviso del
   descanso bloqueado, fotos como archivos) en `main`. **Fase 17**
   (manual `docs/kit/`) y **Fase 18** (5 vueltas Jobs, 86 → 90,
   `docs/LOOP-18.md`) hechas. **Fase 19**: la web ES la app (`web/` =
   build web; Astro en la rama `web-astro`). **Fase 21**: la web pública es
   una pantalla que crea un entreno (Jobs 86, Foco 10). **En curso: Fase 13** con
   dibujos reales de Everkinetic (`scripts/fetch_everkinetic.py`, estado en
   `docs/fotos/STATUS.md`). Prueba en iPhone: la hace el usuario (R-128).
4. Las decisiones que necesitan al usuario están marcadas ⛔: pregúntaselas,
   no las supongas.

## Ahora

### Fase 11d — Prueba "Steve Jobs" (2026-11-15: SÍ como versión 2.0) ✅
Hecho en esta pasada:
- [x] Un solo lenguaje de diseño: toda la app en el tema monocromo estilo X
      (negro, blanco, gris; botones blancos con texto negro).
- [x] Barra inferior estilo X (ancho completo, negra, solo iconos).
- [x] Temporizador de descanso (`rest_after`, +15 s, Saltar, vibración).
- [x] Hoja "Tu entreno de hoy" antes del entreno recomendado (duración,
      intensidad, energía, objetivo) → "Continuar al entreno".
- [x] Marcas personales en Inicio (3 tarjetas blancas + "Ver todo").
- [x] Sin reloj ni batería; cabecera de sesión "Sesión · x/y series".
- [x] Nunca 0 kg en ejercicios con carga (`conservativeOneRm` "otro" → 15).
- [x] Material "Otro" oculto en metadatos; pestaña "Inicio/Home/Start/Accueil".
- [x] Sin imágenes placeholder (biblioteca, historial, detalle): iconos de
      línea; foto solo en Inicio.
- [x] Nombres de ejercicios en ES/FR (226, traducción local declarada en
      `source_note`; `data/exercises/names-i18n.json` +
      `scripts/merge_exercise_names.js`; helper `exName()`).
- [x] Historial sin volumen.
- [x] Inicio: foto + "Empezar sesión" arriba (foto propia opcional: web ya;
      iPhone ⛔ `expo-image-picker`), sin fecha/semana/racha, calendario
      rediseñado (lunes primero, círculos), histogramas de actividad (hora y
      día de la semana) al final.
- [x] Temas en Perfil: Noche, Día (inverso), Ámbar, Neón, Rubí; y
      **nacionalidad** (20 países) + interruptor "Usar los colores de mi país"
      (`app/src/theme-flags.ts`).
- [x] Explicación sencilla de metabolismo basal vs gasto diario (Perfil).
- [x] Skill `/stevejobs` (+ comando `/SteveJobs`) para la prueba Jobs.
- [x] Bandera de España roja y amarilla (todas las banderas reconocibles).
- [x] Hoja "¿Cómo se hace?" en la sesión (fotos de ejemplo marcadas, qué
      entrena, pasos). **Fotos reales**: déjalas en
      `data/images/photos/<id>-1.jpg … -3.jpg` y ejecuta
      `node scripts/make_photo_map.js`.
- [x] `expo-haptics` + `expo-image-picker` instalados (aprobado): hápticos y
      foto propia en iPhone.
- [x] Iconos propios de la barra inferior (estilo Instagram).
- [x] Equipo traducido ("Barra", "Polea", "Kabel").
- [x] **Todo en el idioma elegido**: pasos "cómo se hace" para principiantes
      en NL/ES/EN/FR (226 × 3, `data/exercises/howto/`, `howtoFor`), fechas
      localizadas (Historial "dom 15 nov"), meses NL, campo "fecha".
- [x] Icono de línea **distinto por grupo** (`GroupGlyph`).
- [x] Nunca 0 kg: `back_squat` ya no se toma por peso corporal.
- [x] Historial sin volumen.

- [x] Probado en iPhone real (lo hizo el usuario, 2026-11-15).
- [x] La foto de Inicio se cambia en **Perfil → "Foto de Inicio"** (Cambiar
      foto / Restablecer); Inicio ya no lleva botón encima de la foto.
- [x] **Prueba Jobs como versión 2.0** (decisión del usuario): **SÍ** →
      commit de las Fases 11c + 11d.
- [x] Recorte "Foco a 10" **aplicado y mejorado** (`docs/FOCO-1.0.md`):
      3 pestañas, Inicio "Hoy toca" sin foto de stock, calendario → día,
      "Más opciones" en la sesión, Perfil en 6 tarjetas. Prueba Jobs: **SÍ**.
- [x] El usuario la aprobó: rama `SteveJobs` fusionada en `main`
      (`d99d3c5`); la anterior queda en la rama `v1` (`37d851e`).
- ⛔ Fotos reales por ejercicio (Fase 13, las genera el usuario). No bloquean
  el commit: la foto de ejemplo va marcada.

### Fase 11e — Inicio que decide por ti, marcas reales y mapa del cuerpo ✅
- [x] "Hoy toca" + **Cambiar** (un toque) + regla del lunes (pecho al final)
      + línea con objetivo y duración.
- [x] Marcas personales **solo desde datos**: mejor serie (Epley) o test
      **"Establecer marcas"** en Perfil con los 5 clásicos; el generador usa
      la marca efectiva.
- [x] Días de récord en **verde llamativo** en el calendario (+ leyenda).
- [x] **Mapa del cuerpo** semanal (SVG, frente/espalda, hombre/mujer, IMC):
      1 verde · 2 naranja · 3+ rojo. Sustituye al histograma de actividad.
- [x] IMC con coma decimal en ES/FR/NL.
- [x] "3+" en **violeta** (el rojo se leía como alarma; aceptado por el usuario).

### Fase 11m — Decisiones del usuario sobre la 11l ✅ (Jobs SÍ, 88)
- [x] Aplazados: "Hacerlo ahora" desde el primer momento; "Usar" con
      contorno; botones a 44 pt; nombres en 2 líneas (R-116).
- [x] Títulos de ejercicio en minúsculas y negrita, sin MAYÚSCULAS (R-117).
- [x] Detalle de ejercicio = hoja "¿Cómo se hace?" (+ material · nivel) (R-118).
- [x] Catálogo sin duplicados: 21 fusionados → 205 (historial migrado)
      (R-119); fuera "N sesiones este mes" e "N ejercicios" repetidos (R-120).
- ⏸ Probar en iPhone: todavía no (R-121).
- Después: Fase 15 (InstaGym), si la prueba Jobs lo aprueba (R-122).

### Fase 11l — Bucle de 10 rondas (2 revisores UX + Jobs) ✅ (87)
Pedido 2026-11-16: en cada ronda dos agentes UX proponen; solo se acepta lo
perfecto; `/SteveJobs analyze` al final de cada ronda; ninguna nota puede
bajar; todo lo aprendido al playbook; arreglar los pendientes salvo la
vibración. Log completo, brief de los revisores y receta: `docs/LOOP-11l.md`.
- [x] Pendientes de la 11k: sin ejercicios casi iguales en una sesión
      (`movementKey` en `lib/workout.ts`, con test) y nombre del récord en
      2 líneas en el resumen.
- [x] Ronda 1 (78): "Exportar datos" con contorno y sin verde · "Mantener
      50 kg" como acción aparte · fuera el aviso "Siguiente: X" · ≥ 44 pt ·
      erratas FR/NL.
- [x] Ronda 2 (79): sin "· 0 kg" en peso corporal · Noche/Día juntos ·
      "TUS DATOS" como etiqueta · Historial "min" sin cursiva · diálogo de
      descartar que bloquea ("Cancelar | Descartar") · VoiceOver en el
      descanso · "Finalizar" en todos los modos.
- [x] Ronda 3 (80): tras Finalizar → Inicio · "PRÓXIMA" si ya entrenaste
      hoy · "Cambiar" accesible y 44 pt · botón principal plano · "Bien
      hecho".
- [x] Ronda 4 (81): Ejercicios monocromo (fichas 44 pt, etiquetas, nombres
      en 2 líneas) · detalle traducido y sin alias en otro idioma · test de
      marcas con reps "—" y sin copiar el peso del calentamiento.
- [x] Ronda 5 (82): primer arranque y nota del lunes más cortos · "Tu entreno
      de hoy" a 44 pt y en filas · sin descanso tras la última serie · "×"
      sin series cierra sin preguntar · cardio sin minutos no se marca ·
      etiquetas VoiceOver ("Saltar descanso", "Eliminar sesión, <fecha>").
- [x] Ronda 6 (83): fuera "Siguiente: X" de la barra fija · las series
      hechas de un ejercicio aplazado se guardan y cuentan · "Quitar serie"
      solo quita pendientes · "Quitar ejercicio" con series hechas confirma
      (captura 32).
- [x] Ronda 7 (84): borrar datos refresca Perfil · borrar la última sesión
      del día filtrado vuelve a la lista · ruedas ajustables con VoiceOver ·
      Historial de un día sin fecha repetida · músculos como texto en
      "¿Cómo se hace?" · serie "Test" en el test de marcas.
- [x] Ronda 8 (85): pesos en múltiplos de 2,5 kg también desde marcas ·
      aviso a ancho completo y opaco · "1RM estimado" como texto · minutos
      del resumen corregibles · cancelar "Tu entreno de hoy" descarta.
- [x] Ronda 9 (86): detalle con "CÓMO SE HACE" como la hoja · "Hacerlo
      ahora"/"Usar" enfocan el ejercicio · borrar datos borra la foto.
- [x] Ronda 10 (87): diálogo de descartar sin frase falsa con 0 series ·
      VoiceOver sin "— kg" en peso corporal · francés todo en "tu" · "Ver
      todas" igual en Inicio e Historial.
- [x] Docs al día, capturas 01–32, vídeo, prueba Jobs **SÍ (87)**, commit
      "Fase 11l" en `main`.
- [x] Decisiones del usuario resueltas en la Fase 11m (iPhone: todavía no).

### Fase 11k — Finalizar, rueda, 3 iteraciones Jobs y 3 funciones revisadas por UX ✅
- [x] Hoja final: un solo "Finalizar" (barra fija también "Finalizar").
- [x] Rueda tipo alarma del iPhone en todos los números; sin "Usar";
      "Escribir" para números grandes; altura cm / m.
- [x] 3 iteraciones refine → analyze (capturas en cada vuelta): fuera
      subtítulos obvios (Perfil, Historial, Ejercicios), evolución solo con
      ≥ 3 puntos, "Añadir ejercicio" al final de la lista, fuera "1/3",
      "—" también en filas plegadas, 1RM solo de series hechas, "+ Registrar"
      con contorno, nombres de marcas en 3 líneas, historial "4 × 8 · 50 kg".
- [x] Propuestas (docs/PROPUESTAS-11k.md) revisadas por 2 agentes UX
      (interacción + visual/producto) y aplicadas: **resumen al terminar**
      (dentro de la hoja final, sin volumen por SPEC), **progresión
      automática** (+2,5 kg con "Mantener"), **récord en directo** (círculo
      verde + háptico). **Discos por lado: descartado** (suponía barra de
      20 kg como un hecho).
- [x] Bug (revisor UX): se guardaban series sin hacer → solo las hechas
      (`completedExercises`, también cardio); sin ninguna, ofrecer descartar.
- [x] Bug: el generador proponía menos peso del levantado (1RM × 70 % a 8
      reps) → con histórico manda la progresión.
- [x] Guía reutilizable `docs/UX-PLAYBOOK.md` (prompt único para otra app).
- [x] El generador evita ejercicios casi iguales en la misma sesión (11l).
- [x] Nombre del récord en 2 líneas en el resumen final (11l).
- [ ] ⛔ Probar en iPhone: háptico de récord, "Mantener", copia del peso.
- [x] "Discos por lado": descartado por el usuario (R-127).

### (Pedido original de la 11k)
- [x] **Terminar la sesión**: en la hoja final, un solo botón "Finalizar"
      (guarda con o sin valoración); fuera "Guardar sesión" + "Finalizar sin
      valorar".
- [x] **Selector de números tipo ruleta** (como la alarma del iPhone) en
      TODOS los números (peso, reps, minutos, km, año…): sin botón "Usar";
      el botón blanco muestra el valor elegido y confirma. Si el número
      puede ser grande, se escribe con teclado. Altura: número + unidad
      (cm / m).
- [x] **Iterar ≥ 3 veces** con `/SteveJobs refine` → `analyze`: aplicar y
      corregir detalles, proponer y mejorar la UX hasta que cada pantalla
      sea un 10 (capturas y prueba Jobs en cada vuelta).

### Fase 11j — Sesión más directa + licencias al pie ✅
- [x] Último ejercicio: "Terminar y guardar" siempre; la hoja final ya no es
      un Modal (en iOS no se abría si otro Modal se estaba cerrando); el
      error de guardado se ve junto al botón.
- [x] Serie hecha al indicar reps y peso; ✓ activo solo con la serie
      completa; "—" sin peso.
- [x] Peso recomendado solo desde la marca o el histórico (fuera la base
      "prudente" por material).
- [x] Fecha, duración, peso y altura automáticos: fuera "Detalles".
- [x] Licencias y créditos al pie de Perfil; fuera del detalle de ejercicio.
- [x] Expo Go: `Gradient` sin `react-native-linear-gradient` (no existe en
      Expo Go: "View config not found for component BVLinearGradient").
- [x] `SafeAreaView` → `react-native-safe-area-context` (SafeAreaProvider en App).

### Fase 11i — Foco a 10, fase 2 ✅
- [x] Perfil en **4 tarjetas** (Cuerpo + calorías, Sobre ti, Apariencia,
      Ajustes); marcas fuera de Perfil (están en Inicio).
- [x] Sesión con **un solo acceso rápido** ("Añadir ejercicio"); "Detalles"
      pasa a la hoja "¿Cómo ha ido?".
- [x] Temas: **solo Noche y Día**; fuera Ámbar/Neón/Rubí, banderas y
      nacionalidad (sin UI).
- [x] **Primer arranque**: Inicio invita a "Establecer marcas".
- ⏸ Foto de ejemplo en "¿Cómo se hace?": la resuelve el usuario aparte
  (se mantiene la de ejemplo, marcada).
- [x] Skill `stevejobs`: nuevo modo **refine** (mejorar la app para que sea
      simple, clara, minimalista y artística).
- [ ] Web: igualar el diseño o retirarla (decisión del usuario).

### Fase 11h — Fuera el cuerpo 3D (foco) ✅
- [x] Écorché anatómico (Z-Anatomy, CC BY-SA) construido e integrado, pero la
      prueba Jobs dio **NO** → guardado en la rama `cuerpo-3d` (f05885f).
- [x] Quitado de Inicio en main + dependencias 3D desinstaladas.
- [ ] Para volver algún día (si el usuario lo pide): escultura monocroma
      (solo los grupos trabajados en color), cabeza lisa sin cara, tamaño
      compacto con vista a pantalla completa, cuerpo femenino o neutro,
      prueba en iPhone.

### Fase 11g — Cuerpo en 3D real, orbitable con el dedo ✅ (retirado en la 11h)
- [x] three + @react-three/fiber + expo-gl (aprobados): figura anatómica de
      volúmenes, contorno blanco, órbita libre (girar + inclinar) con
      inercia, sin botones; colores por semana; sexo e IMC.
- [ ] (Opcional, futuro) Malla esculpida por un artista (glTF con músculos
      separados) para un acabado de escultura; requiere el modelo y su
      licencia.
- ⏸ **Live Activity completa (FUTURO, en espera por decisión del usuario)**:
  estado de la sesión y cuenta atrás del descanso en la pantalla de bloqueo
  (iOS Live Activity + Android notificación en curso) con "Serie hecha"
  desde ahí u otra app. Requiere build de desarrollo (EAS, no Expo Go) y un
  plugin nativo.

### Fase 11f — Cuerpo que se gira + vibración al acabar el descanso ✅
- [x] Mapa muscular con las SVG de referencia del usuario (sustituido en
      la 11g por el 3D real; queda en git, 1c79c87).
- [x] Vibración clara al terminar el descanso (`restDone()`).
- ⛔ **Pantalla de bloqueo** durante la sesión (estado, cuenta atrás del
  descanso bajando y "Serie hecha" desde ahí): iOS Live Activity (extensión
  de widget nativa) / Android notificación en curso → requiere build propia
  (no funciona en Expo Go) y dependencias nuevas. Paso intermedio posible:
  `expo-notifications` (notificación programada al acabar el descanso, con
  vibración aunque el móvil esté bloqueado) → **hecho en la Fase 16**.
- [x] Paridad web: resuelta en la Fase 19 (la web ES la app).

### Fase 22 — Paquete de tiendas (App Store / Google Play) (R-142) ✅
- [x] `app.json`: bundle ID iOS `nl.fittrack.app`, build 1 / versionCode 1,
      solo vertical, solo iPhone, texto de permiso de fotos,
      `ITSAppUsesNonExemptEncryption=false`, permiso de notificaciones Android.
- [x] `app/eas.json` (development / preview / production + submit).
- [x] Fichas en 4 idiomas con límites comprobados (`docs/store/<idioma>.md`).
- [x] Capturas: Apple 6,9" 1320×2868 y Google 1080×2160, 5 × 4 idiomas, con
      titular (`scripts/make_store_frames.py`); gráfico destacado 1024×500.
- [x] Política de privacidad y soporte en la web (`/privacy.html`, `/support.html`).
- [x] Guía paso a paso y respuestas de privacidad (`docs/store/README.md`).
- [ ] ⛔ Usuario: cuentas de Apple Developer (99 USD/año) y Google Play
      (25 USD); prueba cerrada de 12 testers × 14 días en Google; `appleId`/
      `ascAppId` en `eas.json`; `expo-dev-client` solo si quieres build de desarrollo.

### Fase 21 — Web pública: una pantalla que crea un entreno (R-136, R-138) ✅ (Jobs SÍ, 86; Foco 10)
- [x] `WebPlanner` (solo web, `EXPO_PUBLIC_WEB_MODE=planner`): preguntas →
      sesión; idioma ES/EN/NL/FR arriba a la derecha; sin perfil ni guardado.
- [x] Adaptable: móvil una columna (preguntas plegables), escritorio dos
      columnas con estado vacío y actualización al momento; hoja del
      ejercicio centrada en pantallas anchas.
- [x] 10 vueltas Jobs (`docs/LOOP-21.md`), 68 → 86, Foco 10.
- [x] Sesiones sensatas: clásicos con dibujo, multiarticular primero, brazos
      según el día, filtros por material, nada avanzado.
- [x] Capturas a 3 anchos (`docs/screenshots/web/`, `web/qa.sh`).
- [ ] ⛔ Usuario: conectar Netlify al repo (ver `web/README.md`).

### Fase 20 — Vídeo por ejercicio, dentro de la app (R-133, R-134) ✅ (Jobs SÍ, 90)
- [x] Prueba Jobs al plan: sí como **fila de texto** y vídeo comprobado; no a
      una caja grande ni a enlaces de búsqueda.
- [x] 203 vídeos en inglés (205 ejercicios; 2 sin vídeo por ser vagos),
      buscados en YouTube, elegidos a mano (27 corregidos) y comprobados con
      oEmbed (1 no incrustable sustituido).
- [x] Reproductor dentro de la hoja con `react-native-webview` (aprobado) y
      `<iframe>` en web; la hoja baja hasta el vídeo. Captura 35.
- [ ] ⛔ Usuario (R-128): probar el reproductor en el iPhone (development build o Expo Go).

### Fase 19 — La web ES la app (R-131) ✅
- [x] Decisión del usuario: la web = build web de la app (paridad total);
      el sitio Astro se guarda en la rama `web-astro`.
- [x] `web/` nuevo: `build.js` (`expo export --platform web` de `app/` →
      `web/dist/` + `404.html`), `serve.js` (:8080), README. Sin dependencias.
- [x] `app/public/index.html`: fondo negro (sin destello), `lang="es"`,
      descripción, `theme-color`, favicon.
- [x] Tests y scripts sin Astro: vectores de lógica sobre `gym.ts`; fuera
      `tests/runtime.js`, `generate_web_i18n.py`, `generate_gym_browser.py`,
      espejos `web/src/*` y `docs/web-screenshots/`.

### Fase 18 — 5 vueltas Jobs para producción (R-130) ✅ (Jobs SÍ, 90/90)
- [x] V1: nombres a 2 líneas en la sesión; "14 min · 2 series" igual en
      todas partes; "Guardar una copia".
- [x] V2: Ejercicios en orden alfabético sin búsqueda; botones del aplazado iguales.
- [x] V3: cabecera de la sesión con lo que entrenas ("Espalda y brazos").
- [x] V4: primer arranque sin la nota del lunes; nota reescrita (4 idiomas).
- [x] V5: primer arranque sin calendario ni Historial vacíos.
- [ ] ⛔ Único pendiente para producción: prueba en iPhone real (R-128).

### Fase 17 — Manual portable para otra app (R-129) ✅
- [x] `docs/kit/`: README (qué copiar, orden), 01-BOOTSTRAP (prompt, preguntas
      del día 1, fase 0, orden de fases), 02-METHOD (fases, 6 docs, peticiones,
      ⛔, honestidad, commits, puerta Jobs, 2 revisores, bucle de N rondas),
      03-ENGINEERING (stack, estructura, store y migraciones, copia, módulos
      por plataforma, i18n, tests, harness, nativo, trampas del entorno),
      04-QUALITY-GATES (todas las listas), 05-LESSONS (fallos reales → regla),
      `templates/` (los 6 docs, brief de revisores, log del bucle).
- [x] UX-PLAYBOOK enlaza el kit; CLAUDE.md §0.7; AGENTS al día.
- [x] Lo aprendido en las 5 vueltas, añadido a `05-LESSONS.md` (Fase 18).

### Fase 16 — Copia de seguridad, aviso del descanso bloqueado, fotos como archivos ✅ (Jobs SÍ, 90)
- [x] **Copia de seguridad** (R-124): Perfil → "Guardar copia de seguridad"
      (un archivo con sesiones, perfil, fotos y foto de Inicio) y "Restaurar
      una copia" (validada, con confirmación; sustituye todo). `store.backupJson`,
      `parseBackup`, `store.restore`; `lib/backupFile(.web).ts`. 16 tests.
- [x] **Aviso del descanso con el móvil bloqueado** (R-125): notificación
      local programada (`lib/restAlert(.web).ts`, `expo-notifications`,
      aprobada). Se cancela con +15 s/Saltar/fin y al terminar o descartar.
- [x] **Fotos como archivos** (R-126): `lib/sessionPhotos.ts` (nativo,
      `expo-file-system`, aprobada) y `.web.ts` (localStorage). Migra solas
      las fotos viejas de AsyncStorage.
- [x] Calculadora de discos descartada (R-127).
- [ ] ⛔ **Usuario** (R-128): probar en iPhone real — compartir la copia a
      Archivos, restaurarla, y el aviso con el móvil bloqueado. Necesita un
      build de desarrollo (`expo-notifications`/`expo-file-system` nativos;
      Expo Go no basta para las notificaciones).
- [x] Copia en la web: descarga + restaurar desde archivo (`backupFile.web.ts`; la web es la app desde la Fase 19).

### Fase 15 — InstaGym (sustituye a Historial) ✅ (Jobs SÍ, 89)
- [x] Diario tipo post (estilo X): resumen, **fotos** (deslizables) y
      **comentarios** (tocar uno → borrar con confirmación).
- [x] Añadir fotos al terminar ("Bien hecho" → "+ Añadir foto") y desde el
      diario; "Quitar foto". Fotos en su propia clave de AsyncStorage
      (`lib/sessionPhotos.ts`); se borran con la sesión y con "Borrar todo".
- [x] Tocar un día entrenado del calendario abre esa sesión (Historial de ese día).
- [x] Fotos como archivos con `expo-file-system` → hecho en la Fase 16.
- ⛔ Paridad web (fotos vía `<input type="file">`): necesita `cd web && npm ci`.

### Fase 14 — Biblioteca: contenido por ejercicio — ✖ DESCARTADA por el usuario (2026-11-16, R-123)
> La prueba Jobs al plan dijo **NO**: "Por qué se usa" repite "Qué entrena"
> y los favoritos de atletas son decoración, no el núcleo (Foco). El
> usuario la descarta. Lo hecho (cómo se hace + qué entrena) se queda; las
> casillas abiertas no se hacen (salvo la de la web, que pasa a paridad).
- [x] **Cómo se hace** (3 pasos para principiantes, 4 idiomas) y **qué
      entrena** (grupo + músculos secundarios) — hoja de la sesión y detalle.
- [ ] **Por qué se usa** (una frase por ejercicio, 4 idiomas, redactada
      localmente y declarada).
- [x] Web: ya no aplica (la web es la app, Fase 19).
- [ ] **Favoritos de atletas famosos con cita verificable** (entrevista,
      vídeo, libro, enlace), investigados con búsqueda web, nunca de memoria;
      solo donde exista fuente (los clásicos), no en los 226.
- [ ] Detalle del ejercicio con estas secciones (app y web), i18n.

### Fase 13 — Imágenes de los ejercicios (en curso; estado en `docs/fotos/STATUS.md`)
- [x] 615 prompts (205 × 3) → `docs/fotos/PROMPTS.md`
      (`node scripts/make_photo_prompts.js`).
- [x] **Dibujos reales de Everkinetic** (CC BY-SA 3.0, Wikimedia Commons;
      R-132): 77 candidatos por nombre, **cada dibujo revisado a mano**
      (`data/images/photos/everkinetic-map.json`: `chosen` y `rejected` con
      motivo). **78 ejercicios** con posición inicial + final (156
      imágenes); miniaturas con el dibujo en todas las listas (R-137); 9 rechazados (p. ej. "Bench press" de Commons es un press
      inclinado; dibujos con mancuerna para ejercicios con barra). Fondo
      transparente y teñido con el tema; crédito en la hoja y en Licencias.
      `scripts/fetch_everkinetic.py` (baja con pausa y miniaturas estándar),
      `scripts/make_photo_map.js`, `scripts/photo_status.js`.
- ⛔ **Usuario con Codex** (R-140): los 127 sin dibujo (254 imágenes) con
      `docs/fotos/CODEX-DIBUJOS.md` (OpenAI + ejemplos de `docs/fotos/referencias/`)
      → `python3 scripts/add_drawings.py` (marcados "Dibujo generado con IA";
      `docs/fotos/STATUS.md` se actualiza solo).


## Hecho recientemente

### Fase 11c — Inicio, estilo coche y paleta uniforme (2026-11-15, commit con la 11d)
- [x] Inicio sin título con estado, foto, un botón y calendario; sin volumen.
- [x] Sesión con estado arriba, accesos rápidos en círculo y filas planas.
- [x] Calendario uniforme; harness con `tapLabel`.
- (Su paleta gris/naranja y la barra flotante fueron sustituidas en la 11d
  por el estilo X monocromo a petición del usuario.)

### Fase 12 — Añadir datos (2026-11-15, commit 4616f3b)
- [x] Cardio, valoración al terminar, Perfil con datos fijos y calorías.

### Fase 11b — Simplificación (2026-11-15, commit efda236)

## En espera

### Fase 7 — Sync en la nube (Supabase) ⏸
Decisión 2026-11-08: la v1 se publica solo con datos locales.
- [ ] Proyecto Supabase free + login magic link
- [ ] Tabla `sessions` + `user_id` con RLS
- [ ] Sync offline-first en app y web; export/import JSON como puente

### Deuda técnica
- [x] `SafeAreaView` obsoleto → `react-native-safe-area-context` (hecho, 11j).
- [ ] `npm audit`: 4 avisos moderados en `app/`.
- [ ] Hoja de valores: "+/−" fino para pesos fuera de la rejilla.
- [ ] Limpiar código muerto del tema crema (`DEFAULT` ya no se usa) y estilos
      sin uso (`hero*` en SessionScreen, `PauseGlyph`/`PlayGlyph`).

## Hecho (resumen)

- Fase 0 — Repo, docs, git.
- Fase 1 — 226 ejercicios reales de wger (CC-BY-SA) + imágenes placeholder +
  scripts de sync/generación.
- Fase 2 — Web Astro: 231 páginas, diseño apple.com, nav responsive.
- Fase 3 — App Expo (ahora SDK 58), AsyncStorage, tipos y bundle OK.
- Fase 4 — i18n NL/ES/EN/FR con cambio instantáneo sin red.
- Fase 5 — QA: `tests/run.js` y `tests/runtime.js`.
- Fase 6 — Datos reales vía PyPI. ⛔ Fotos reales: `static.wger.de` ya no
  existe.
- Fase 7b/7c — Icono y splash, iconos dibujados, sistema de diseño,
  feedback de guardado, exportar/borrar datos.
- Fase 8 — Benchmarks (1RM), generador de entrenos, material ocupado con
  aplazamiento y alternativas, modos de material, tema navy de entreno
  activo, persistencia del entreno.
- Fase 9c — Paridad web con la app (tema premium, asistente, sesión).
- Fase 10 — Sesión con "Detalles" plegados, pestaña Perfil (peso/altura),
  degradados premium.
- Fase 11 — Flujo "ejercicio actual" + barra fija + vídeo mp4.
- Fase 11b — Simplificación (impeccable) + tema negro.
- Fase 12 — Cardio, valoración al terminar, Perfil con datos fijos y calorías.
- Fase 11c — Inicio, estilo app de coche, paleta uniforme (sustituida en 11d).
- Fase 11d — Estilo X monocromo, descanso, hoja de inicio, marcas, temas y banderas, idioma completo, iconos por grupo (Jobs SÍ como 2.0).

## Probar en el host (guía en README.md)
- Web: `cd web && npm ci && npm run build && npm run preview -- --host`
- App: `cd app && npm ci && npx expo start` + Expo Go (QR) en Android/iPhone
