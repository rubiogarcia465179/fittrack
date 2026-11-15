# FitTrack — Capturas y vídeo (iPhone 16, 393×852 @2x)

Capturas reales del build web de la app (`expo export --platform web`) en
Chrome headless con viewport de iPhone 16. Datos de ejemplo locales, sin red.
**Se regeneran en cada commit** (regla de `AGENTS.md`).

| # | Pantalla | Qué muestra |
|---|----------|-------------|
| 01 | Resumen | Acción principal, "Esta semana" (sesiones · volumen · días seguidos), nuevas marcas, gráfica semanal, últimas sesiones |
| 02 | Más estadísticas | Grupos musculares, marcas 1RM y calendario de actividad (plegados por defecto) |
| 03 | Arranque | "Recomiéndame un entreno" / "Añado mis datos yo" |
| 04 | Sesión activa | Tema negro con degradado; ejercicio actual completo, el resto en una línea; barra fija "Terminar" + "Siguiente ejercicio" |
| 05 | Máquina ocupada | "¿Máquina ocupada?" despliega Ocupado / Fuera de servicio |
| 06 | Cardio | Ejercicio de cardio: min · km · intensidad · hecha, kcal estimadas; último ejercicio → "Terminar y guardar" |
| 07 | Valoración | Hoja opcional al terminar: energía y sensación (1–5), "Guardar sesión" o "Finalizar sin valorar" |
| 08 | Historial | La sesión guardada con cardio ("20 min · 3 km · Fuerte") y valoración |
| 09 | Perfil | Sobre ti (sexo, año, nivel, objetivo), peso con tendencia |
| 10 | Calorías y ajustes | Gasto diario y metabolismo basal (Mifflin-St Jeor × actividad real), idioma, tus datos |

**Vídeo** — `video-iphone16.mp4` (H.264, 786×1704, 30 fps, ~27 s): el mismo
recorrido que las capturas, grabado con el screencast de Chrome.

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
