# FitTrack

Monitor de progreso de gimnasio: base de ejercicios, registro de sesiones
(juegos, repeticiones, peso) y dashboard de resumen. Web estática
(Astro + Tailwind) y app móvil (Expo / React Native). Sin backend en el MVP:
datos embebidos y persistencia local (localStorage / AsyncStorage).

## Estado
Ver `PROGRESS.md` (estado y verificaciones) y `TASKS.md` (pendientes).
La base de ejercicios es **real** (226 ejercicios de wger, CC-BY-SA, vía
wheel de PyPI — ver `AGENTS.md`). Las **imágenes** siguen siendo
placeholders generados (`static.wger.de` no está resuelto en internet) y la
UI lo declara.

## Estructura (importante: son dos sub-proyectos)
```
fittrack/
├── AGENTS.md  SPEC.md  PROGRESS.md  TASKS.md  README.md
├── data/      ← base de ejercicios (JSON, source: real) + imágenes
├── scripts/   ← sync_data.py, fetch_exercises_wger_pypi.py, generadores
├── i18n/      ← bundles nl/es/en/fr (105 claves)
├── tests/     ← node tests/run.js
├── web/       ← Astro 4 (static) + Tailwind 3.4   → su package.json AQUÍ
└── app/       ← Expo SDK 58 / React Native 0.88   → su package.json AQUÍ
```
**La raíz NO tiene `package.json`** (son dos proyectos independientes).
Todos los comandos `npm` se ejecutan desde `web/` o desde `app/`.

## Web: probarla en el host

1. Instala dependencias (solo la primera vez):
   ```bash
   cd web
   npm ci          # usa package-lock.json versionado
   ```
2. Sirve el sitio (elige una):
   ```bash
   npm run build && npm run preview -- --host    # build + preview en :4321
   #  ó desarrollo en caliente:
   npm run dev -- --host
   ```
   Abre `http://<ip-del-host>:4321/` (con `--host` también desde otro
   dispositivo de la red).
   También vale cualquier hosting estático con `web/dist/`.

3. Rutas (231 páginas):
   - `/` — home estilo apple.com (hero + grid 2×2 de tiles + franja gris)
   - `/dashboard/` — resumen con métricas (volumen, racha, PRs, peso)
   - `/exercises/` — biblioteca: 226 ejercicios, búsqueda + filtros por grupo/material
   - `/exercises/<id>/` — detalle (instrucciones, imagen, licencia)
   - `/session/` — registro de una sesión (añadir ejercicios/sets, peso corporal)
   - `/history/` — historial con borrar
   Cambia de idioma con NL/ES/EN/FR en la cabecera (instantáneo, sin red);
   en móvil se abre el **menú hamburguesa** (pantalla completa, como
   apple.com) con los enlaces grandes y el selector de idioma. Guarda una
   sesión en `/session/` y comprueba que el dashboard y el historial la
   reflejan (persistencia en localStorage).

Si `npm run preview` da `ENOENT ... fittrack/package.json` → estabas en la
raíz del repo: haz `cd web` antes.

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
Web); útil para probar la UI sin instalar nada. (La web principal es
`web/`; esta sirve para ejercitar la app.)

Checklist en el móvil: 5 pestañas (Dashboard, Exercises, Session, History,
Profile),
conmutación NL/ES/EN/FR instantánea, crear sesión con sets/reps/peso,
borrar del historial, volver a abrir la app y ver que las sesiones
persisten (AsyncStorage).

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
`npx expo start --web` y abre `http://IP-DEL-HOST:8081` en Safari. La web
principal también va genial en el navegador del iPhone (es
mobile-first): abre `http://IP-DEL-HOST:4321/` de la web de Astro.

Mismo checklist que Android: 5 pestañas, cambio de idioma instantáneo,
crear sesión, borrar del historial, persistencia al reabrir (AsyncStorage).

## Tests
```bash
node tests/run.js        # integridad de datos + lógica + i18n + paridad
cd app && npm run typecheck && npm run bundle:check
cd web  && npm run build
```
`tests/run.js` → 0 fallos.
