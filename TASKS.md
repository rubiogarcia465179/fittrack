# TASKS — FitTrack

Estado: `[x]` hecho · `[ ]` pendiente · `⛔` bloqueado (con motivo) ·
`⏸` en espera. El detalle de lo hecho está en `PROGRESS.md` y en git.

## Cómo continuar (para el siguiente agente)

1. Lee `CLAUDE.md` (reglas de siempre) y `SPEC.md` (qué quiere el usuario).
2. Trabaja **en el orden de esta lista**, de arriba abajo.
3. **No commitees** hasta cerrar una fase y que la prueba "Steve Jobs" dé
   **sí** (`CLAUDE.md §2`; se evalúa como **versión 2.0**). Estado al
   2026-11-15: versión "Foco a 10" en `main` (ramas `v1` y `SteveJobs`) +
   Fase 11e (Hoy toca con Cambiar, marcas desde datos, días de récord, mapa
   del cuerpo SVG). Después: **Fase 15
   (InstaGym)**, luego Fase 14 (por qué se usa + favoritos con cita), paridad
   web (⛔ `npm ci`) y Fase 13 cuando lleguen las fotos.
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
- [ ] Siguiente: `SafeAreaView` → `react-native-safe-area-context`.

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
  vibración aunque el móvil esté bloqueado). Decide el usuario.
- ⏸ **Paridad web en pausa** (el usuario pidió parar): `npm ci` y build OK,
  i18n regenerado (390 claves); pendiente el tema X, 3 pestañas, Inicio,
  Perfil y pasos por idioma en `web/`.

### Fase 15 — InstaGym (sustituye a Historial) ← SIGUIENTE
- [ ] Feed tipo Instagram (estilo X): cada sesión con su resumen (fecha,
      ejercicios, series, cardio, valoración), **fotos** y **comentarios**.
- [ ] Añadir fotos a una sesión (al terminar y desde el feed) y comentarios.
      `expo-image-picker` ya instalado (`app/src/lib/pickPhoto.ts`). Guardar
      fotos como archivos con `expo-file-system` (ya instalado), no en
      AsyncStorage.
- [ ] Tocar un día entrenado del calendario de Inicio abre esa sesión.
- [ ] Paridad web (fotos vía `<input type="file">`).

### Fase 14 — Biblioteca: contenido por ejercicio
- [x] **Cómo se hace** (3 pasos para principiantes, 4 idiomas) y **qué
      entrena** (grupo + músculos secundarios) — hoja de la sesión y detalle.
- [ ] **Por qué se usa** (una frase por ejercicio, 4 idiomas, redactada
      localmente y declarada).
- [ ] Web: usar `web/src/data/howto/<lang>.json` en las páginas de detalle.
- [ ] **Favoritos de atletas famosos con cita verificable** (entrevista,
      vídeo, libro, enlace), investigados con búsqueda web, nunca de memoria;
      solo donde exista fuente (los clásicos), no en los 226.
- [ ] Detalle del ejercicio con estas secciones (app y web), i18n.

### Fase 13 — Fotos de los ejercicios
- [x] 678 prompts listos → `docs/fotos/PROMPTS.md`
      (`node scripts/make_photo_prompts.js`; estilo de `data/images/ejemplo/`).
- ⛔ **Usuario**: generar las imágenes (ChatGPT) →
      `data/images/photos/<id>-1.png … -3.png` (por lotes).
- [ ] Agente, al recibir lotes: `image` → lista de 3, carrusel en el
      detalle, sync, `source_note` "generadas con IA", compresión JPEG.

### Paridad web (Astro) con la app (⏸ en pausa por el usuario)
- [ ] Tema monocromo estilo X en `web/src/styles/global.css` (hoy la web
      tiene las variables grises de la 11c, no el negro/blanco de la 11d).
- [ ] `dashboard.astro` → Inicio; `session.astro` → sesión actual (descanso,
      cardio, valoración); Perfil con datos y calorías (`energy.ts`).
- [x] `npm ci` (aprobado) + `npm run build` OK (233 páginas).

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
- [ ] `SafeAreaView` obsoleto en RN 0.88 → `react-native-safe-area-context`
      (⛔ dependencia nueva).
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
