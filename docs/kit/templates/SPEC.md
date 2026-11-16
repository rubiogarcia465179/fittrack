# SPEC — [APP NAME]

## 0. Vision
[One sentence: who, the one job, why it's better.]
- Keynote test: [one sentence] + [3 bullets].
- Non-goals (the "no" list for this app): [ads, streaks, social, …].

## 1. Design language
- Theme(s): [Night (default) / Day (inverse)]. Tokens in `app/src/theme.ts`.
- One accent: [white buttons with black text]; [green] only for [records].
- Font: [family]; big numbers bold tabular; titles 32–34 bold; section labels 12 caps.
- Tab bar: [3] tabs, icons only. No clock/battery drawn.
- One filled button per screen.

## 2. Screens
| Tab | Job (one sentence) | Primary action |
|---|---|---|
| [Home] | [status + next step] | [Start …] |
| [Core] | [do the thing] | [Finish] |
| [Profile] | [your data + settings] | [—] |

### [Screen name]
- Order of blocks, top to bottom: …
- Empty / first launch: …
- Folded: …

## 3. Data
- Content source: [dataset + licence]; fields: …
- Records persisted: `{ … }` (key `app.data.v1`).
- In-progress state: `app.active.v1`.
- Binary files: [where].
- Backup file: `{ app, version, exported_at, …, photos }`.

## 4. Languages
[LANGS]; default [X]; voice rules (e.g. French "tu").

## 5. Acceptance criteria
- Core loop ≤ 2 taps to start, 1 to finish.
- Works offline; backup/restore; delete-all.
- [Feature-specific criteria.]
