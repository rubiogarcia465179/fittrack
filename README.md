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

Checklist en el móvil: 4 pestañas (Dashboard, Exercises, Session, History),
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
- iPhone y ordenador en la **misma Wi-Fi** (no red de invitados ni con
  aislamiento de clientes; VPN apagada).

### Opción A — Metro en Windows (recomendada, probada)
Por qué Windows y no WSL: WSL2 tiene una red interna (`172.x.x.x`) a la que
el iPhone no llega, así que Expo Go da *timeout* si Metro corre en WSL.
Con Metro en Windows, el QR apunta a la IP Wi-Fi del PC.

**Primera vez** (PowerShell):
1. Node.js LTS:
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
   Cierra y abre PowerShell (si no, `node` no se reconoce). Si `npm` falla
   con `npm.ps1 cannot be loaded because running scripts is disabled`:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
   (o usa `npm.cmd` / `npx.cmd`).
2. Copia del repo en el disco de Windows (Metro no funciona bien desde
   `\\wsl.localhost\...`):
   ```powershell
   git clone \\wsl.localhost\Ubuntu-24.04\home\<usuario>\fittrack C:\dev\fittrack
   cd C:\dev\fittrack\app
   npm ci
   ```
   Esta copia usa el repo de WSL como `origin`. Para traer cambios:
   `git -C C:\dev\fittrack pull` (y `npm ci` si cambió `package-lock.json`).
3. Sesión de la CLI de Expo:
   - Cuenta con contraseña: `npx expo login --no-browser` (sin
     `--no-browser` abre el navegador, y la sesión del navegador **no**
     llega a la terminal).
   - Cuenta de Google/GitHub (sin contraseña): crea un token en expo.dev →
     ajustes de la cuenta → **Access tokens**, y guárdalo para tu usuario:
     ```powershell
     [Environment]::SetEnvironmentVariable("EXPO_TOKEN", "<token>", "User")
     ```
     Reabre PowerShell. El token no se versiona ni se comparte.

   Comprueba con `npx expo whoami` (debe mostrar tu usuario, no
   `Not logged in`).
4. En el iPhone: Expo Go → iniciar sesión con la **misma** cuenta.

**Cada vez:**
1. IP Wi-Fi del PC: `ipconfig` → adaptador Wi-Fi → IPv4
   (p. ej. `192.168.1.20`).
2. Arranca Metro fijando esa IP (si no, Expo puede elegir la de una VPN o
   la de WSL y el iPhone no llega):
   ```powershell
   cd C:\dev\fittrack\app
   $env:REACT_NATIVE_PACKAGER_HOSTNAME = "<IP-WiFi>"
   npx expo start --clear
   ```
   La primera vez Windows pregunta por el firewall para Node.js:
   **Permitir acceso**. Si no salió el aviso, en PowerShell como
   administrador (Wi-Fi de casa marcada como red privada):
   ```powershell
   Set-NetConnectionProfile -InterfaceAlias WiFi -NetworkCategory Private
   New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private
   ```
3. Comprueba la red desde el iPhone: Safari →
   `http://<IP-WiFi>:8081/status` → debe responder `packager-status:running`.
   Si no carga, el problema es la red/firewall, no la app.
4. Escanea el QR de la terminal con la cámara del iPhone → se abre en
   Expo Go.

**Publicar cambios hechos en `C:\dev\fittrack`:** Windows no tiene la clave
SSH de GitHub. Haz el commit en la copia de Windows y publica desde WSL:
```bash
cd ~/fittrack
git pull /mnt/c/dev/fittrack main
git push
```

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

### Problemas frecuentes
| Mensaje | Causa | Solución |
|---|---|---|
| `Request timed out` / `Could not connect to the server` | El iPhone no llega a Metro: IP de WSL (`172.x`) o de VPN (`10.x`), firewall, o distinta Wi-Fi | `REACT_NATIVE_PACKAGER_HOSTNAME`, firewall, prueba `/status` en Safari |
| `Project is incompatible with this version of Expo Go` | SDK del proyecto ≠ SDK de Expo Go | Subir la SDK; `npx expo install --check` |
| `You need to be signed in to Expo Go and Expo CLI` | CLI sin sesión | `npx expo login --no-browser` o `EXPO_TOKEN` |
| `signed in to Expo CLI as "…", but not signed in to Expo Go` | Expo Go sin sesión | Iniciar sesión en Expo Go con la misma cuenta |
| `Unable to resolve "react-native/asset-registry"` | `node_modules` desfasado respecto a `package.json` | `npm ci` |
| `node`/`npm` no se reconoce tras instalar | PATH antiguo en la ventana abierta | Reabrir PowerShell |
| `npm.ps1 cannot be loaded` | Política de ejecución de PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` o `npm.cmd` |

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

Mismo checklist que Android: 4 pestañas, cambio de idioma instantáneo,
crear sesión, borrar del historial, persistencia al reabrir (AsyncStorage).

## Tests
```bash
node tests/run.js        # integridad de datos + lógica + i18n + paridad
cd app && npm run typecheck && npm run bundle:check
cd web  && npm run build
```
`tests/run.js` → 0 fallos.
