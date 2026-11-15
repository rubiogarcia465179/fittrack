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
| 06 | Sesión activa | Un solo acceso ("Añadir ejercicio"); ejercicio actual; "Más opciones" plegado |
| 07 | Más opciones | Sugerir ejercicio · ¿Máquina ocupada? · Quitar ejercicio |
| 08 | ¿Cómo se hace? | Foto (de ejemplo, marcada), qué entrena, 3 pasos en español |
| 09 | Descanso | Cuenta atrás tras completar una serie (+15 s, Saltar) |
| 10 | Cardio | min · km · intensidad; "Terminar y guardar" |
| 11 | Valoración | Energía y sensación (1–5), dentro de la pantalla; sin "Detalles" |
| 12 | Historial | Desde Inicio (con "atrás"); fechas localizadas |
| 13 | Historial · un día | Al tocar un día del calendario: solo ese día + "Ver todas" |
| 14 | Ejercicios | Desde Inicio (con "atrás"); icono por grupo |
| 15 | Perfil | Cuerpo (peso, altura, IMC, evolución) + calorías |
| 16 | Perfil · ajustes | Sobre ti, Apariencia, idioma + tus datos, "Licencias y créditos" al pie |
| 17 | Tema Día | Inicio en el tema inverso |
| 18 | Ejercicios FR | Cambio de idioma instantáneo (nombres incluidos) |
| 19 | Ejercicios NL | Ídem en neerlandés |
| 20 | ¿Cómo se hace? NL | Los pasos siguen el idioma elegido |
| 21 | Primer arranque | Sin datos: "Empieza por tus marcas" + "Establecer marcas" |
| 22 | Test de marcas | Los 5 clásicos, calentamiento + serie de test, 1RM estimado |

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
