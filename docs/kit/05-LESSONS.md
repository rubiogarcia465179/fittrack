# 05 — Lessons: real mistakes and the rule each one taught

Every row happened in FitTrack. Read this before writing code. The rule
column is what to do from the first day.

## Data that was lost or wrong

| What happened | Root cause | Rule |
|---|---|---|
| Height history vanished after every app start | `migrate()` rebuilt the profile with only known fields | Spread the stored object first, override after; test that unknown fields survive |
| Sets done on a "postponed" exercise weren't saved | Save function only looked at the main list | Every place work can live (main list, parked list) feeds the save; test it |
| "Remove set" deleted a set the user had already done | Removed the last set, not the last *pending* one | Destructive actions touch pending work only; confirm when done work is involved |
| A forgotten "Finish" saved an 840-minute session | Duration taken from the clock without review | Clock-derived values are editable on the finish screen |
| Cancel on the start sheet still applied the changes | The sheet edited live state | Sheets edit a local copy; commit on confirm only |
| Delete-all left the profile on screen and the personal photo stored | Screen state not re-read; photo outside the data JSON | Delete-all clears every store and re-reads every screen |
| The web store's `active()` always returned null | `Object.assign(null, …)` in `read()` | Unit-test the store's read path on every platform port |
| A barbell squat was suggested with 0 kg | Dataset said equipment "other"; bodyweight detection trusted it | Classify load from name and text; never show 0 kg for a loaded lift ("—" instead) |
| Merged catalogue ids would have orphaned history | Ids removed from the dataset | Keep an old → new id map and remap on read (sessions, records, draft) |

## Things that looked fine in tests and broke on screen

| What happened | Root cause | Rule |
|---|---|---|
| Export and delete-all did nothing on web | `Alert.alert` is a no-op in react-native-web | Own `ConfirmDialog` overlay everywhere |
| A second sheet over a sheet froze on iOS | Chained `Modal`s | One absolute overlay inside the screen |
| Icons appeared as □ | Unicode arrows/checks not in the font | Draw icons (SVG/Views); no emoji or glyphs as icons |
| Two exercise names truncated to the same text | `numberOfLines={1}` on names that matter | Let important names wrap to 2 lines |
| A photo overflowed its card | Width from the window, not the card | Measure the container (`onLayout`) |
| A "Today" label stayed after today's workout was done | Label not tied to state | Labels must stay true in every state ("Today" → "Next") |
| VoiceOver couldn't reach "+15 s" and "Skip" | The rest block was `accessible` as one element | Never make a container with buttons `accessible` |
| A live region read the countdown every second | `accessibilityLiveRegion` on a ticking value | Announce events, not ticks |

## Effort spent on the wrong thing

| What happened | Rule |
|---|---|
| A rotatable 3D body was built (models, licences, WebGL in screenshots), then removed by the gate as "beautiful, not core" | Gate the **plan** before building; ask "does it make the core loop better?" |
| Five themes and national-flag themes, later cut to two | One design language; offer the minimum (dark + light) |
| A whole content phase ("why it's used" + athlete favourites) was rejected on its plan: it duplicated "what it trains" and was decoration | Check every new section against what's already on screen |
| A "plates per side" calculator assumed a 20 kg bar | Never present an assumption as a fact; drop or ask |
| The web version (a separate Astro site) fell behind the app for weeks | Ship the app's own web build (`expo export --platform web`) as the website: one codebase, parity by construction. FitTrack switched in Phase 19 |
| A doc claimed a dependency was installed when it was only transitive | Verify claims against `package.json`, not `node_modules` |

## Process lessons

- Contact sheets made reviewer rounds ~5× cheaper than single PNGs.
- Reviewers' best findings were bugs in saved data and accessibility, which
  screenshots can't show. Ask them to read the code paths too.
- When both reviewers propose the same change, it's nearly always right;
  take the smallest version.
- Changing seed data to make a screenshot look good hides bugs. Fix the
  product or log it.
- The score only rose steadily once the monotonic rule was enforced (any
  principle down → revert).
- Owners change their minds: an explicit request beats a reviewer and the
  gate, but the gate's objection is reported to the owner as a proposal.
- "Remove everything duplicated" was one of the highest-value requests: one
  name per thing, one view per item, one place per number.
- Ask permission for notifications at the first moment they help, not at
  launch: the owner never sees a cold permission prompt.
- Offline-first needs a backup from day 1: "no account, no cloud" without a
  backup means one lost phone erases everything.

## From the last polish loop (5 rounds, 86 → 90)

| Found | Rule |
|---|---|
| The first launch showed a tip, a call to action, an empty calendar and a row leading to an empty list | First launch = one step. Hide what has nothing to show yet; it appears with the first data |
| The same numbers in two orders ("2 sets · 14 min" vs "14 min · 2 sets") | Same facts, same order, everywhere |
| A generic header ("Session") while Home said "Back and arms" | Name the thing the user is doing, in the same words Home used |
| A list in dataset order (started with core exercises) | Unsearched lists are alphabetical in the chosen language; searched lists by relevance |
| One card mixing a text button and an outline button for equal actions | Equal actions, equal style |
| Judging only the changed screen gave 90; judging all 34 captures gave 86 | Run the loop on contact sheets of every screen, not just the diff |

## From the public-web loop (10 rounds, 68 → 86, Focus 10)

| Found | Rule |
|---|---|
| A generator picked "Bear Walk" first because ties were broken alphabetically | Never let alphabetical order decide content; rank by "what a beginner recognises" |
| Every row showed the same "3 × 10 · rest 90 s" | Say a repeated fact once, above the list |
| The layout jumped from one to two columns when the result appeared | Reserve the space from the start with a calm empty state |
| A bottom sheet stretched edge to edge on desktop | Bottom sheets on phones; centred cards (≈640 pt) on wide screens, backdrop full-screen |
| After creating, the form and the result competed on a phone | One thing at a time on small screens: fold the questions into a "Change" button |
| "Gym-free" sessions included machines and pull-up bars | Filter by what the user said they have; equipment is a hard constraint, not a hint |
| The same code served the full app and a one-screen web | One codebase, a build-time mode switch (`EXPO_PUBLIC_*`), separate screenshot scenario |
