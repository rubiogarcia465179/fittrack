# Fase 11l: bucle de 10 rondas con 2 revisores UX y la prueba Jobs

Petición del usuario (2026-11-16): 10 rondas. En cada ronda, dos agentes UX
proponen mejoras, yo solo acepto las que son perfectas y pasan la prueba
Jobs, las aplico y ejecuto `/SteveJobs analyze`. **Ninguna puntuación puede
bajar.** Si una baja, ese cambio se revierte.

## Brief para los revisores (léelo entero)

- Producto: FitTrack, una app de gimnasio (Expo/React Native) que se evalúa
  como una **2.0**. Visión y pantallas en `SPEC.md`. UX, sistema de diseño y la
  **lista del "no"** en `docs/UX-PLAYBOOK.md`: respétala.
- Capturas actuales (iPhone 16, web): las 4 hojas de contacto cuyas rutas
  vienen en tu prompt, con 7 capturas por hoja en el orden de
  `docs/screenshots/README.md`. El código está en `app/src/` (screens y
  components).
- Restricciones fijas:
  - sin dependencias nuevas, sin pantallas ni pestañas nuevas;
  - nada inventado presentado como real, y nada supuesto presentado como un
    hecho;
  - un solo botón blanco relleno por pantalla;
  - el verde solo para récords;
  - textos en 4 idiomas (ES/EN/NL/FR);
  - objetivos táctiles ≥ 44 pt;
  - no quitar nada que el usuario pidió de forma explícita. Lo pedido está en
    `REQUIREMENTS.md`; por ejemplo: un solo "Finalizar", la rueda sin "Usar",
    la serie hecha al indicar reps y peso, "—" sin datos, "Hoy toca" con
    "Cambiar".
- Lo que buscamos: cambios **pequeños y precisos** que suban la nota de un
  principio Jobs sin bajar ninguno. Quitar suele ganar a añadir. **No
  repitas** nada que ya esté en el log de abajo (ni lo aceptado ni lo
  rechazado).
- Formato de tu respuesta (máx. ~300 palabras): hasta **3 sugerencias**,
  ordenadas. Cada una con:
  - pantalla o captura;
  - cambio exacto (textos en español, posición, comportamiento);
  - principio Jobs que mejora (1–9);
  - riesgo / qué podría empeorar;
  - tamaño (S/M).
  Si no ves nada que merezca la pena, dilo: "nada" es una respuesta válida.

## Puntuación (principios 1–9, de 0 a 10)

| Ronda | Foco | Simplicidad | Cómo funciona | Punta a punta | Oficio | Artes liberales | Autenticidad | 1.ª impresión | Funciona solo | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| Base (11k) | 8 | 9 | 9 | 9 | 8 | 8 | 9 | 8 | 9 | 77 |
| 1 | 8 | 9 | 9 | 9 | 9 | 8 | 9 | 8 | 9 | 78 |
| 2 | 8 | 9 | 9 | 10 | 9 | 8 | 9 | 8 | 9 | 79 |
| 3 | 8 | 9 | 9 | 10 | 9 | 9 | 9 | 8 | 9 | 80 |
| 4 | 8 | 9 | 9 | 10 | 9 | 9 | 10 | 8 | 9 | 81 |
| 5 | 8 | 9 | 9 | 10 | 9 | 9 | 10 | 9 | 9 | 82 |
| 6 | 9 | 9 | 9 | 10 | 9 | 9 | 10 | 9 | 9 | 83 |
| 7 | 9 | 9 | 9 | 10 | 10 | 9 | 10 | 9 | 9 | 84 |
| 8 | 9 | 9 | 10 | 10 | 10 | 9 | 10 | 9 | 9 | 85 |
| 9 | 9 | 9 | 10 | 10 | 10 | 9 | 10 | 9 | 10 | 86 |
| 10 | 9 | 10 | 10 | 10 | 10 | 9 | 10 | 9 | 10 | 87 |

## Log de rondas

(Cada ronda: sugerencias de cada revisor → aceptada / rechazada con motivo →
cambios → veredicto y notas.)

### Ronda 1 — 78 (+1: Oficio 8→9)
- Visual 1 · "Exportar datos" con contorno, aviso sin verde, indicador visible → **aceptada** (verde solo récords; Perfil sin botón relleno).
- Visual 2 · títulos de ejercicio sin mayúsculas → **rechazada** (SPEC fija "TÍTULO en mayúsculas"; decisión del usuario ⛔).
- Visual 3 · "Mantener 50 kg" como acción aparte; la explicación no se pulsa → **aceptada** (evita cambiar el peso sin querer).
- Interacción 1 · fuera el aviso "Siguiente: X" al avanzar (llamaba "siguiente" al actual) → háptico ligero → **aceptada**.
- Interacción 2 · ≥ 44 pt en Ocupado/Fuera de servicio, +15 s, Saltar, ¿Cómo se hace? → **aceptada** (regla fija).
- Interacción 3 · erratas FR/NL en el diálogo de descartar → **aceptada**.

### Ronda 2 — 79 (+1: Punta a punta 9→10)
- Propia · filas plegadas de peso corporal sin "· 0 kg" ("4 × 10").
- Visual 1 · Noche/Día juntos a la izquierda (resto de los 5 temas) → **aceptada**.
- Visual 2 · "Tus datos" como etiqueta de sección (TUS DATOS) con separador → **aceptada**.
- Visual 3 · Historial "14 min" (no "minutos") y sin cursiva → **aceptada**.
- Interacción 1 · diálogo de descartar: fondo que bloquea y cancela al tocar; "Cancelar | Descartar"; accessibilityViewIsModal → **aceptada** (fallo real).
- Interacción 2 · descanso: VoiceOver alcanza "+15 s"/"Saltar"; sin live region cada segundo; etiqueta "Añadir 15 segundos" → **aceptada**.
- Interacción 3 · botón de guardar siempre "Finalizar" (fuera "Guardar benchmark"/"Guardar sesión" y su etiqueta distinta) → **aceptada** (WCAG 2.5.3; R-106).
- Captura nueva 28 (diálogo de descartar).

### Ronda 3 — 80 (+1: Artes liberales 8→9)
- Interacción 1 · tras Finalizar/Descartar → Inicio; aviso sin "✓" y anunciado a VoiceOver → **aceptada** (el cierre cae donde vive el progreso; captura 29).
- Interacción 2 · "PRÓXIMA" en vez de "HOY TOCA" si ya entrenaste hoy → **aceptada** (no se afirma lo que no es; "Hoy toca" + "Cambiar" se mantienen).
- Interacción 3 · VoiceOver alcanza "Cambiar" (el bloque ya no se agrupa); "Cambiar" a 44 pt → **aceptada**.
- Visual 1 · botón principal blanco plano (el degradado blanco→gris lo hacía más apagado que las fichas) → **aceptada**.
- Visual 2 · la hoja final se titula "Bien hecho" en grande (antes dos preguntas casi iguales) → **aceptada**.
- Visual 3 · cambiar los datos de las capturas para ocultar un duplicado del catálogo → **rechazada** (taparía un problema real; a TASKS: fusionar duplicados del catálogo).

### Ronda 4 — 81 (+1: Autenticidad 9→10)
- Interacción 1 + Visual 2 (coinciden) · Ejercicios: fichas de filtro monocromo (fuera los colores por grupo), ≥ 44 pt, etiquetas de sección en versalitas, nombres en 2 líneas → **aceptada**.
- Interacción 2 + Visual 1 (coinciden) · detalle de ejercicio: músculos secundarios traducidos, fuera la línea de alias en otro idioma, grupo sin color, "‹ Ejercicios", "Músculo principal" → **aceptada en versión S** (arreglar la pantalla; reemplazarla por la hoja "¿Cómo se hace?" (M) queda como opción para el usuario).
- Interacción 3 + Visual 3 (coinciden) · test de marcas: la serie de test empieza con reps "—" (no 8 supuestas) y no se le copia el peso del calentamiento → **aceptada**.
- "1RM estimado" como texto en vez de casilla → **no aplicada** (solo un revisor; queda para otra ronda).
- Capturas nuevas 30 (filtro) y 31 (detalle).
- Nota: el clasificador de seguridad falló de forma intermitente; se verificó con `git status` que los revisores no tocaron archivos.

### Ronda 5 — 82 (+1: 1.ª impresión 8→9)
- Visual 1 · primer arranque: "Empieza por tus marcas" sin "O empieza a entrenar…" (repetía el botón de encima) → **aceptada**.
- Visual 2 · nota del lunes en una línea corta ("Lunes: el pecho, otro día; los bancos suelen estar llenos."), se mantiene R-75 → **aceptada**.
- Visual 3 · "Tu entreno de hoy": fichas a 44 pt (estaban a 40, fallo real), duración/intensidad/energía en filas de ancho completo, etiqueta "DURACIÓN" → **aceptada**.
- Interacción 1 · sin descanso tras la última serie del entreno (`toggleSetDone`) → **aceptada** (fallo real).
- Interacción 2 · "×" con 0 series hechas: vuelve a Inicio sin diálogo ni aviso (`onDiscard(true)`) → **aceptada** (el diálogo decía "perderás las series registradas" sin haber ninguna).
- Interacción 3 · casilla "Hecha" de cardio bloqueada sin minutos (guardaba series vacías) · "Saltar descanso" para VoiceOver · "Eliminar sesión, <fecha>" en Historial → **aceptada**.

### Ronda 6 — 83 (+1: Foco 8→9)
- Visual 1 + Interacción 2 (coinciden) · fuera la leyenda "Siguiente: X" de la barra fija (el siguiente ya es la fila de debajo); el nombre pasa a `accessibilityHint` de "Siguiente ejercicio"; la leyenda queda solo para "Guardado" → **aceptada**.
- Visual 2 · "¿Cómo se hace?" como texto sin contorno → **rechazada** (solo un revisor; es la ayuda clave para principiantes y perdería visibilidad).
- Visual 3 · Inicio: quitar "3 sesiones este mes" de la fila Historial → **rechazada** (lo fija SPEC; el propio revisor la veía dudosa).
- Interacción 1 · fallo real: las series hechas de un ejercicio aplazado ("Ocupado") no se guardaban (`completedExercises(draft, [])`) ni contaban en "x/y series"; "Saltar" las borraba → **aceptada** (se guardan, cuentan y al saltar vuelven a la lista como hechas; 2 tests nuevos).
- Interacción 3 · "Quitar serie" quita la última serie **pendiente** (se oculta si todas están hechas); "Quitar ejercicio" con series hechas pide confirmación ("¿Quitar este ejercicio?" · Cancelar | Quitar) → **aceptada** (captura nueva 32).

### Ronda 7 — 84 (+1: Oficio 9→10)
- Interacción 1 · fallo real: tras "Borrar todos los datos" Perfil seguía mostrando peso, altura, IMC y calorías (estado local) y App conservaba el perfil viejo → **aceptada** (se relee el perfil y las alturas; el aviso de estado con `accessibilityLiveRegion`).
- Interacción 2 · fallo real: borrar la única sesión del día filtrado mostraba "Aún no hay sesiones" → **aceptada** (vuelve a la lista completa).
- Interacción 3 · ruedas: VoiceOver no podía cambiar el valor (`adjustable` sin acciones) → **aceptada** (increment/decrement + `accessibilityValue`).
- Visual 1 · Historial de un día: fuera la fecha repetida; "Ver todas" junto al título (44 pt) → **aceptada**.
- Visual 2 · "¿Cómo se hace?": músculos como una línea de texto ("**Brazos** · Pecho") en vez de fichas (la blanca rellena competía con "Cerrar") → **aceptada**.
- Visual 3 · test de marcas: la 2.ª serie se rotula "Test" y la pista se acorta → **aceptada**.
- Idea aparcada (M, añade): decir en Historial qué récord se hizo ese día.

### Ronda 8 — 85 (+1: Cómo funciona 9→10)
- Visual 1 · pesos desde marcas sin redondear ("37,1 kg", imposible en una barra) → **aceptada** (`roundW` también en la ruta de marcas, app y web; test nuevo).
- Visual 2 · el aviso "Sesión guardada" (280 px, translúcido) dejaba asomar la leyenda cortada → **aceptada** (ancho completo con márgenes de 16 y fondo opaco).
- Visual 3 + ronda 4 (segundo voto) · test de marcas: "1RM estimado: —" como texto, no casilla → **aceptada**.
- Interacción 1 · fallo real: la duración guardada era siempre el reloj (un olvido = "840 min") y la rueda de duración no se podía abrir → **aceptada** (los minutos del resumen se tocan y abren la rueda; el resumen muestra lo que se guarda).
- Interacción 2 · fallo real: cancelar "Tu entreno de hoy" no cancelaba (Inicio mostraba lo tocado) → **aceptada** (la hoja trabaja sobre una copia; solo "Continuar al entreno" aplica y guarda).

### Ronda 9 — 86 (+1: Funciona solo 9→10)
- Visual 1 · detalle de ejercicio: "Ejecución" → etiqueta "CÓMO SE HACE" con los mismos círculos numerados que la hoja (un solo lenguaje) → **aceptada**.
- Visual 2 · Ejercicios: título antes del buscador → **rechazada** (M, solo un revisor; el buscador dejaría de estar fijo).
- Interacción 1 · fallo real: "Hacerlo ahora" / "Usar" en aplazados no llevaban el foco al ejercicio (y "Usar" de uno ya presente avisaba sin cambiar nada) → **aceptada** (pasa a ser el actual y se enfoca, como "Añadir ejercicio").
- Interacción 2 · "Hacerlo ahora" desde el primer momento y fuera "intento N" → **rechazada** (R-11 fija "tras ~5 intentos vuelve el original"; ⛔ pregunta para el usuario).
- Interacción 3 · fallo real (privacidad): "Borrar todos los datos" no borraba la foto de Inicio → **aceptada**.

### Ronda 10 — 87 (+1: Simplicidad 9→10)
- Interacción 1 · "Finalizar" con 0 series: el diálogo ya no dice "perderás las series registradas" (solo título y Cancelar | Descartar) → **aceptada**.
- Interacción 2 · VoiceOver sin ", — kg" en series de peso corporal → **aceptada**.
- Interacción 3 · al cerrar "Bien hecho" sin guardar, volver la duración al reloj → **rechazada** (caso raro; perdería un ajuste manual).
- Visual 1 · francés: todo en "tu" (mezclaba "tu" y "vous"; 29 cadenas) · inglés "can't be undone" en los dos diálogos → **aceptada**.
- Visual 2 · la misma acción con el mismo nombre: "Ver todas" / "See all" / "Alles bekijken" / "Tout voir" en Inicio e Historial → **aceptada**.
- Revisión de regresiones de las rondas 5–9: sin fallos (el revisor de interacción las comprobó una a una).

## Estado y siguiente paso (para el siguiente agente)

- **Fase 11l terminada**: 10 rondas, 77 → 87, ninguna nota bajó. Commit "Fase 11l" en `main`.
- Quedan en 9: Foco, Artes liberales y 1.ª impresión (ideas aparcadas: decir en Historial qué récord se hizo ese día; título antes del buscador en Ejercicios).
- ⛔ para el usuario: títulos de sesión sin mayúsculas (SPEC); reemplazar el detalle de ejercicio por la hoja "¿Cómo se hace?"; fusionar duplicados del catálogo ("Press de banca con agarre cerrado" = "…agarre estrecho", 7 nombres NL repetidos); probar en iPhone (vibración de récord, "Mantener", ruedas con VoiceOver); aplazados: "Hacerlo ahora" desde el primer momento en vez de tras ~5 "Otra sugerencia" (R-11).
