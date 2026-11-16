# 02 — Method: how the work is run

Quality came less from talent than from a **closed loop**: small phase →
real screenshots → look → critique against fixed principles → fix → write
it down. This file is that loop.

## 1. Phases

- All work lives in `TASKS.md` as phases with checkboxes. A phase is
  **small enough to finish and verify in one sitting** (typically 3–8
  boxes).
- "Done" for a phase = every box `[x]`, or `⛔` with the reason (needs the
  owner, a dependency, a device). Never silently skipped.
- The top of `TASKS.md` has **"How to continue"**: the current state in 3
  lines and the next step. A fresh agent reads only that and knows what to do.
- When the owner asks for something mid-phase, finish or park the current
  step, log the request (§3), then continue in the order they asked.
- A phase can be **dropped** by the owner (e.g. after the gate says NO to
  its plan): mark it `✖ DROPPED (date, R-xx)` with the reason. Keep what was
  already built if it still serves the product.

## 2. The 6 living documents (update all of them before every commit)

| Doc | Holds | Updated when |
|---|---|---|
| `SPEC.md` | The product as the owner wants it **now**: vision, design language, every screen, data model | Product/design changed |
| `TASKS.md` | How to continue · phases in order · done · ⛔ blocked | Every commit |
| `PROGRESS.md` | Current state table · last verification with **real output** · decisions · blockers · dated log with Jobs verdicts | Every commit |
| `REQUIREMENTS.md` | Every owner request as `R-xx [STATUS] text (date; verification)` | Every new owner message |
| `AGENTS.md` | Environment, structure, commands, technical rules, approved dependencies | Tech changed |
| `CLAUDE.md` | Rules "forever" from the owner (commit rules, gates, language…) | Owner gives a permanent rule |

Plus `docs/screenshots/README.md` (list of captures) whenever captures
change. Templates: `templates/`.

Writing rules for these docs:
- Facts with numbers and dates (absolute dates, never "yesterday").
- Name files, functions and keys exactly (`lib/records.ts → effectiveRecords`),
  so the next agent can grep them.
- State what is **not** done or not verified.
- No duplicated truth: one doc owns each fact; others link to it.

## 3. Owner requests

- **Every** message with a request becomes an `R-xx` line immediately, even
  if it's done later: status `[EN CURSO]/[IN PROGRESS]`, `[DONE]`, `[⏸]`,
  `[⛔]`.
- Quote the owner's words in the PROGRESS log entry for the phase (short).
- An explicit owner request is never removed by a reviewer or by the gate.
  If the gate dislikes it, **propose** the change and mark it ⛔ for the owner.
- When the owner says "do X as Steve Jobs would", decide with the skill and
  the playbook, then report the decision in one line.

## 4. Decisions and blockers (⛔)

Mark ⛔ in TASKS, and ask, when the item needs:
- a new dependency or any `npm install` / `npm ci` (give the exact command);
- an owner product decision (removing something they asked for, adding a
  tab, changing the data source);
- a real device or an account the agent doesn't have;
- assets only the owner can make (photos, brand art).

Ask all open ⛔ questions **together**, briefly, with a recommended option
first. Never guess an answer and present it as decided.

## 5. Honesty rules (they are product rules too)

- Report real numbers: "tests 151/151, tsc 0, 34 captures, 0 console errors".
- If a step could not run, say so with the real error, and log it.
- "Not tested on a device" is said every time it's true.
- Never change demo/seed data to hide a product bug.
- Never claim a feature works on a platform you didn't run.

## 6. Commits

- Only at the end of a complete phase, on `main`, after the full gate
  (`04-QUALITY-GATES.md §1`). The owner may ask for an earlier commit; then
  do it and note it.
- One commit carries code + screenshots + video + docs together.
- Message (in the owner's language): what changed, why, and the real
  verification numbers and verdict. End with the attribution line the
  environment asks for.

## 7. The Steve Jobs gate (`.claude/skills/stevejobs`)

An **imagined** critique built only from Steve Jobs' public principles (the
skill lists the only quotes allowed, with sources). It's a lens, not an
impersonation.

- `analyze` → YES/NO to "would he ship this as an Apple product?", what
  he'd love (≤ 3), why NO (ranked, tied to principles), a 0–10 score for
  principles 1–9, and the 3 changes that flip the verdict.
- `suggest` → ≤ 7 ranked improvements, **removals first**, each with size.
- `refine [screen]` → acts: subtract → fold → merge → shorten → clarify →
  make it art → check hidden details → verify with screenshots + `analyze`.
  Never adds features, dependencies or screens.
- `cut`, `keynote`, `ship`, `review <screen>`: see the skill.

Rules:
- The gate **looks at the real screenshots**, never at memory. Regenerate
  first if they're stale.
- **NO = no commit.** Fix everything that blocks YES, re-run the whole gate.
- Judge against an agreed frame (FitTrack: "judge as a version 2.0; the
  current feature count is accepted; labelled example photos don't block").
  Write the frame in `CLAUDE.md` so it doesn't drift.
- Also gate **plans**: before building a phase, ask the gate about the plan.
  FitTrack dropped a whole phase (athlete quotes, "why it's used") this way:
  it duplicated an existing section and was decoration.
- Log every verdict with its reasons and score in PROGRESS.

## 8. Two UX reviewers (for every new feature, and in the loop)

Spawn two **read-only** subagents in parallel, one *interaction* (flow,
taps, feedback, defaults, edge cases, saved data, accessibility) and one
*visual/product* (hierarchy, type, spacing, copy, colour, what to remove).

Give both the same brief file (`templates/REVIEWER-BRIEF.md`): product,
fixed constraints, the owner's explicit requests (never to be removed),
reply format (≤ 3 suggestions: screen · exact change · principle · risk ·
size), the log of earlier rounds (so they don't repeat), and the weakest
principles from the last gate. "Nothing" is a valid answer.

Give them **contact sheets** (7 screenshots side by side per image) rather
than 30 PNGs: much cheaper, and they still open single PNGs for detail.

Then:
1. **Verify every claim in code** before acting. Reviewers find real bugs
   the screenshots can't show (data not saved, VoiceOver can't reach a
   button, a cancel that doesn't cancel).
2. **Accept only perfect suggestions.** Reject anything that contradicts
   SPEC or an owner request (→ ⛔ instead), hides a problem, needs an
   assumption shown as fact, adds a screen/dependency, or that only one
   reviewer wants and is big. When both propose the same thing, take the
   smallest version.
3. Log each suggestion: accepted / rejected + reason.

## 9. The N-round polish loop (how FitTrack went from 77 to 90)

Each round:
1. Regenerate all screenshots and contact sheets.
2. `/SteveJobs analyze` (score per principle) → `/SteveJobs suggest`.
3. Optionally the two reviewers (§8) with the weakest principles as focus.
4. Pick the suggestions that are small, certain and don't fight an owner
   request. Apply them.
5. Verify: tsc + tests + export + screenshots, **look at every changed
   capture**, add a capture for every new state.
6. `analyze` again. Write a row in the loop log (`templates/LOOP-LOG.md`):
   9 scores + total + what changed.
7. **Monotonic rule**: if any principle's score went down, revert the change
   that caused it.
8. Keep "state + next round" at the bottom of the loop log so any agent can
   resume mid-loop.

What a round typically fixes (from FitTrack's logs): a filled button that
should be an outline; a 40 pt target; a toast repeating what's on screen; a
counter that duplicates another; a French "vous" among "tu"; a dialog
claiming something false; a cancel that saved anyway; a label that stops
being true after the first use ("Today" → "Next"); text truncating to two
identical names.

## 10. Subagents

- Use them for parallel read-only review and broad searches, not for the
  main build (each starts cold and re-derives context).
- Give each a written brief file and the exact paths to look at.
- Their output is input, not truth: verify before applying.

## 11. Working with an owner who is not watching

- Keep going phase after phase while the gate says YES, if the owner allowed
  it. Stop for ⛔ items only.
- Send short progress notes (one line: what's done, what's next).
- End each work session with: what was committed (hashes), the verification
  numbers, the open ⛔ questions with a recommendation each.
