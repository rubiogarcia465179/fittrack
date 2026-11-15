# FitTrack — Capturas y vídeo (iPhone 16, 393×852 @2x)

Capturas reales del build web de la app (`expo export --platform web`) en
Chrome headless con viewport de iPhone 16. Datos de ejemplo locales, sin red.
**Se regeneran en cada commit** (regla de `AGENTS.md`).

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Inicio | Foto de cabecera (sin botones), "Empezar sesión", marcas personales |
| 02 | Inicio · calendario | Calendario (lunes primero, días entrenados en círculo) + peso / historial |
| 03 | Inicio · actividad | Histogramas: hora del entreno y día de la semana |
| 04 | Tu entreno de hoy | Hoja previa: duración, intensidad, energía, objetivo |
| 05 | Entreno generado | Sesión creada por la hoja (nunca 0 kg en ejercicios con carga) |
| 06 | Sesión activa | Cabecera "Sesión · x/y", accesos rápidos, ejercicio actual |
| 07 | ¿Cómo se hace? | Foto (de ejemplo, marcada), qué entrena, 3 pasos en español |
| 08 | Descanso | Cuenta atrás tras completar una serie (+15 s, Saltar) |
| 09 | Cardio | min · km · intensidad; "Terminar y guardar" |
| 10 | Valoración | Energía y sensación (1–5) |
| 11 | Historial | Sesiones con fecha localizada ("dom 15 nov"), cardio y valoración |
| 12 | Ejercicios | Biblioteca con nombres en español e icono por grupo |
| 13 | Perfil | Sobre ti |
| 14 | Calorías | Gasto diario, basal y explicación sencilla |
| 15 | Tema y foto | Temas + "Usar los colores de mi país", **Foto de Inicio** (Cambiar foto), idioma |
| 16 | Tema Día | Inicio en el tema inverso |
| 17 | Tema Ámbar | Inicio en azul medianoche + ámbar |
| 18 | Tema España | Inicio con los colores de la bandera (rojo y amarillo) |
| 19 | Biblioteca FR | Cambio de idioma instantáneo (nombres incluidos) |
| 20 | Biblioteca NL | Ídem en neerlandés |
| 21 | ¿Cómo se hace? NL | Los pasos siguen el idioma elegido |

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
