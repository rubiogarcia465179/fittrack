# Tarea para Codex: generar los dibujos que faltan (estilo Everkinetic)

Pega esto en Codex (o pídele "lee docs/fotos/CODEX-DIBUJOS.md y hazlo").

## Objetivo

FitTrack tiene dibujos de línea reales de **Everkinetic** para 78 ejercicios.
Faltan **127 ejercicios (254 imágenes)**: para cada uno, la posición inicial
(`<id>-1.png`) y la final (`<id>-2.png`), **en el mismo estilo** que los de
Everkinetic, generados con la API de imágenes de OpenAI usando esos dibujos
como **ejemplos adjuntos**.

## Archivos

| Qué | Dónde |
|---|---|
| Ejemplos de estilo (156 dibujos de Everkinetic, negro sobre blanco) | `docs/fotos/referencias/` |
| Trabajos: id, imagen, prompt exacto y ejemplos a adjuntar | `docs/fotos/prompts-dibujos.json` |
| Lo mismo para leer | `docs/fotos/PROMPTS-DIBUJOS.md` |
| Lista de lo hecho / pendiente (se actualiza sola) | `docs/fotos/STATUS.md` (sección "Pendientes de dibujo") |
| Generador (sin dependencias) | `scripts/generate_drawings_openai.py` |
| Importador (limpia, etiqueta "generado con IA", actualiza todo) | `scripts/add_drawings.py` |

## Pasos

1. Lee `CLAUDE.md` y `AGENTS.md` (reglas del repo: no añadir dependencias,
   nada inventado presentado como real, commits solo al terminar y con
   verificación).
2. Prueba con 4 ejercicios:
   ```sh
   export OPENAI_API_KEY=...            # la clave del usuario
   python3 scripts/generate_drawings_openai.py --limit 4
   ```
   El modelo por defecto es `gpt-image-2`; si OpenAI tiene otro nombre
   vigente, usa `--model <nombre>` (consúltalo en la documentación de OpenAI).
   El script usa `POST /v1/images/edits` con las imágenes de ejemplo del JSON
   adjuntas (`image[]`) y el prompt exacto; la imagen 2 adjunta además la 1.
3. **Revisa cada imagen a mano** (ábrela). Rechaza y regenera (borra el
   archivo de `data/images/photos/inbox/` y vuelve a ejecutar) si:
   - el movimiento o el material no corresponden al ejercicio;
   - la técnica es incorrecta o insegura (espalda redonda, rodillas hacia
     dentro…);
   - hay texto, flechas, color, sombras, suelo o fondo;
   - no parece del mismo juego que los ejemplos (cara dibujada, camiseta,
     zapatillas, líneas muy finas o muy gruesas);
   - la imagen 2 no es la misma persona y el mismo ángulo que la 1.
4. Cuando las 4 estén bien, genera el resto (todo o por grupos con `--ids`).
5. Importa:
   ```sh
   python3 scripts/add_drawings.py
   ```
   Convierte cada imagen a líneas sobre transparente (igual que las de
   Everkinetic), la marca en `credits.json` como `kind: drawing`, autor
   "IA (usuario)", mueve el original a `inbox/originales/` (fuera de git) y
   actualiza `app/src/exercisePhotos.ts`, `docs/fotos/STATUS.md` y los
   prompts que quedan. En la app aparecen como **"Dibujo generado con IA"**
   (nunca como de Everkinetic).
6. Verifica antes de commitear (`CLAUDE.md §2`): `cd app && npx tsc --noEmit`,
   `node tests/run.js`, capturas (`docs/screenshots/README.md`) y mira algunas
   fichas con dibujo nuevo. Commit en `main`, mensaje en español con números
   ("N dibujos generados con IA; STATUS: …").

## Notas

- **Coste aproximado**: según la calidad, de céntimos a ~0,20 USD por imagen
  (254 imágenes); los ejemplos adjuntos encarecen un poco cada petición.
  Comprueba el precio actual en la página de precios de OpenAI.
- **Licencia**: los ejemplos son de Everkinetic (CC BY-SA 3.0). Para ser
  respetuosos con su licencia, comparte también los dibujos generados bajo
  CC BY-SA 3.0 (ya lo dice `data/images/photos/LICENSE.md`) y deja constancia
  de que el estilo se inspira en Everkinetic (lo hace `add_drawings.py` en la
  nota de cada archivo).
- Si un ejercicio sale mal varias veces, déjalo pendiente: mejor el icono de
  línea que un dibujo con técnica incorrecta.
