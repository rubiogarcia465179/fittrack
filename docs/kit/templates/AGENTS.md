# AGENTS.md — technical rules for [APP NAME]

- What to build: `SPEC.md`. What's left: `TASKS.md`. What was done: `PROGRESS.md`.
- Docs and commits in [LANGUAGE]; code and identifiers in English.

## 1. Structure
```
data/ scripts/ i18n/ tests/ app/ docs/
```

## 2. Product and design rules (in code)
- Navigation: tabs = `[…]` in `App.tsx`; other screens open from rows with a back bar.
- Single sources of truth: [e.g. `lib/records.ts` for records — never compute in a screen].
- Colours only from `p.*` (theme context); never literals.
- Strings only through i18n; dates through the formatter.
- Icons drawn; no emoji/glyphs.

## 3. Data rules
- Golden rule; licence/attribution per item; locally written content declared.
- After touching `data/` or `i18n/`: [sync command] then `node tests/run.js`.

## 4. Environment and dependencies
- SDK: [Expo X / RN Y]. Approved dependencies: [list with date].
- Platform modules: `X.ts` + `X.web.ts` with the same API: [list].
- [OS / WSL / path notes.]

## 5. Verification before saying "done"
| What | Command | Target |
|---|---|---|
| Types | `cd app && npx tsc --noEmit` | 0 errors |
| Tests | `node tests/run.js` | 0 failures |
| Web export | `cd app && npx expo export --platform web` | OK |
| Visual | `app/qa/shots/shoot.js` | captures reviewed, errors none |
| Video | `app/qa/shots/make-video.js` | regenerated |
