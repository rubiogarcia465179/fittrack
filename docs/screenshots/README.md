# FitTrack — Capturas y vídeo (iPhone 16, 393×852 @2x)

Capturas reales del build web de la app (`expo export --platform web`) en
Chrome headless con viewport de iPhone 16. Datos de ejemplo locales, sin red.
**Se regeneran en cada commit** (regla de `AGENTS.md`).

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Inicio | "Hoy toca: …" (grupos del día), "Empezar sesión", marcas personales, calendario |
| 02 | Inicio · más | Filas Historial y Ejercicios; actividad (hora del entreno) |
| 03 | Tu entreno de hoy | Hoja previa: duración, intensidad, energía, objetivo |
| 04 | Entreno generado | Sesión creada por la hoja (nunca 0 kg en ejercicios con carga) |
| 05 | Sesión activa | "Añadir ejercicio" y "Detalles"; ejercicio actual; "Más opciones" plegado |
| 06 | Más opciones | Sugerir ejercicio · ¿Máquina ocupada? · Quitar ejercicio |
| 07 | ¿Cómo se hace? | Foto (de ejemplo, marcada), qué entrena, 3 pasos en español |
| 08 | Descanso | Cuenta atrás tras completar una serie (+15 s, Saltar) |
| 09 | Cardio | min · km · intensidad; "Terminar y guardar" |
| 10 | Valoración | Energía y sensación (1–5) |
| 11 | Historial | Desde Inicio (con "atrás"); fechas localizadas |
| 12 | Historial · un día | Al tocar un día del calendario: solo ese día + "Ver todas" |
| 13 | Ejercicios | Desde Inicio (con "atrás"); icono por grupo |
| 14 | Perfil | Cuerpo (peso y altura) + calorías en una línea |
| 15 | Calorías | "¿Qué es esto?" desplegado: basal, gasto diario, método |
| 16 | Apariencia | Noche · Día · Más (temas extra y bandera); Foto de Inicio (opcional) |
| 17 | Tema Día | Inicio en el tema inverso |
| 18 | Tema Ámbar | Inicio en azul medianoche + ámbar |
| 19 | Tema España | Inicio con los colores de la bandera (rojo y amarillo) |
| 20 | Ejercicios FR | Cambio de idioma instantáneo (nombres incluidos) |
| 21 | Ejercicios NL | Ídem en neerlandés |
| 22 | ¿Cómo se hace? NL | Los pasos siguen el idioma elegido |

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
