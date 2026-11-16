# Fase 18: 5 vueltas de la prueba Jobs para producción (R-130)

Petición del usuario (2026-11-16): "enter the /stevejobs and analyze, suggest,
apply changes loop. Do this loop 5 times. The idea is to polish the app to get
it ready for production." Cada vuelta: contactos de las 34 capturas →
`analyze` (nota por principio) → `suggest` → aplicar solo lo pequeño y seguro
que no choca con lo pedido por el usuario → tsc + tests + export + capturas →
mirar lo cambiado → `analyze`. **Ninguna nota puede bajar.**

*Crítica imaginada al estilo de Steve Jobs, basada en sus principios públicos.*

## Puntuación (principios 1–9, 0–10)

| Vuelta | Foco | Simplicidad | Cómo funciona | Punta a punta | Oficio | Artes liberales | Autenticidad | 1.ª impresión | Funciona solo | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| Base (tras Fase 16) | 9 | 10 | 10 | 10 | 9 | 9 | 10 | 9 | 10 | 86 |
| 1 | 9 | 10 | 10 | 10 | 10 | 9 | 10 | 9 | 10 | 87 |
| 2 | 9 | 10 | 10 | 10 | 10 | 9 | 10 | 9 | 10 | 87 |
| 3 | 9 | 10 | 10 | 10 | 10 | 10 | 10 | 9 | 10 | 88 |
| 4 | 9 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 89 |
| 5 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 90 |

(La base es 86 y no el 90 de la Fase 16 porque esta vez se juzgaron las 34
capturas en hojas de contacto, no solo la pantalla que cambió.)

## Vueltas

### Vuelta 1 — 87 (Oficio 9→10)
- Nombres truncados en la lista de la sesión ("Jalón al pecho agarre estre…") → hasta 2 líneas. **Aceptada**.
- Historial "2 series · 14 min" vs "Bien hecho" "14 min · 2 series" → mismo orden (tiempo · series). **Aceptada**.
- "Guardar copia de seguridad" larga → "Guardar una copia" (pareja de "Restaurar una copia"; 4 idiomas). **Aceptada**.
- Tarjetas de marcas blancas compiten con "Empezar sesión" → **rechazada** (petición explícita del usuario, REQUIREMENTS: "3 mejores 1RM en tarjetas blancas").

### Vuelta 2 — 87 (sin subir nota; consolida Oficio y Funciona solo)
- Ejercicios sin búsqueda en el orden de los datos (empezaba por "core") → **alfabético** en el idioma elegido; con búsqueda, relevancia. **Aceptada**.
- Aplazado: "Hacerlo ahora" texto suelto junto a "Usar" con contorno → mismo botón de contorno ≥ 44 pt. **Aceptada**.

### Vuelta 3 — 88 (Artes liberales 9→10)
- Cabecera de la sesión "Sesión" genérica → **lo que entrenas** ("Espalda y brazos", igual que "Hoy toca"; 1–2 grupos; si no, "Sesión"; test: "Marcas"). **Aceptada**.

### Vuelta 4 — 89 (1.ª impresión 9→10)
- Primer arranque con dos mensajes (la nota del lunes + "Empieza por tus marcas") → la nota solo con historial. Texto más claro en 4 idiomas ("Es lunes: el pecho, otro día. Los bancos suelen estar llenos."). **Aceptada**.

### Vuelta 5 — 90 (Foco 9→10)
- Primer arranque con un calendario vacío y una fila Historial que lleva a una lista vacía → ocultos hasta la primera sesión; queda "Hoy toca", la acción, las marcas y Ejercicios. **Aceptada**.

## Veredicto final: SÍ (90/90 en los principios 1–9)
Lo que le gustaría: la primera pantalla tiene un solo paso; la sesión dice lo
que entrenas; una copia de seguridad que cabe en una frase. Lo único que queda
para producción es el principio 10, "Real artists ship": **probarlo en un
iPhone real** (R-128, lo hace el usuario: copia → Archivos, restaurar, aviso
del descanso con el móvil bloqueado, cámara/fotos, rendimiento).

## Estado + siguiente paso
Bucle terminado. Siguiente: prueba en iPhone (usuario), paridad web (⛔ `npm ci`), Fase 13 (fotos).
