# CLAUDE.md — rules for every session

Applies to every session and every agent that receives this repo.

## 0. If you just arrived
1. Read `SPEC.md` (what the owner wants).
2. Read `TASKS.md` → "How to continue", and work in its order.
3. Read `PROGRESS.md` (real state, last verification) and look at `docs/screenshots/`.
4. `AGENTS.md` has environment, structure and commands.
5. Anything marked ⛔ needs the owner: ask.
6. `docs/UX-PLAYBOOK.md` and `docs/kit/` are the design and method standards.

## 1. When to commit
- Only at the end of a complete phase of `TASKS.md` (all boxes `[x]` or ⛔ with
  reason) **and** with the Steve Jobs gate at **YES**. If the owner asks for an
  earlier commit, do it and note it.
- Always on `main`. Message in [LANGUAGE]: what, why, real verification numbers.

## 2. Before EVERY commit (in order)
1. `cd app && npx tsc --noEmit` = 0 errors; `node tests/run.js` = 0 failures.
2. `npx expo export --platform web --output-dir /tmp/app-dist`.
3. Regenerate screenshots + video with `app/qa/shots/` (new UI → new steps in `scenario.js`).
4. Look at **every** capture (checklist: `docs/kit/04-QUALITY-GATES.md §2`).
5. `/SteveJobs analyze` → YES. NO → fix and repeat 1–5. Frame: [e.g. "judge as version 1.0 / 2.0"; what doesn't block].
6. Update SPEC / TASKS / PROGRESS / REQUIREMENTS / AGENTS / CLAUDE (+ screenshots README).
7. One commit with code, captures, video and docs.
If a step can't run, write the real error in PROGRESS and say so.

## 3. Always
- No new dependency and no `npm install`/`npm ci` without approval.
- Every new string in all languages ([LANGS]) and all mirrors.
- Golden data rule: nothing invented shown as real; quotes only with a verifiable source.
- Owner messages mid-task are logged in REQUIREMENTS/TASKS even if done later.
- [Environment rules, e.g. "run node inside WSL".]
