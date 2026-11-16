# FitTrack — versión web

La web **es la app**: el mismo código de `app/` compilado para el navegador
con `expo export --platform web` (react-native-web). Misma pantalla, mismo
diseño, mismas funciones y mismos datos locales (localStorage), siempre al día:
no hay una segunda base de código que mantener (decisión del usuario
2026-11-16, R-131). El sitio Astro anterior está en la rama `web-astro`.

```sh
cd web && npm run build     # → web/dist/ (estático)
cd web && npm run preview   # → http://localhost:8080
```

- Súbelo a cualquier hosting estático, **en la raíz del dominio** (Expo usa
  rutas absolutas `/_expo/…`). `404.html` = la app, para hosts tipo SPA.
- Diferencias con el móvil (módulos `*.web.ts` de `app/src/lib/`): fotos con
  `<input type="file">` guardadas en localStorage; la copia de seguridad se
  descarga como archivo y se restaura eligiéndolo; sin aviso del descanso con
  la pantalla bloqueada (el navegador no lo permite) ni vibración salvo donde
  el navegador la soporte.

## Publicar en Netlify (gratis)

`netlify.toml` (raíz del repo) ya está listo: Netlify compila `app/` con
`expo export` en cada push a `main` y publica `app/dist`.
1. Cuenta gratuita en netlify.com (con GitHub).
2. "Add new site" → "Import an existing project" → GitHub → este repo.
   Netlify lee `netlify.toml`; no hay que tocar nada más.
3. Dirección gratuita `https://<nombre>.netlify.app` (HTTPS incluido). Un
   dominio propio es opcional (Site configuration → Domain management).
