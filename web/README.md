# FitTrack — versión web

La web es **una sola pantalla que crea un entreno** (R-136): eliges qué
entrenas, objetivo, tiempo y material, y aparece la sesión con un dibujo y un
vídeo por ejercicio. Sin perfil y sin guardar nada; idioma arriba a la
derecha. Es el mismo código de `app/` (react-native-web) compilado con
`EXPO_PUBLIC_WEB_MODE=planner` (`app/src/web/WebPlanner.tsx`), así que
comparte ejercicios, dibujos, vídeos, textos y diseño con la app (R-131). El
sitio Astro anterior está en la rama `web-astro`.

Capturas a 3 anchos: `bash web/qa.sh` → `docs/screenshots/web/`.

```sh
cd web && npm run build     # → web/dist/ (estático)
cd web && npm run preview   # → http://localhost:8080
```

- Súbelo a cualquier hosting estático, **en la raíz del dominio** (Expo usa
  rutas absolutas `/_expo/…`). `404.html` = la app, para hosts tipo SPA.
- La app completa en el navegador (perfil, diario, copia…) sigue disponible
  para desarrollo con `cd app && npx expo start --web` (sin la variable).

## Publicar en Netlify (gratis)

`netlify.toml` (raíz del repo) ya está listo: Netlify compila `app/` con
`expo export` en cada push a `main` y publica `app/dist`.
1. Cuenta gratuita en netlify.com (con GitHub).
2. "Add new site" → "Import an existing project" → GitHub → este repo.
   Netlify lee `netlify.toml`; no hay que tocar nada más.
3. Dirección gratuita `https://<nombre>.netlify.app` (HTTPS incluido). Un
   dominio propio es opcional (Site configuration → Domain management).
