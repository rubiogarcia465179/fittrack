Genera las ilustraciones de ejercicios de mi app de fitness FitTrack. Adjunto `LISTA-FOTOS-AGENTE.md`, con 205 ejercicios y 459 dibujos por hacer, y los dibujos de ejemplo de la carpeta `referencias/` (156 dibujos reales de Everkinetic). Cada ejercicio lleva 3 imágenes. 78 ejercicios ya tienen las 2 primeras: la lista las indica en «Already exists» y solo falta la 3.

## Qué tiene que mostrar cada imagen
- `<id>-1.png`: la posición inicial, tal como la describe el primer paso de la técnica.
- `<id>-2.png`: el momento más claro del esfuerzo. En los ejercicios estáticos (planchas, holds), la posición mantenida.
- `<id>-3.png`: la vuelta controlada. En los ejercicios estáticos, una vista que deje ver bien la alineación del cuerpo.

## Estilo, idéntico a los ejemplos (pásalo en inglés al generador de imágenes)
Create a new exercise illustration that matches the attached Everkinetic example drawings EXACTLY in style, so it looks like part of the same set. Black ink line art on a FULLY TRANSPARENT background (PNG with alpha channel). One athletic, muscular adult man; bald, smooth head with NO facial features (only the ear outline); shirtless, plain loose shorts with a waistband line; barefoot. Clean, confident black contour lines of even thickness (like a 3 px pen) and thinner interior lines that only suggest the main muscles. NO fill, NO shading, NO hatching, NO grey, NO colour, NO gradients, NO shadows, NO floor line, NO background objects. Equipment in the same simple outline style (barbell = straight bar with round plates; benches and machines = clean geometric outlines). Three-quarter view, or a straight side view when it shows the movement better. Whole body and equipment inside the frame with a generous empty margin. Anatomically correct, safe technique; realistic hands and feet. No text, letters, numbers, arrows, logos or watermarks. Square 1024×1024.

## Reglas
1. **Fondo transparente**: la app pinta las líneas en blanco sobre fondo negro usando solo la transparencia. Un fondo blanco o de color saldría como un bloque blanco macizo, así que solo puede haber líneas negras y transparencia. El interior del cuerpo también tiene que quedar transparente. Si el generador no puede hacer transparencia, quita tú el fondo antes de guardar.
2. Usa exactamente el nombre de archivo de la lista: el ID en inglés + `-1`, `-2` o `-3` + `.png`. Todo en minúsculas y sin cambiar nada. Ejemplo: `bench_press-1.png`.
3. Las 3 imágenes de un ejercicio muestran al mismo hombre, con el mismo ángulo, la misma escala y el mismo equipo. Solo cambia la postura. Para la 2 y la 3, adjunta al generador la 1 (o las que ya existan de ese ejercicio). Adjunta también 2 o 3 dibujos de `referencias/` parecidos al ejercicio.
4. Termina todas las imágenes de un ejercicio antes de empezar el siguiente y sigue el orden de la lista.
5. Mira cada imagen antes de guardarla. Repítela si ves manos, pies o extremidades deformes, un agarre o un apoyo incorrectos, el equipo equivocado, una técnica peligrosa, sombras o grises, fondo no transparente, cara dibujada o texto.
6. Si un ejercicio te sale mal después de 2 intentos, déjalo como pendiente con el motivo. No entregues una imagen dudosa.

## Qué me tienes que devolver
1. **`fittrack-dibujos.zip`**: solo los PNG terminados y bien nombrados, sin carpetas dentro.
2. **`pendientes.txt`**: un nombre de archivo por línea con todas las imágenes que faltan todavía, en el orden de la lista. Si alguna falló, añade ` # motivo` al final de su línea.
3. Un resumen de una línea: «X de 459 hechas, Y pendientes».

Si no te da tiempo a hacer las 459 en esta sesión, haz todas las que puedas y entrégame el zip y `pendientes.txt` igualmente. En la próxima sesión te mandaré `pendientes.txt` para seguir desde ahí.
