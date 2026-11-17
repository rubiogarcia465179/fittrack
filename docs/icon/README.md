# Icono de FitTrack

**Un círculo blanco con un check negro sobre negro**: el mismo círculo que se
toca para marcar cada serie como hecha. El icono *es* el momento central de
la app; monocromo como todo FitTrack (R-141, 2026-11-17).

| Archivo | Uso |
|---|---|
| `docs/icon/icon.svg` | Fuente (1024 × 1024, a sangre: iOS redondea las esquinas) |
| `docs/icon/adaptive-foreground.svg` | Primer plano Android (zona segura), fondo `#000000` |
| `app/assets/icon.png` | Icono de la app (iOS/Android/Expo) |
| `app/assets/adaptive-icon.png` | Primer plano del icono adaptativo de Android |
| `app/assets/splash.png` | Pantalla de carga: el disco sobre negro |
| `app/public/favicon-32.png`, `favicon.png` (192), `apple-touch-icon.png` (180), `icon-512.png` | Web |
| `docs/icon/preview.png` | Cómo se ve: pantalla de inicio (fondo oscuro y claro), carga, pestaña y cabecera web |

Detalles: fondo negro con un brillo muy suave arriba (#1A1A1C → #000), disco
blanco → perla (#FFF → #E6E7EA), check con extremos redondeados y centrado
ópticamente (un poco a la izquierda y arriba del centro geométrico). Se lee a
16 px. Para cambiarlo: edita el SVG y vuelve a renderizar a 1024 px (Chrome
headless) y a generar los tamaños.
