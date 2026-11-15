# FitTrack — Capturas y vídeo (iPhone 16, 393×852 @2x)

Capturas reales del build web de la app (`expo export --platform web`) en
Chrome headless con viewport de iPhone 16. Datos de ejemplo locales, sin red.
**Se regeneran en cada commit** (regla de `AGENTS.md`).

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Inicio | "Hoy toca: …" + Cambiar, objetivo y duración, "Empezar sesión", cuerpo 3D (orbitable con el dedo) |
| 02 | Inicio · Cambiar | Tras un toque en "Cambiar": el siguiente bloque |
| 03 | Inicio · más | Marcas personales, calendario con día de récord en verde, filas Historial / Ejercicios |
| 04 | Tu entreno de hoy | Hoja previa: duración, intensidad, energía, objetivo |
| 05 | Entreno generado | Sesión creada por la hoja (nunca 0 kg en ejercicios con carga) |
| 06 | Sesión activa | "Añadir ejercicio" y "Detalles"; ejercicio actual; "Más opciones" plegado |
| 07 | Más opciones | Sugerir ejercicio · ¿Máquina ocupada? · Quitar ejercicio |
| 08 | ¿Cómo se hace? | Foto (de ejemplo, marcada), qué entrena, 3 pasos en español |
| 09 | Descanso | Cuenta atrás tras completar una serie (+15 s, Saltar) |
| 10 | Cardio | min · km · intensidad; "Terminar y guardar" |
| 11 | Valoración | Energía y sensación (1–5) |
| 12 | Historial | Desde Inicio (con "atrás"); fechas localizadas |
| 13 | Historial · un día | Al tocar un día del calendario: solo ese día + "Ver todas" |
| 14 | Ejercicios | Desde Inicio (con "atrás"); icono por grupo |
| 15 | Perfil | Cuerpo (peso y altura) + Marcas personales con su origen |
| 16 | Calorías | "¿Qué es esto?" desplegado: basal, gasto diario, método |
| 17 | Apariencia | Noche · Día · Más (temas extra y bandera); Foto de Inicio (opcional) |
| 18 | Tema Día | Inicio en el tema inverso (cuerpo con líneas oscuras) |
| 19 | Tema Ámbar | Inicio en azul medianoche + ámbar |
| 20 | Tema España | Inicio con los colores de la bandera (rojo y amarillo) |
| 21 | Ejercicios FR | Cambio de idioma instantáneo (nombres incluidos) |
| 22 | Ejercicios NL | Ídem en neerlandés |
| 23 | ¿Cómo se hace? NL | Los pasos siguen el idioma elegido |
| 24 | Test de marcas | "Establecer marcas": los 5 clásicos, calentamiento + serie de test, 1RM estimado |
| 25 | Cuerpo 3D · mujer | Proporciones según el Perfil (mujer, IMC ≈ 22) |
| 26 | Cuerpo 3D · girado | Tras arrastrar con el dedo: de espaldas a tres cuartos (dorsales, glúteos, isquios) |

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
