# 01 — Bootstrap: from an empty repo to phase 1

## 1. The one prompt (the owner pastes this; fill the brackets)

> Build **[APP NAME]**, an **[Expo / React Native + TypeScript]** app for
> **[WHO]** to **[THE ONE JOB, in one sentence]**.
>
> Follow `docs/kit/` and `docs/UX-PLAYBOOK.md` exactly: method, gates,
> engineering rules, design system, "no" list and checklists. Start with
> `docs/kit/01-BOOTSTRAP.md` §2 (ask me the day-1 questions), then phase 0.
>
> - Tabs (max 3, icons only): **[home/status]**, **[the core action]**,
>   **[profile/settings]**. Everything else opens from them.
> - Core loop: **[e.g. start → log → finish → see progress]**: ≤ 2 taps to
>   start, 1 to finish.
> - Languages: **[e.g. ES/EN/NL/FR]**, every string in all of them from day 1.
> - Data stays on the device (offline, private), with **backup to a file,
>   restore, and delete-all**.
> - Real data source: **[e.g. an open dataset + its licence]**. Nothing
>   invented shown as real.
> - Style: **[monochrome "X"-like dark theme + light inverse]** unless I say
>   otherwise.
> - No new dependency or `npm install` without asking me.
>
> Work in phases from `TASKS.md`. Commit only when a phase is complete and
> the Steve Jobs gate says YES, with screenshots, video and the 6 docs
> updated. Keep going phase after phase while the gate approves; stop and
> ask me only for items marked ⛔.

## 2. Day-1 questions (ask once, all together, then log the answers as R-01…)

Ask only what you cannot decide with a sensible default. Typical set:

1. **The one job**: "In one sentence, what must a user be able to do in
   10 seconds?" (This becomes the first screen.)
2. **Who**: beginner / expert / both? (Drives words, defaults, how much is
   folded away.)
3. **Platforms and device**: iPhone only? Android? Web version? Which phone
   will you test on, and when?
4. **Languages**: which ones; which is the default?
5. **Data**: where does real content come from (dataset, API, the user)?
   Licence and attribution?
6. **Accounts / cloud**: none (recommended for v1) or required?
7. **Look**: keep the kit's monochrome dark + light theme, or a brand
   colour? (One accent only.)
8. **Commit and branch rules**: commit at the end of each phase on `main`?
9. **Autonomy**: may the agent continue to the next phase on its own while
   the gate says YES?
10. **Hard noes**: anything the user never wants (ads, streaks, social,
    gamification…)?

Write the answers into `SPEC.md` (vision), `CLAUDE.md` (rules "forever")
and `REQUIREMENTS.md` (R-xx), then start phase 0.

## 3. Phase 0 — setup (one commit)

- [ ] `git init`, `main` branch, `.gitignore` (node_modules, dist, `.expo`,
      OS files).
- [ ] Copy the kit files (see `README.md`), fill the 6 templates.
- [ ] Create the app: `npx create-expo-app app --template blank-typescript`
      (ask before installing). Pin the SDK in `AGENTS.md`.
- [ ] Folder layout (see `03-ENGINEERING.md §2`): `data/`, `scripts/`,
      `i18n/`, `tests/`, `app/`, `docs/screenshots/`.
- [ ] `tests/run.js` with at least: i18n key parity across languages, data
      integrity, `tsc --noEmit`.
- [ ] Screenshot harness running on a hello-world screen: 1 PNG, 0 console
      errors. **Do this before any real UI.** It's the feedback loop for
      everything else.
- [ ] Theme tokens file (`theme.ts`) with the two palettes, the font, spacing
      and radius. No colour literals in screens, ever.
- [ ] `docs/screenshots/README.md` listing captures and how to regenerate.
- [ ] First Jobs gate on the plan (`/SteveJobs keynote`): if the app can't be
      said in one sentence and three bullets, fix the plan before coding.

## 4. Suggested phase order for a new app

| Phase | Content | Gate focus |
|---|---|---|
| 1 | Data model + storage + real content import (with licence) | Authenticity |
| 2 | The core loop end to end, ugly but working | It just works |
| 3 | Home (status + one primary action), first-launch and empty states | First impression |
| 4 | Profile/settings: language, theme, backup/restore, delete all | End-to-end |
| 5 | Design pass: tokens, one language end to end, icons drawn, 44 pt | Craft |
| 6 | i18n complete in every language, proofread | Craft |
| 7 | Review loop: 2 UX reviewers + Jobs gate, 5–10 rounds | All principles |
| 8 | "Cut" pass: `/SteveJobs cut`; remove what isn't core | Focus |
| 9 | Device test by the owner; fix what only the phone shows | Real artists ship |

Each phase ends with the full pre-commit gate (`04-QUALITY-GATES.md §1`).
