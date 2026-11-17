# FitTrack

App de gimnasio sencilla (Expo / React Native, iOS · Android · web): te
propone qué entrenar hoy, registras series con dos toques y ves tu progreso
real. **Sin cuenta y sin nube**: todo se guarda en el dispositivo, con copia
de seguridad a un archivo. 4 idiomas (ES/EN/NL/FR).

## Estado
Ver `PROGRESS.md` (estado y verificaciones) y `TASKS.md` (pendientes).
Base de ejercicios **real**: 205 ejercicios de wger (CC BY-SA). Dibujos de
ejercicios reales de Everkinetic (CC BY-SA 3.0) donde existen; el resto
muestra una imagen de ejemplo marcada (`docs/fotos/STATUS.md`).

## Estructura
```
fittrack/
├── CLAUDE.md AGENTS.md SPEC.md TASKS.md PROGRESS.md REQUIREMENTS.md
├── data/      ← base de ejercicios (JSON) + imágenes + fotos/dibujos
├── scripts/   ← sync_data.py, generadores, fetch_everkinetic.py …
├── i18n/      ← bundles nl/es/en/fr (fuente; espejo en app/src/i18n-data/)
├── tests/     ← node tests/run.js
├── app/       ← Expo SDK 58 / React Native 0.88   → su package.json
├── web/       ← la web = build web de la app (sin dependencias propias)
└── docs/      ← capturas, vídeo, kit portable, playbook de UX
```
Los comandos `npm` van en `app/` o `web/` (la raíz no tiene `package.json`).

## Web: probarla en el host

La web **es la app** (mismo código, compilado con react-native-web; el sitio
Astro anterior está en la rama `web-astro`).
```bash
cd app && npm ci            # solo la primera vez
cd ../web && npm run build  # → web/dist/
npm run preview             # → http://localhost:8080
```
Sube `web/dist/` a cualquier hosting estático, en la raíz del dominio.
Detalles y diferencias con el móvil: `web/README.md`.

## App Android: probarla en tu móvil

### Opción A — Expo Go (rápida, sin compilar)
1. En el host:
   ```bash
   cd app
   npm ci
   npx expo start
   ```
2. En el móvil: instala **Expo Go** (Google Play, de expo.dev) y abre la
   app.
3. Escanea con la cámara del móvil el **QR que imprime la terminal** (el
   mismo móvil debe estar en la misma red que el host). Se descarga el
   bundle por la red local y arranca la app nativa.
4. Si el móvil no ve el QR (distintas redes), pulsa `a` en la terminal para
   ver la URL de la forma `exp://IP-DEL-HOST:8081` y pégala en Expo Go, o
   usa el botón "Open on device" si el móvil está en tu cuenta de Expo.

Desde Windows/WSL aplica lo mismo que en la sección iPhone (red de WSL,
IP de Metro, firewall, sesión de Expo, SDK de Expo Go).

### Opción B — build nativo (APK)
```bash
cd app
npx expo prebuild -p android
cd android && ./gradlew assembleDebug
# APK en android/app/build/outputs/apk/debug/app-debug.apk
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción C — web en el móvil
`cd app && npx expo start --web` abre la app en el navegador (React Native
Web) con recarga en caliente; es lo mismo que `web/` (la web ES la app).

Checklist en el móvil (R-128): 3 pestañas (Inicio · Entrenar · Perfil);
"Empezar sesión" → "Continuar al entreno"; marcar series, descanso con
**el móvil bloqueado** (debe llegar el aviso), "Finalizar" y valorar;
diario con foto y comentario; idioma en **Perfil**; **Perfil → Guardar una
copia** (a Archivos/iCloud o una carpeta) y **Restaurar una copia**; cerrar
y reabrir: todo sigue ahí.

> El aviso del descanso usa `expo-notifications`, que **no funciona en Expo
> Go** desde SDK 53: para probarlo hace falta un *development build*
> (`npx expo run:ios` / `npx expo run:android`, o EAS Build). El resto sí se
> puede probar en Expo Go.

## App iPhone: probarla en tu móvil (Expo Go)

Requisitos:
- **Expo Go** de la App Store. En iOS solo existe la versión para la
  **última SDK de Expo** (hoy SDK 58, la del proyecto). Si no coinciden,
  Expo Go muestra `Project is incompatible with this version of Expo Go` y
  la única salida es subir la SDK del proyecto
  (`npx expo install expo@<versión>` + `npx expo install --fix`).
- Una **cuenta de Expo** con sesión iniciada en los **dos** lados: la CLI
  del ordenador y la app Expo Go del iPhone, con la **misma cuenta**.
- iPhone y ordenador en la **misma Wi-Fi**.

### Opción A — Metro en Windows (lo que se usó y funcionó)
Con Metro en WSL, Expo Go en el iPhone daba *timeout* (WSL usa una red
interna `172.x.x.x` que el iPhone no ve). En Windows funciona.

Todo en PowerShell.

**Primera vez:**
1. Instala Node.js y abre una ventana **nueva** de PowerShell (en la
   ventana anterior `node` no se reconoce):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   node -v
   ```
   `npm`/`npx` dan `npm.ps1 cannot be loaded because running scripts is
   disabled` → usa `npm.cmd` y `npx.cmd`.
2. Copia el repo de WSL al disco de Windows e instala dependencias:
   ```powershell
   git clone \\wsl.localhost\Ubuntu-24.04\home\<usuario>\fittrack C:\dev\fittrack
   cd C:\dev\fittrack\app
   npm.cmd ci
   ```
3. Sesión de Expo en la CLI con un token (con cuenta de Google,
   `npx.cmd expo login` solo abre el navegador y la terminal sigue sin
   sesión). Crea el token en expo.dev → **Access tokens**, y:
   ```powershell
   $env:EXPO_TOKEN = "<token>"
   npx.cmd expo whoami
   ```
   `whoami` debe mostrar tu usuario. El token no se versiona ni se comparte.
4. En el iPhone: instala **Expo Go** e inicia sesión con la **misma**
   cuenta de Expo.

**Arrancar y abrir en el iPhone:**
1. Arranca Metro con la IP Wi-Fi del PC (sin esto Expo Go daba
   `Could not connect to the server`: el PC tiene también una VPN `10.x` y
   la red de WSL `172.x`):
   ```powershell
   cd C:\dev\fittrack\app
   $env:REACT_NATIVE_PACKAGER_HOSTNAME = "<IP-WiFi>"
   npx.cmd expo start --clear
   ```
   Si Windows pregunta por el firewall para Node.js: **Permitir acceso**.
2. iPhone en la misma Wi-Fi: escanea el QR de la terminal con la cámara →
   se abre en Expo Go. En la terminal sale `iOS Bundled ... index.ts`.

### Opción B — desde WSL
WSL es donde se desarrolla y se verifica (sin iPhone):
```bash
cd ~/fittrack/app
npm ci
npm run typecheck
npm run bundle:check
cd .. && node tests/run.js
```
Para abrir la app en Expo Go con Metro corriendo en WSL, WSL tiene que
compartir la red de Windows (**no verificado en esta máquina**; la
Opción A sí):
1. En Windows, crea `C:\Users\<usuario>\.wslconfig`:
   ```ini
   [wsl2]
   networkingMode=mirrored
   ```
   y en PowerShell `wsl --shutdown`; vuelve a abrir WSL.
2. Sesión de Expo en WSL (independiente de la de Windows):
   `export EXPO_TOKEN=<token>` (o añádelo a `~/.bashrc`), y
   `npx expo whoami`.
3. `cd ~/fittrack/app && npx expo start --clear`: la URL debe mostrar la IP
   Wi-Fi (`192.168.x.x`), no `172.x.x.x`. Luego, los pasos 3–4 de la
   Opción A. En modo *mirrored* el tráfico entrante a WSL pasa por el
   firewall de Hyper-V; si `/status` no carga, revisa ese firewall.

Alternativa: `npx expo start --tunnel` funciona con cualquier red, pero
necesita el paquete `@expo/ngrok` (dependencia nueva → ⛔ en `TASKS.md`
según `AGENTS.md`).

### Problemas que nos encontramos (Windows)
| Mensaje | Qué lo resolvió |
|---|---|
| `node` no se reconoce tras `winget install` | Abrir una ventana nueva de PowerShell |
| `npm.ps1 cannot be loaded because running scripts is disabled` | Usar `npm.cmd` / `npx.cmd` |
| `Request timed out` (Metro en WSL) | Ejecutar Metro en Windows (`C:\dev\fittrack`) |
| `Could not connect to the server` | `$env:REACT_NATIVE_PACKAGER_HOSTNAME = "<IP-WiFi>"` antes de `npx.cmd expo start --clear` |
| `Project is incompatible with this version of Expo Go` (SDK 51 vs 58) | Ya resuelto: la app se subió a SDK 58 (commit `67b3d5c`) |
| `You need to be signed in to Expo Go and Expo CLI` | `$env:EXPO_TOKEN = "<token>"` |
| `signed in to Expo CLI as "…", but not signed in to Expo Go` | Iniciar sesión en Expo Go con la misma cuenta |
| `Unable to resolve "react-native/asset-registry"` | `node_modules` antiguo tras la subida de SDK: reinstalar con `npm.cmd install` en `app/` |

Aviso conocido (no bloquea): `SafeAreaView has been deprecated` → pendiente
migrar a `react-native-safe-area-context`.

### Opción C — build nativo (simulador o dispositivo, requiere macOS)
```bash
cd app
npx expo prebuild -p ios
npx expo run:ios                # arranca en el simulador por defecto
# para tu iPhone: Xcode → Product → Destination → tu dispositivo
# (o: cd ios && xcodebuild -workspace ios.xcworkspace -scheme fittrack
#  -destination 'platform=iOS,name=Mi iPhone' build)
```
Para instalarla en el dispositivo físico hace falta cuenta de Apple
Developer (o perfil gratuito con expiración de 7 días) y confianza del
computadora en el iPhone.

### Opción D — web en el iPhone
`npx expo start --web` y abre `http://IP-DEL-HOST:8081` en Safari, o
`cd web && npm run build && npm run preview` y abre `http://IP-DEL-HOST:8080`.

Mismo checklist que Android (arriba), incluido el aviso del descanso con
el móvil bloqueado (solo en *development build*).

## Tests
```bash
node tests/run.js        # datos + i18n + lógica + copia de seguridad + tsc
cd app && npm run typecheck && npm run bundle:check
cd web  && npm run build   # build web de la app
```
`tests/run.js` → 0 fallos.

## Créditos y licencias

- **Ejercicios**: base de datos de wger.de (CC BY-SA 4.0 / 3.0 / CC0 según el ejercicio).
- **Dibujos de ejercicios**: **Everkinetic** (http://everkinetic.com/), vía
  Wikimedia Commons, licencia **CC BY-SA 3.0**
  (https://creativecommons.org/licenses/by-sa/3.0/). **Modificados** por
  FitTrack (fondo transparente, recorte, tamaño, escala de grises; tinte del
  tema en la app; en algunos, orden de los fotogramas). Las versiones
  modificadas se distribuyen bajo la misma licencia CC BY-SA 3.0. Original,
  fuente y cambios de cada archivo: `docs/CREDITOS-DIBUJOS.md` y
  `data/images/photos/credits.json` (licencia de la carpeta:
  `data/images/photos/LICENSE.md`).
- **Vídeos**: YouTube (cada uno de su canal; se reproducen con el reproductor oficial).
- **Fuente**: Montserrat (SIL OFL, `docs/OFL-Montserrat-LICENSE.txt`).
