# Español con Tortuga — Project Brief (for a new Cowork project)

**Where it lives:** its own folder, separate from the DMV guide.
Site path: `sawyertobin.com/espanol/` (the folder's `index.html`). Upload the whole `espanol/` folder to the repo root.

```
(repo root)
  index.html          arcade home (has a card linking to espanol/)
  dmv.html            Dad's DMV guide  (frozen: bug fixes only)
  favicon.ico, apple-touch-icon.png, ...   JT duck icons (used by the DMV guide and as the site-wide fallback)
  espanol/
    index.html        this app
    favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png   turtle icons
    turtle_icon.svg   icon source
    word_list.txt     editable word bank (also embedded in index.html)
    PROJECT_BRIEF_Espanol_con_Tortuga.md   this file (optional to upload)
```

**Separation rules**
- Saved data: this app uses `tobin_espanol_v1`; the DMV guide uses `jt_dmv_study_progress_v1`. Never share a key.
- Icons: this app links its own turtle icons by relative path, so home-screen saves show the turtle, not the duck.
- Code: each game stays a self-contained file for now. Bug fixes in shared quiz behavior (spotlight, page curl, mastery logic) must be applied to both files until/unless the quiz logic is extracted into a shared script.

## 1. Goal
A mobile/tablet-first (desktop-friendly) Spanish vocabulary quiz for a K–4 learner in a DLI (dual-language immersion) program.
The card shows a **Spanish word**; the learner picks the **English meaning** from 4 options. Hear-it button on every card (tap to hear, no autoplay).

## 2. What's already built (v1, playable): `index.html`
- 713 words, Grades K–4, 19 topics (each grade shows only the topics that have words at that grade).
- Flow: Home → Pick a Grade → Pick a Topic → Study cards.
- Verbs shown in the **gerund** (hablando); the card shows the infinitive and a 5-row conjugation block (yo / tú / él-ella-usted / nosotros / ellos-ellas-ustedes).
- Spanish praise breaks every 15 cards, with English underneath and a Hear-it button.
- Tiered turtle dances (see §6) and a topic-complete "turtle disco" that gets bigger by grade.
- Progress saved on the device (localStorage key `tobin_espanol_v1`), per-word stable IDs.

## 3. Reused from the DMV study guide (keep these behaviors)
- Single self-contained HTML file; no build tools; only Google Fonts externally.
- A card is **mastered after 2 correct answers in a row**; a miss resets the streak.
- "Hide known cards" is on by default; subtle toggle at the bottom; confirm popup before showing all.
- Missed cards come back 2–4 cards later.
- After **2 misses in a row**, the card drops to **2 choices** until answered correctly.
- Correct first time: quick green ✅ (0.25s). Mastered: dancing-turtle celebration (0.9s). Topic 100%: party screen.
- Wrong answer: correct option pulses and everything else dims; auto-advances after 3s, or tap anywhere to continue.
- Slow page-curl card entrance (1.3s, precomputed ease-out keyframes with `linear` timing).
- Plain verb-based button labels ("Start Learning", "Continue", "Cancel", "Reset Progress").
- Subtle "Reset all progress" link at the bottom of Home, with confirmation.
- Content-hash IDs: a word's ID comes from grade + topic + Spanish text, so adding/cutting words never scrambles saved progress. (Editing the English translation keeps progress; changing the Spanish word, topic, or grade makes it a new card.)

## 4. Content rules
- **Dialect:** Latin American / Mexican Spanish first (carro, computadora, jugo, durazno, pizarrón, básquetbol, boleto, mesero, cobija, clóset, tenis). Where Spain differs and is very common, show a small gray note on the card ("Spain: el coche").
- Nouns include the article (el/la/los/las) so gender is learned with the word.
- Adjectives shown as masculine/feminine pairs (enojado/a). Invariable ones stay single (feliz, amable).
- Each grade targets roughly what a DLI student at that grade should recognize; **4th grade is the ceiling** (K 99 · 1st 110 · 2nd 189 · 3rd 170 · 4th 145 words).
- Topics: School, Family, Body, Animals, Dining and Food, At Home, Around Town, Transportation, Activities, Sports, Clothes, Weather & Seasons, Days/Months/Time, Numbers & Math, Colors & Shapes, Feelings & Traits, Jobs & People, Nature & Earth, Verbs.
- Verbs: 10 per grade (50 total), gerund as the prompt, English as "-ing" (talking, eating). Where English is ambiguous, qualify it (ser = "being (who/what)", estar = "being (how/where)", saber = "knowing (a fact)").
- Distractors come from the same topic and grade first, never duplicate the answer text, and verbs only get verb distractors.

## 5. Praise messages (Spanish first, English below)
12 messages now (effort, focus, bravery, "mistakes help you learn", turtle sayings). Keep them gender-neutral (no "orgulloso/concentrado" about the learner). Add more by appending to the `PRAISE` list.

## 6. Turtle dances by grade
The 7 moves come from Turtle Time Writing (spin, flip, stretch, hop, wiggle, roll, moonwalk). Not yet verified: whether Turtle Time Trainer has additional moves worth borrowing.

| Grade | Dances used | Topic-complete disco |
|---|---|---|
| K | wiggle, hop | 7 turtles |
| 1st | hop, spin | 11 turtles |
| 2nd | spin, roll | 15 turtles |
| 3rd | roll, flip, stretch | 19 turtles |
| 4th | flip, stretch, moonwalk | 23 turtles |

## 7. Technical lessons to carry over (from the DMV build)
- Allow pinch/text zoom (never `maximum-scale=1`); test at 160–220%.
- iOS Safari/desktop Safari: avoid SVG arcs, open multi-segment strokes, rotated text, and CSS `drop-shadow` on SVG. Prefer emoji or filled shapes.
- A `perspective`/`transform` ancestor shrinks `position:fixed` overlays to that ancestor. Put full-screen overlays outside it, and watch stacking contexts (`z-index` on a wrapper traps children).
- Test on iPhone Safari and Mac Safari, not just Chromium.
- Hosting is GitHub Pages: upload the file(s) to the repo root.

## 8. Ideas for v2 (not built)
- Reverse mode (English → Spanish) and a mixed-grade review.
- A 40-card "check-up" per grade, like the DMV mock exam.
- Sentence cards ("Yo estoy ___ el libro") for 3rd–4th grade.
- Optional name entry so praise can use the learner's name.
- Separate profiles if Ysa uses it too.
- (Done) Turtle icon set for the home screen and browser tab.

## 9. Open questions
- Which DLI curriculum or word list should the grade assignments be checked against?
- Does the learner's school teach "vosotros"? (v1 omits it.)
- Should "Spain:" notes be hidden by default?
- Should Turtle Time Trainer's dances be pulled in once its source is located?

## 10. Kickoff prompt for the new Cowork project
> Read this brief, open `index.html`, and keep the behaviors in §3 intact. First task: review the 713-word list in the `RAW` block for accuracy (Mexican Spanish, grade-appropriate), flag anything doubtful, and propose additions per grade without exceeding 4th-grade level. Make no layout changes before the content review.
