# UX Playbook: build an app with the same UX as FitTrack

This file is meant to be **pasted into a new project**, or referenced from it,
so that **one prompt** produces an app with the same UX qualities as
FitTrack: simple, monochrome, honest, one action at a time, verified with
real screenshots and a "Steve Jobs" gate.

It contains:
1. The **one prompt** to copy.
2. The **principles** (the "why").
3. The **design system** (tokens and components).
4. The **interaction patterns** that worked, with the reason for each.
5. **What we removed and why** (the "no" list).
6. The **process** (screenshots, reviews, gate, docs) and the files to copy.

---

## 1. The one prompt (copy, fill in the brackets)

> Build **[APP NAME]**, a [platform: Expo / React Native + TypeScript] app
> for **[WHO]** to **[THE ONE JOB]**. Follow `docs/UX-PLAYBOOK.md` exactly:
> its principles, design system, interaction patterns, "no" list and process.
>
> - Main screens (max 3 tabs, icons only): **[Tab 1: home/status]**, **[Tab 2:
>   the core action]**, **[Tab 3: profile/settings]**. Everything else is
>   reached from them (rows with chevron, sheets), never a 4th tab.
> - The core loop is: **[e.g. start → log → finish → see progress]**. It must
>   take ≤ 2 taps to start and 1 tap to finish.
> - Languages: **[e.g. ES/EN/NL/FR]**, every string in all of them from day 1.
> - Data stays on the device (offline, private, export JSON, delete all).
> - Nothing invented is shown as real: no fake numbers, no fake photos (or
>   labelled "Example image"), no quotes without a source.
> - No new dependency without asking me.
>
> Work in phases. At the end of each phase: type-check + tests = 0 errors,
> regenerate screenshots of every screen and state (empty, first launch,
> full, error, light theme, each language), **look at every screenshot**,
> run the "Steve Jobs" review (`analyze`, then `refine` at least 3 times
> until the verdict is YES), have two UX reviewers (interaction + visual)
> critique any new feature before building it, and update
> SPEC / TASKS / PROGRESS / REQUIREMENTS / AGENTS / CLAUDE docs so another
> agent can continue without context. Only then commit.

Copy these files into the new repo with the prompt (see §6):
`docs/UX-PLAYBOOK.md`, `.claude/skills/stevejobs/SKILL.md`,
`.claude/commands/SteveJobs.md`, `CLAUDE.md` (as a template) and the
screenshot harness `app/qa/shots/` (adapt `scenario.js`).

---

## 2. Principles (the lens for every decision)

1. **One job per screen.** If you can't write it in one sentence, the screen
   is wrong.
2. **One primary action per screen.** It is the only filled (white) button.
   Everything else is outline, text, or folded.
3. **Subtract before adding.** Order: remove → fold ("Más opciones",
   "¿Qué es esto?") → merge → shorten labels. A feature must make the core
   loop better, or it doesn't ship.
4. **Defaults that are right.** Never ask what the app can know: date = today,
   duration = elapsed time, body data = last entry, last choices remembered.
5. **Honest data (golden rule).** Show "—" rather than a guessed number.
   Derived numbers only from real inputs (e.g. 1RM only from *completed*
   sets). Example images are labelled as such.
6. **Feedback at the moment of effort.** Small, immediate, physical (haptic),
   and never decorative (no confetti, no streak guilt).
7. **One design language end to end.** Same colors, radius, spacing, type,
   marks and words everywhere. One meaning per mark (green = record, always).
8. **Craft where nobody looks.** Empty state, first launch, error, long names,
   4 languages, both themes, 44 pt targets, VoiceOver labels.
9. **The real device decides.** Web screenshots are the daily check; the phone
   is the final judge (log what's pending on device).

---

## 3. Design system

### Tokens (dark theme "Noche" is the default)
| Token | Value | Use |
|---|---|---|
| bg | `#000` pure black | screen background |
| text | `#FFF` | primary text, filled buttons |
| secondary | grey ~60 % | captions, meta, labels |
| border | hairline grey | separators, outlines, card borders |
| card / fieldBg | near-black greys | cards, value boxes |
| onAccent | `#000` | text on white buttons |
| record | `#00E676` with **black** text | the ONLY color: records / achievements |
| danger | red | only destructive confirmations |

- **Light theme "Día"**: the inverse (white bg, black buttons with white
  text). Only two themes.
- **No clock, no battery** drawn in the UI. No orange, no gradients as
  decoration (a subtle background gradient is fine).
- Type: one family (Montserrat). Big numbers bold with tabular figures;
  titles 32–34 bold; labels 12–13 uppercase tracking for section headers.
- Radius: pill buttons (full), cards ~16–20, value boxes ~12.
- Spacing: 16 pt side gutter, 8-pt rhythm.
- Icons: line icons drawn in SVG; **no emoji, no tofu-risk glyphs** (avoid
  "↑", "✓" as text; draw them).

### Components (what each one is for)
- **Primary button**: full-width white pill, black bold text. One per
  screen. Its label can be the value itself ("50 kg", "1,78 m").
- **Secondary button**: outline pill (border + text color), e.g. "Finalizar"
  next to "Siguiente ejercicio", "+ Registrar".
- **Text action**: bold text, ≥ 44 pt tall, e.g. "+ Añadir serie",
  "Mantener 50 kg", "Ver todo".
- **Chip group**: pills, selected = white filled; for 2–6 choices.
- **Card**: subtle border, section label in small caps, content, optional
  folded "¿Qué es esto?".
- **Row with chevron**: title + grey subtitle; opens a sub-screen with a
  "‹ Back" bar.
- **Bottom sheet** (overlay inside the screen, not a chained Modal on iOS):
  handle, title, ×, content, primary button at the bottom.
- **Wheel picker** (iPhone-alarm style) for every number: snapping wheel,
  centered band, value + unit; "Escribir" switches to the keyboard for big
  numbers; optional unit switch (cm / m). **No "Usar" button**: the white
  button shows the value and confirms.
- **Value box**: tappable number in a grey box; a completed one gets a light
  outline (not a solid white block).
- **Done circle**: outline circle → white filled with a black check.
- **Record mark**: green circle with black number/date (calendar day, set
  number), green dot in lists. Never green text on white.
- **Tab bar**: full width, black, hairline on top, icons only (names in
  accessibility labels), 3 tabs max.

---

## 4. Interaction patterns that worked (and why)

| Pattern | Why |
|---|---|
| **"Hoy toca" + "Cambiar"** on Home: a proposal, one tap to accept, one to change | Removes the "what do I do today?" decision without removing control |
| **Start sheet** (duration · intensity · energy · goal) remembers last choice | The only questions asked, asked once, before starting |
| **Only the current item is a full card**; the rest are one-line rows | Focus; the list stays scannable |
| **Auto-complete**: a set is done as soon as reps + weight are set | Fewer taps; the ✓ is enabled only when the set is complete |
| **Copy forward**: setting a weight copies it to the following pending sets | One wheel instead of four on the first session |
| **"—" when there is no data**, never a guessed weight | Honesty; the user fills it once and the app learns |
| **Progressive overload**: last time all reps done → +2.5 kg, shown as one grey line with "Mantener X kg" | Turns history into guidance, explainable, reversible in one tap |
| **Live record**: green set number + "Récord · 1RM ≈" + one haptic | Reward at the moment of effort, minimal pixels |
| **Finish = summary + one rating + one button** ("15 min · 2 series · 1 récord") | Closes the loop with real data; the proud moment exists |
| **Only completed work is saved**; nothing completed → offer to discard | History and records stay true |
| **Rest timer in the fixed footer** (+15 s, Saltar, vibration at the end) | Visible without scrolling; survives tab changes |
| **Folded rare things** ("Más opciones", "¿Qué es esto?", "Licencias y créditos") | Present but silent |
| **First launch**: one empty card with one action ("Establecer marcas") | The first 10 seconds have one obvious step |
| **Settings in 4 cards max** (Body · About you · Appearance · Data) | Profile stays one scroll |
| **Credits once, at the bottom of Profile** | Attribution without noise on every screen |

---

## 5. The "no" list (removed on purpose, keep it removed)

- A 3D body / heat map on Home (beautiful, not core) → kept on a branch.
- More than 3 tabs; a setup wizard; streaks; volume totals; activity
  histograms; 5 themes (only Noche/Día).
- Two buttons where one does it ("Guardar sesión" + "Finalizar sin valorar"
  → "Finalizar"); "Usar" in pickers; a "Detalles" form at the end (auto).
- Obvious subtitles under titles ("Todas tus sesiones…", "Datos estables…").
- Position counters that collide with other counters ("1/3" next to "2/4").
- Asking twice (energy asked at start, not again at the end).
- Assumptions shown as facts (e.g. "plates per side" assumes a 20 kg bar).
- Charts with fewer than 3 points.

---

## 6. Process (how the quality is enforced)

1. **Docs that let any agent continue**: `SPEC.md` (vision + screens),
   `TASKS.md` ("Cómo continuar", phases, ⛔ for user decisions),
   `PROGRESS.md` (real state, last verification output, log + verdicts),
   `REQUIREMENTS.md` (every user request as R-xx with status),
   `AGENTS.md` (environment, commands, technical rules), `CLAUDE.md`
   (rules for every session).
2. **Screenshot harness** (`app/qa/shots/`): headless Chrome over the web
   export, iPhone-16 viewport, a scripted `scenario.js` that taps through
   every screen and state (seeded data, first launch, light theme, each
   language), writes `NN-name.png` + an MP4 walkthrough, and fails on any
   console error. Add steps whenever the UI changes.
3. **Look at every screenshot**: nothing cut/overlapping, no tofu/emoji, one
   primary action, contrast, ≥ 44 pt, matches the design system.
4. **Feature proposals → two UX reviewers** (one interaction, one
   visual/product), read-only, with screenshots and constraints. Apply
   their consensus; where they disagree, the SPEC and the user's explicit
   decisions win. Drop anything that needs an assumption shown as fact.
5. **"Steve Jobs" gate** (`.claude/skills/stevejobs`): `analyze` gives a
   YES/NO verdict with scores per principle; `refine` acts (subtract →
   clarify → make it art → check hidden details → verify). Iterate ≥ 3
   times; never commit on NO. Log the verdict in PROGRESS.
6. **Commit rule**: only at the end of a phase, with type-check, tests,
   web export, screenshots, video, visual review, Jobs YES and the 6 docs
   updated — all in one commit with the real numbers in the message.
7. **Constraints that saved time**: no native modules missing from Expo Go;
   no chained Modals on iOS (use in-screen overlays); i18n in all languages
   for every new string; patch files with exact split/join (never regex
   replacement with `$` in the text).
