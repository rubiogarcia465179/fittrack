# 04 — Quality gates: every checklist in one place

Details behind each line: `../UX-PLAYBOOK.md §8` (screen details) and
`03-ENGINEERING.md` (how).

## 1. Before every commit (in this order)

1. `cd app && npx tsc --noEmit` → **0 errors**.
2. `node tests/run.js` → **0 failures** (record N/N).
3. `cd app && npx expo export --platform web --output-dir /tmp/app-dist` → OK.
4. Screenshots: `node app/qa/shots/shoot.js <dist> docs/screenshots --frames <framesDir>`
   → `errors none`. New UI state → new capture in `scenario.js`.
5. Video: `node app/qa/shots/make-video.js <framesDir> docs/screenshots/video.mp4`.
6. **Look at every changed capture** (and the contact sheets for the rest)
   with the checklist in §2. Fix → regenerate → look again.
7. `/SteveJobs analyze` → **YES**. On NO: fix, repeat from 1.
8. Update the 6 docs (+ screenshots README). Log the verdict and the real
   numbers in PROGRESS.
9. One commit with everything; message with the numbers.

If a step can't run, write the real error in PROGRESS and say it. Never
report it as passed.

## 2. Screenshot review (per capture)

- [ ] Nothing cut, overlapping, overflowing or truncated where the name matters.
- [ ] No tofu □, no emoji, no raw ISO date, no untranslated string, no data-English.
- [ ] Exactly one filled (primary) button, or none on settings screens.
- [ ] Contrast readable in both themes; green (or the one accent) only for its one meaning.
- [ ] Targets ≥ 44 pt (chips, small text actions, steppers).
- [ ] Matches SPEC's design language (no clock/battery drawn, same radius, same labels style).
- [ ] Empty / first-launch / long-text versions look cared for.
- [ ] The words are true in this state (no "you'll lose your sets" with none).
- [ ] Harness reported `errors none`.

## 3. New feature (before building)

- [ ] It makes the core loop better, or it doesn't ship (Focus).
- [ ] It doesn't duplicate something already on screen.
- [ ] Gate the **plan** with `/SteveJobs analyze` or `suggest`.
- [ ] Two UX reviewers on the plan (interaction + visual); verify their claims.
- [ ] Needs a dependency? → ⛔ ask with the exact command.
- [ ] Needs an assumption shown as a fact? → drop it or ask.
- [ ] Strings in every language; captures planned for every new state.

## 4. Data honesty

- [ ] No pre-filled values the user must measure ("—" until set).
- [ ] Derived numbers only from completed work.
- [ ] Destructive actions protect done work only, and confirm only when there's something to lose.
- [ ] Cancel discards (edit a copy, commit on confirm).
- [ ] Suggested numbers are physically possible (rounded to real steps).
- [ ] Example images labelled; quotes only with a verifiable source.
- [ ] Backup → restore round trip tested; delete-all clears everything.

## 5. Accessibility

- [ ] Every control has role + label (label contains the visible text).
- [ ] Adjustable controls (wheels, steppers) expose increment/decrement.
- [ ] Repeated buttons carry context ("Delete session, Sun 15 Nov").
- [ ] Containers with buttons inside are not `accessible` as one block.
- [ ] No live region that changes every second; toasts announced once.
- [ ] Dialogs: `accessibilityViewIsModal`, backdrop blocks and cancels, order "Cancel | Destructive".
- [ ] Tabular numbers for changing figures.

## 6. Release ("ship") checklist

- [ ] Tested on the real target device by the owner (list what was tried).
- [ ] First screen does its one job in ≤ 10 seconds for a new user.
- [ ] One design language end to end; both themes.
- [ ] Nothing fake; credits and licences present.
- [ ] Core flow ≤ 2 taps to start, 1 to finish.
- [ ] Backup/restore works on device (Files/iCloud on iOS, folder on Android).
- [ ] Notifications and permissions asked in context; app works if denied.
- [ ] Performance: no visible jank in the core loop on the device.
- [ ] Every ⛔ resolved or consciously accepted by the owner.
