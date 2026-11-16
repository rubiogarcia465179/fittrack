# FitTrack — Capturas y vídeo (iPhone 16, 393×852 @2x)

Capturas reales del build web de la app (`expo export --platform web`) en
Chrome headless con viewport de iPhone 16. Datos de ejemplo locales, sin red.
**Se regeneran en cada commit** (regla de `AGENTS.md`).

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Inicio | "Hoy toca: …" + Cambiar, objetivo y duración, "Empezar sesión", marcas, calendario |
| 02 | Inicio · Cambiar | Tras un toque en "Cambiar": el siguiente bloque |
| 03 | Inicio · más | Marcas, calendario con día de récord en verde, filas Historial / Ejercicios |
| 04 | Tu entreno de hoy | Hoja previa: duración, intensidad, energía, objetivo |
| 05 | Entreno generado | Sesión creada por la hoja; sin histórico, peso "—" y ✓ inactivo |
| 06 | Sesión activa | Cabecera con lo que entrenas ("Brazos"); un solo acceso ("Añadir ejercicio"); ejercicio actual; "Más opciones" plegado |
| 07 | Más opciones | Sugerir ejercicio · ¿Máquina ocupada? · Quitar ejercicio |
| 08 | ¿Cómo se hace? | Foto (de ejemplo, marcada), qué entrena, 3 pasos en español |
| 09 | Descanso | Cuenta atrás tras completar una serie (+15 s, Saltar) |
| 10 | Cardio | min · km · intensidad; "Terminar y guardar" |
| 11 | Finalizar | "Bien hecho": min · series + "Cómo te has sentido" + un solo "Finalizar" |
| 12 | Historial (diario) | Cada sesión como un post: fotos, series, sensación, comentarios; "Añadir foto · Comentar" |
| 13 | Historial · un día | Al tocar un día del calendario: solo ese día + "Ver todas" |
| 14 | Ejercicios | Desde Inicio (con "atrás"); icono por grupo |
| 15 | Perfil | Cuerpo (peso, altura, IMC; evolución con ≥ 3 puntos) + calorías |
| 16 | Perfil · ajustes | Sobre ti, Apariencia, idioma + tus datos, "Licencias y créditos" al pie |
| 17 | Tema Día | Inicio en el tema inverso |
| 18 | Ejercicios FR | Cambio de idioma instantáneo (nombres incluidos) |
| 19 | Ejercicios NL | Ídem en neerlandés |
| 20 | ¿Cómo se hace? NL | Los pasos siguen el idioma elegido |
| 21 | Primer arranque | Sin datos: "Hoy toca" + "Empezar sesión", "Empieza por tus marcas" y Ejercicios; sin calendario ni Historial (aparecen con la primera sesión) |
| 22 | Test de marcas | Los 5 clásicos, calentamiento + serie de test, 1RM estimado |
| 23 | Rueda de peso | Como la alarma del iPhone; el botón blanco es el valor |
| 24 | Rueda de altura | Número + unidad (cm / m); "Escribir" para teclear |
| 25 | Progresión | "+2,5 kg · la última vez 3 × 8 con 50 kg · Mantener 50 kg" |
| 26 | Récord en directo | Número de serie en círculo verde; "Récord · 1RM ≈ 73 kg" |
| 27 | Resumen final | "Bien hecho" · 15 min · 2 series · 1 récord + fila del récord (2 líneas) |
| 28 | Descartar entreno | "Cancelar" y "Descartar" (rojo); tocar fuera = Cancelar |
| 29 | Tras Finalizar | De vuelta a Inicio: "Próxima", hoy marcado (verde si hubo récord) |
| 30 | Ejercicios · filtro | Ficha elegida en blanco (sin colores por grupo) |
| 31 | Ejercicio (hoja) | Desde Ejercicios se abre la misma hoja "¿Cómo se hace?": material · nivel, qué entrena, pasos |
| 32 | Quitar ejercicio | Con series hechas se confirma: "Cancelar" y "Quitar" |
| 33 | Aplazado | "Máquina ocupada": el original con "Hacerlo ahora" desde el primer momento + sugerencia con "Usar" (mismo botón de contorno) |
| 34 | Comentar | El comentario se escribe en la propia tarjeta; "Publicar" |

**Vídeo** — `video-iphone16.mp4` (H.264, 786×1704, 30 fps): el mismo recorrido que las capturas.

## Regenerar

```bash
# 1. Build web de la app (WSL)
cd ~/fittrack/app && npx expo export --platform web --output-dir /tmp/ft-dist
# 2. Capturas + fotogramas (Windows, Node ≥ 22 + Chrome)
node app/qa/shots/shoot.js \\wsl.localhost\Ubuntu-24.04\tmp\ft-dist docs/screenshots --frames <dir-temporal>
# 3. Vídeo (WSL; ffmpeg temporal vía imageio-ffmpeg, ver make-video.js)
FFMPEG=<ruta-ffmpeg> node app/qa/shots/make-video.js <dir-temporal> docs/screenshots/video-iphone16.mp4
```
El recorrido está en `app/qa/shots/scenario.js` (añade pasos ahí cuando
cambie la UI).
