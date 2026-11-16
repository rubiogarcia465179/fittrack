# 03 — Engineering: the technical playbook

What FitTrack runs on, how it's organized, and the patterns that kept it
correct. Copy the patterns; adapt the names.

## 1. Stack (and why)

| Piece | Choice | Why |
|---|---|---|
| App | Expo (managed) + React Native + TypeScript, strict | One codebase for iOS, Android **and a web export used for screenshots** |
| Web export | `react-native-web` via `npx expo export --platform web` | The daily visual check runs in headless Chrome, no simulator needed — **and it is the website** (no second codebase) |
| i18n | `i18next` + `react-i18next`, flat JSON bundles embedded at build | Instant language switch, no network |
| Storage | `@react-native-async-storage/async-storage` (one JSON document) | Offline, private, simple; localStorage on web |
| Files | `expo-file-system` (photos, backup files) | Keeps big binaries out of AsyncStorage (Android's limit is small) |
| Notifications | `expo-notifications` (local only) | Timer alerts when the phone is locked |
| Haptics | `expo-haptics` + RN `Vibration` | Physical feedback at the moment of effort |
| Charts / icons | `react-native-svg` or plain `View`s | Drawn icons: no emoji or font glyphs (they render as "tofu" □) |
| Tests | One dependency-free `tests/run.js` | Runs anywhere with Node; transpiles TS with the app's `typescript` |
| Screenshots | Dependency-free Node script driving Chrome via the DevTools Protocol | No Puppeteer/Playwright install needed |

Install packages with `npx expo install <pkg>` (picks the SDK-compatible
version) and **only with owner approval**. Native modules that need a config
plugin go in `app.json → expo.plugins`; check with
`npx expo config --type prebuild`. Remember: Expo Go doesn't include every
native module (notifications need a development build on a real device).

## 2. Repository layout

```
data/        source of truth for content (JSON + images) + derived maps
scripts/     generators and sync scripts (data → app/ and web/ copies)
i18n/        <lang>.json flat bundles (source); mirrors are generated/copied
tests/       run.js (data + i18n + logic + store round-trips + tsc)
app/         Expo app (own package.json)
  App.tsx    navigation state, top-level handlers, toasts
  src/screens/     one file per screen
  src/components/  shared UI (sheets, dialogs, pickers, icons)
  src/lib/         pure logic + platform modules (X.ts / X.web.ts)
  src/store.ts     the only place that reads/writes persisted data
  src/theme.ts     tokens; theme-context.tsx gives `p` (palette)
  qa/shots/        screenshot + video harness
docs/        SPEC-adjacent docs, screenshots, kit
```

Rules: no `package.json` at root if there are several apps; code and
identifiers in English; docs in the owner's language.

## 3. State and storage

- **One store module** (`store.ts`) owns persistence: `read()`, `write()`,
  `migrate()`, and named operations (`addSession`, `updateSession`,
  `deleteSession`, `setProfile`, `clearAll`, `backupJson`, `restore`).
  Screens never touch AsyncStorage directly for core data.
- **`migrate()` runs on every read**: fills defaults, keeps unknown fields,
  remaps renamed ids. FitTrack once lost body-height history because
  `migrate()` rebuilt the profile with only known fields: **spread the old
  object first, then override**.
- **Renamed/merged content ids**: keep a generated map (`merged-ids.json` →
  `lib/merged-ids.ts`) and remap sessions, records and the in-progress draft
  on read. Never break old saved data.
- **Keys are versioned** (`app.data.v1`, `app.active.v1`), so a breaking
  change can migrate from the old key.
- **The in-progress activity** (draft, timers) is persisted on every change
  so a crash or a kill never loses work. Timers store absolute end times
  (`rest_until` in ms), never "seconds left".
- **Binary data** (photos): never inside the main JSON. Native = one file per
  photo (`<documents>/photos/<id>.jpg`); web = one localStorage key per
  photo. The record stores only ids. Migrate old storage lazily on first
  load (read old → write new → delete old; same id).
- **Delete-all means all**: data, photos, personal images, cached state,
  in-memory screen state (re-read after clearing).

## 4. Backup and restore (offline apps must have it)

- One file: `<app>-backup-YYYY-MM-DD.json` =
  `{ app, version, exported_at, ...data, photos: { id: dataURL }, home_photo? }`.
- `parseBackup(text)` validates **before anything is deleted**: right `app`,
  `version ≤ current`, arrays where arrays belong, entries with ids; accept
  older versions; reject newer ones.
- Restore = confirm dialog with what the file contains ("Backup from 16 Nov
  2026: 12 sessions. It replaces everything on this phone."), then
  delete-all, write, import photos with their ids, run `migrate()`.
- Saving: iOS → write to cache then RN `Share.share({ url })` (Save to Files,
  iCloud, AirDrop); Android → `Directory.pickDirectoryAsync()` (SAF) and
  `createFile`; web → Blob download. Picking: `File.pickFileAsync()` native,
  `<input type="file">` web. No extra packages beyond `expo-file-system`.
- Test the round trip in `tests/run.js` with stubbed storage (see §7).

## 5. Platform modules

When native and web differ, write `X.ts` (native) and `X.web.ts` (web) with
the **same exported API**. Metro picks the right one. FitTrack has
`pickPhoto`, `sessionPhotos`, `backupFile`, `restAlert`, `Gradient`.
`tsc` checks only `X.ts`; the web one is checked by the export and the
screenshots. Keep the web version honest: if a feature doesn't exist on web,
make it a no-op and say so in a comment, never a fake success.

Web-only traps found the hard way:
- `Alert.alert` does nothing on react-native-web: use your own
  `ConfirmDialog` (in-screen overlay) everywhere.
- Chained `Modal`s break on iOS: use one absolute overlay inside the screen
  for sheets on top of sheets.
- `Clipboard` may be unavailable: never rely on it as the only path.

## 6. i18n pipeline

- Flat keys, prefixed by screen (`sess_*`, `data_*`, `feed_*`). Plurals via
  two keys (`x_one`, `x_many`) and a `plural(n, t, one, many)` helper.
- Source bundles in `i18n/`; mirrors copied to the app (and web) by a
  script; tests assert **same key set in every language, no empty values,
  mirrors identical**.
- Every new string is added in **all languages at once** (a small script
  that takes `{key: {es, en, nl, fr}}` and writes every mirror, keeping key
  order).
- One voice per language (French all "tu"), units identical everywhere
  ("14 min"), no raw data strings (dataset English names, ISO dates) on
  screen: format dates with `toLocaleDateString(lang)`.
- Content (exercise names, steps) also per language, with a fallback, and
  a test for coverage.

## 7. Tests (`tests/run.js`, no framework)

Sections, each printing `ok`/`FAIL` lines and a final `N/N, 0 failures`:
1. **Data**: counts, required fields, enums, images exist, mirrors in sync.
2. **i18n**: key parity, non-empty, mirrors identical.
3. **Logic**: vectors for pure functions (TS transpiled with
   `ts.transpileModule`, then `new Function('module','exports','require', js)`).
4. **Parity**: same inputs → same outputs across app and web ports.
5. **Store round trips**: transpile `store.ts` with a `require` stub
   (in-memory AsyncStorage, fake photo store) and test backup → clear →
   restore, id migration, rejection of foreign/newer files.
6. **Typecheck**: run the app's `tsc --noEmit`, expect empty output.

Every bug fixed gets a vector here when it's logic (saved data, migration,
rounding, generator rules).

## 8. Screenshot + video harness (`app/qa/shots/`)

- `shoot.js <dist> <outDir> [--frames <dir>]`: serves the web export,
  launches headless Chrome (`--remote-debugging-port`), sets an iPhone-16
  viewport (393×852 @2x), and runs `scenario.js`.
- `scenario.js` gets helpers: `load(storage)` (clears and seeds
  localStorage, reloads), `shot(name)`, `tap(text)` (clicks the innermost
  **visible, actually-hittable** element with that exact text),
  `tapLabel(ariaLabel)`, `scrollBy(dy)`, `drag(label, dx, dy)`, `sleep`.
- Seed data lives in `shoot.js` (sessions, profile, active draft, a demo
  photo). Use real catalogue ids; when ids change, update the fixtures.
- Captures are numbered `NN-screen-state.png` in a stable order; the README
  lists them. Cover: first launch, empty, full, each sheet/dialog, error,
  light theme, each language at least once, long text.
- **Console errors and exceptions fail the run** (`errors none` expected).
- `--frames` saves a JPEG per screencast frame with its timestamp;
  `make-video.js` turns them into an MP4 with real timing (ffmpeg from a
  throwaway `pip install imageio-ffmpeg` venv; not a repo dependency).
- Contact sheets for reviewers: ffmpeg `hstack` of 7 captures per image.
- Unchanged screens produce **pixel-identical** PNGs; `git status` on
  `docs/screenshots` shows exactly what changed visually.

## 9. Native features: patterns that worked

- **Local notification for a timer**: schedule at the absolute end time
  with a DATE trigger; cancel and reschedule on every change (+15 s, skip,
  end); cancel when the activity ends; ask permission the **first time it's
  useful** (first rest), never at launch; suppress the banner while the app
  is in the foreground (the screen already shows it); Android channel with
  high importance + vibration pattern.
- **Haptics**: light tap on completing a unit of work, success on save, a
  clear double pulse when a timer ends. Web: `navigator.vibrate` if present.
- **Photos**: image picker with `base64` + quality ~0.6 and 4:3 crop; write
  to a file immediately; display by file URI; delete files with their record.

## 10. Environment traps (FitTrack ran on Windows + WSL)

- Run node/npm/tsc **inside WSL**; Windows node fails on UNC paths. Use
  Windows `node.exe` + Chrome only for the screenshot harness, passing the
  dist dir as a `\\wsl.localhost\...` path.
- From Git Bash, `/tmp/...` inside `wsl.exe sh -c` gets rewritten: set
  `MSYS_NO_PATHCONV=1`.
- WSL on ARM → the ffmpeg binary is `ffmpeg-linux-aarch64-*`.
- When patching files from scripts, use exact string replacement (Python
  `str.replace` / split-join), never regex replacement with `$` in the text.
  Assert the old text exists so a failed patch fails loudly.
- Keep generated files marked "generated, do not edit" with the generator's
  name.

## 11. Data rules

- Real content only, with licence + attribution stored per item
  (`source`, `license`, `credit`) and shown once (credits at the bottom of
  Profile).
- Locally written content (beginner steps, translations) is declared as such
  in the UI.
- Deduplicate the catalogue with a script (merge map, aliases kept, history
  migrated), never by hand.
- External APIs: own User-Agent, ≤ 2 req/s, exponential backoff on 429/503.
