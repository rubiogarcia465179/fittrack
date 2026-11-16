# The FitTrack kit: build another app to the same standard, from zero

This folder is a **portable manual**. Hand it, plus the few files listed
below, to an agent (Claude Code or similar) in an **empty repository**, and
that agent can build a different app autonomously and reach the same level
of quality as FitTrack. It needs no access to FitTrack and no memory of how
FitTrack was built.

FitTrack is an offline gym tracker (Expo / React Native + TypeScript, 4
languages, monochrome "X" style). It reached a 90/100 imagined Steve Jobs
score after ~20 phases and ~25 gated rounds. Everything that produced that
quality is written down here: the method, the gates, the engineering, the
design system and the mistakes.

## What to copy into the new repo

| Copy this | To | Why |
|---|---|---|
| `docs/kit/` (this folder) | `docs/kit/` | The manual |
| `docs/UX-PLAYBOOK.md` | `docs/UX-PLAYBOOK.md` | Design system, patterns, the "no" list, details checklist |
| `.claude/skills/stevejobs/SKILL.md` | same path | The quality gate (analyze / suggest / refine / ship…) |
| `.claude/commands/SteveJobs.md` | same path | `/SteveJobs <mode>` shortcut |
| `app/qa/shots/shoot.js`, `make-video.js`, `scenario.js` | `app/qa/shots/` | Screenshot + video harness (adapt `scenario.js`, seed data, storage keys) |
| `app/qa/async-storage-shim.js`, `status-bar-shim.js`, `app/metro.qa.config.js` | same paths | Only if the web export needs native shims |
| `.claude/skills/impeccable/`, `.claude/skills/accessibility/` | same paths | Optional: deeper UI and WCAG audits |

Then fill the templates in `docs/kit/templates/` and put them at the repo
root (`CLAUDE.md`, `SPEC.md`, `TASKS.md`, `PROGRESS.md`, `REQUIREMENTS.md`,
`AGENTS.md`).

## Read in this order

1. [`01-BOOTSTRAP.md`](01-BOOTSTRAP.md): the one prompt to start, the
   questions to ask the owner on day 1, and phase 0 (setup).
2. [`02-METHOD.md`](02-METHOD.md): how work is organized (phases, the 6
   docs, user requests, decisions, honesty, commits) and the quality loops
   (Jobs gate, UX reviewers, N-round polish loop).
3. [`03-ENGINEERING.md`](03-ENGINEERING.md): stack, structure, storage and
   migrations, backup, platform modules, i18n pipeline, tests, screenshot
   harness, native features, environment traps.
4. [`../UX-PLAYBOOK.md`](../UX-PLAYBOOK.md): principles, design tokens,
   components, interaction patterns, what was removed and why, the details
   checklist.
5. [`04-QUALITY-GATES.md`](04-QUALITY-GATES.md): every checklist in one
   place (pre-commit, screenshot review, Jobs gate, release).
6. [`05-LESSONS.md`](05-LESSONS.md): the real bugs and wrong turns, each with
   its root cause and the rule that prevents it. Read before writing code.
7. [`templates/`](templates/): ready-to-fill versions of the 6 docs, the
   reviewer brief and the loop log.

## The non-negotiables (if you read nothing else)

1. **One job per screen, one filled button per screen, max 3 tabs.**
2. **Nothing invented is shown as real.** "—" beats a guessed number; an
   example image is labelled; a quote has a source.
3. **Look at every screenshot before every commit.** Tests passing is not
   "it looks right".
4. **The Jobs gate must say YES before a commit.** On NO: fix, re-verify,
   re-gate.
5. **The 6 docs are always current**, so a fresh agent can continue with no
   context.
6. **No new dependency without the owner's approval.** Ask with the exact
   command.
7. **Every user message is logged** (R-xx), even if done later.
8. **Report the truth**: real numbers, real errors, what was not tested
   (e.g. "not tried on a phone").
