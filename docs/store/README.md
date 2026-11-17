# Publicar FitTrack en App Store y Google Play

Todo lo que piden las tiendas, listo para copiar (R-142). Lo único que no
puede hacer el agente: las cuentas de desarrollador, los pagos y los clics
de envío (son tuyos).

## Qué hay aquí

| Qué | Dónde |
|---|---|
| Textos de la ficha (nombre, subtítulo, descripción, palabras clave…) en EN/ES/NL/FR | `en.md`, `es.md`, `nl.md`, `fr.md` (fuente: `listing.json`) |
| Capturas Apple 6,9" (1320 × 2868), 5 por idioma, con titular | `apple/<idioma>-1..5.png` |
| Capturas Google Play (1080 × 2160), 5 por idioma | `google/<idioma>-1..5.png` |
| Gráfico destacado Google (1024 × 500) | `google/feature-graphic-<idioma>.png` |
| Capturas sin marco (se regeneran; fuera de git) | `raw/` |
| Icono 1024 (Apple) / 512 (Google) | `app/assets/icon.png` / `app/public/icon-512.png` |
| Política de privacidad (URL obligatoria) | `https://<tu-web>/privacy.html` (`app/public/privacy.html`) |
| Soporte (URL obligatoria) | `https://<tu-web>/support.html` (`app/public/support.html`) |
| Configuración de compilación | `app/eas.json`, `app/app.json` |

Las capturas usan los datos de ejemplo del harness (`app/qa/shots/shoot.js`);
la foto del diario es la imagen de ejemplo de la app (generada con IA). Se
regeneran con:
`node.exe app/qa/shots/shoot.js <dist> docs/store/raw --size 440x956 --dpr 3 --scenario app/qa/shots/scenario-store.js`
(y `--size 360x720` para Google), y el marco con `python3 scripts/make_store_frames.py`.

## Datos fijos de la app

- Nombre visible: **FitTrack** · Bundle ID iOS / paquete Android: **nl.fittrack.app**
- Versión 1.0.0 (build 1 / versionCode 1) · Solo iPhone (sin iPad), vertical.
- Categoría: **Salud y forma física** (Health & Fitness).
- Edad: **4+** (Apple) / **Para todos** (Google): sin contenido sensible.
- Precio: gratis · Sin compras dentro de la app · Sin anuncios.
- Cifrado: solo HTTPS estándar → `ITSAppUsesNonExemptEncryption = false` (ya en `app.json`).

## Privacidad (cuestionarios de las tiendas)

FitTrack **no recoge datos**: sin cuenta, sin servidor, sin analítica, sin
anuncios. Todo se queda en el teléfono; la copia de seguridad es un archivo
que guarda el usuario.

- **Apple → App Privacy**: "Data Not Collected" (no se recogen datos).
- **Google → Data safety**: ¿recoge o comparte datos? **No**. ¿Cifrado en
  tránsito? Sí (HTTPS). ¿Se pueden borrar? Sí, "Borrar todos los datos" o
  desinstalar.
- **Matiz honesto (vídeos)**: al tocar "Ver vídeo" se carga YouTube
  (modo de privacidad mejorada) dentro de la app, como abrir una web. No hay
  SDK de YouTube ni de Google en la app; está explicado en la política de
  privacidad. Si un revisor pregunta, esa es la respuesta.
- Permisos: fotos (solo al elegir una), notificaciones (aviso del descanso,
  locales). Sin cámara, micrófono, ubicación ni contactos.

## Pasos — Apple (App Store)

1. **Cuenta**: Apple Developer Program (99 USD/año) en developer.apple.com.
2. **Crear la app** en App Store Connect → Apps → "+" → iOS, nombre
   "FitTrack: Gym Workout" (o el de tu idioma principal), idioma principal,
   bundle ID `nl.fittrack.app`, SKU `fittrack-ios`.
3. **Compilar y subir** (desde cualquier ordenador, sin Mac, con EAS):
   ```sh
   cd app
   npx eas-cli login                 # tu cuenta de Expo
   npx eas-cli build --platform ios --profile production
   npx eas-cli submit --platform ios --latest
   ```
   (rellena antes `appleId` y `ascAppId` en `app/eas.json`). EAS gestiona
   certificados y perfiles.
4. **Ficha**: pega los textos de `<idioma>.md` en cada idioma; sube las 5
   capturas de `apple/`; URL de privacidad y de soporte (tu web).
5. **Privacidad**: "Data Not Collected". **Edad**: responde "No" a todo → 4+.
6. **Notas para revisión**: "No account or login needed. All data is stored
   on the device. Tap 'Start session' on Home to try a workout."
7. **Enviar a revisión** (suele tardar 1–3 días).

## Pasos — Google Play

1. **Cuenta**: Google Play Console (pago único de 25 USD) en play.google.com/console.
2. **Atención (cuentas personales nuevas)**: Google exige una **prueba
   cerrada con al menos 12 testers durante 14 días** antes de poder publicar
   en producción (comprueba la regla actual en la Play Console). Empieza
   pronto: invita a 12 personas a la pista de prueba cerrada.
3. **Crear la app**: nombre, idioma, "App", "Gratis".
4. **Compilar y subir**:
   ```sh
   cd app
   npx eas-cli build --platform android --profile production   # .aab
   npx eas-cli submit --platform android --latest              # o súbelo a mano
   ```
   (para `submit` necesitas una cuenta de servicio de Google Play y su JSON
   en `app/google-play-service-account.json`, que está en `.gitignore`).
5. **Ficha**: textos de `<idioma>.md`, capturas de `google/`, gráfico
   destacado, icono 512.
6. **Contenido de la app**: Data safety (arriba), clasificación de contenido
   (cuestionario → "Para todos"), público objetivo (13+ o adultos; no es para
   niños), sin anuncios.
7. Prueba cerrada → (14 días) → **producción**.

## Antes de enviar

- [ ] Prueba en iPhone real (R-128): copia/restauración, aviso del descanso
      bloqueado, vídeo, diario. Lo que falle, se arregla antes de subir.
- [ ] La web publicada (Netlify) para que las URLs de privacidad y soporte
      funcionen.
- [ ] (Opcional) Dibujos que faltan (`docs/fotos/CODEX-DIBUJOS.md`).
