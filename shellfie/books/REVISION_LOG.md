# Shellfie story revision log

Record each future story or quiz change here, including book ID and title, date, version or commit, source/edition, location, what changed, why, the specific Shellfie guidance or external standard used, reviewer/approval, and tests. Link the original and replacement or a version-controlled patch. If the change affects a source-derived book, record the adaptation in its credit and apply the change in the authoritative build source as well as published JSON. Do not claim this log reconstructs changes before it was created; use Git history and book credits for earlier work.

## en-1-365-bedtime — 365 Bedtime Stories

- **2026-11-07; chapter 45, pages 3, 4, 6; public-domain source Mary Graham Bonner (1923), Project Gutenberg #69225.** Replaced repeated descriptions of St. Valentine's execution with non-graphic descriptions of punishment, death and remembrance. User approved P-001. Reason: [Shellfie K–1 and all-grade content guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance), avoiding graphic violence while handling death sensitively. Credit notes adaptation. Exact before/after text and rationale: [P-001](../tests/content_review_2026-11-07.md#p-001--first-grade-st-valentines-day) and `tools/approved_adaptations.py`; regression tests: `tests/test_approved_adaptations.py`.

## en-4-ali-baba — Ali Baba and the Forty Thieves

- **2026-11-07; chapter 1, page 10 and quiz 2; public-domain Andrew Lang edition, Project Gutenberg #503.** Changed the guide's execution to dismissal and replaced a violent quiz distractor. User approved P-002. Reason: [Shellfie all-grade content and quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Credit notes adaptation. Exact changes: [P-002](../tests/content_review_2026-11-07.md#p-002--fourth-grade-ali-baba) and `tools/approved_adaptations.py`.
- **2026-11-07; chapter 1, pages 6, 8–9, 14–16, 20–21.** Replaced the mutilation, body-sewing, boiling-oil killings and final stabbing with a burial, capture and escape; adjusted connected plot details. User approved P-003. This materially changes the original plot. Reason: [Shellfie all-grade and grade 4–5 guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance), avoiding graphic violence while reviewing other non-graphic threats in context. Exact changes: [P-003](../tests/content_review_2026-11-07.md#p-003--additional-ali-baba-scenes-proposed-for-approval) and `tools/ali_baba_approved_edits.json`. Existing quiz answers and evidence were checked against the adapted chapter; regression tests: `tests/test_approved_adaptations.py`. Threats, a non-graphic death, enslavement and the marriage remain and need contextual review; this is not a full school-suitability sign-off.

## en-k-three-billy-goats-gruff — The Three Billy Goats Gruff

- **2026-11-07; new kindergarten adaptation.** Wrote a short original school-friendly adaptation of a traditional Norwegian folktale, using [Popular Tales from the Norse, translated by George Webbe Dasent (1859), Project Gutenberg #8933](https://www.gutenberg.org/ebooks/8933), as the documented public-domain reference. Replaced threats of eating and graphic injury with bridge-sharing and cooperation; credit labels the work as an adaptation. Reason: [Shellfie K–1 and all-grade guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Source: `tools/authored/queue_codex.js`; quiz, grade/page checks and catalog consistency: `tests/test_queue_books.py`. Grade is provisional, awaiting educator review.

## en-1-stone-soup — Stone Soup

- **2026-11-07; new first-grade original retelling.** Wrote a short adaptation of the traditional shared-meal folktale with a make-believe stone and actual food ingredients; the credit explicitly says not to put stones in food. Reason: [Shellfie grade 1, reader/task and safety guidance](../standards/grade-placement.md). Source: `tools/authored/queue_codex.js`; quiz, grade/page checks and catalog consistency: `tests/test_queue_books.py`. Grade is provisional, awaiting educator review.

## en-k-bryant-the-gingerbread-man — The Gingerbread Man

- **2026-11-07; entire story and quiz; public-domain Sara Cone Bryant edition, Project Gutenberg #473.** Reviewed the full two-part original and its quiz. Removed the author-facing preface and replaced the long, repeated chase and piece-by-piece ending with a 13-page gentle adaptation in which the fox safely helps the gingerbread boy. Replaced the generated quiz with three story-supported questions and disclosed the shortened, changed ending in the credit. Retained the existing K assignment provisionally: short clear sentences, familiar sequence, basic character and event questions, and a reassuring outcome fit the [Shellfie K and all-grade guidance](../standards/grade-placement.md); a qualified educator has not reviewed it. Exact replacement is in `tools/gingerbread_adaptation.json`, applied by `tools/approved_adaptations.py`; original remains in Git history. The previously generated quiz included a sequencing question whose answer was not reliably first, so it was replaced rather than carried forward.

## en-1-tortoise-hare — The Tortoise and the Hare

- **2026-11-07; entire story and quiz; public-domain The Aesop for Children (1919), Project Gutenberg #19994.** After reading the previous full text and quiz, selected the existing Shellfie retelling in `tools/authored/retellings.js` instead of the longer, more archaic public-domain wording. The shorter version keeps the race and lesson, is labeled as a retelling and retains the source credit; its quiz asks supported character, event and vocabulary questions. Reason: [Shellfie grade 1 reader/task guidance](../standards/grade-placement.md#grade-placement-and-age-suitability-k5) and California RL.1–3/10; grade 1 remains provisional. `build_library.py` now selects this retelling on rebuild. Educator review remains open.

## en-1-lion-mouse — The Lion and the Mouse

- **2026-11-07; entire story and quiz; public-domain The Aesop for Children (1919), Project Gutenberg #19994.** After reading the prior full text and quiz, selected the existing Shellfie retelling in `tools/authored/retellings.js`, with the lion placing a paw beside the mouse rather than threatening to eat or kill her. The net, rescue and kindness lesson remain; the source credit identifies the material as a shortened adaptation. Reason: [Shellfie K–1 content and grade 1 reader/task guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance); grade 1 remains provisional. `build_library.py` now selects this retelling on rebuild. Educator review remains open.

## en-k-be-firefighter — Be a Firefighter!

- **2026-11-07; gear pages, training page and quiz 2.** Removed the scene of incomplete gear on a call, clarified the purpose of the air tank without promising an absolute seal, and described training as variable. Reason: [Shellfie K–1 safety and quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated authoritative `tools/authored/jobs.js` and built JSON; K grade retained provisionally, educator review pending.

## en-k-be-teacher — Be a Teacher

- **2026-11-07; training page and quiz 2.** Mentioned teacher preparation and the required credential, and made the quiz answer gender-neutral. Reason: [Shellfie inclusion and quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated `tools/authored/jobs.js` and built JSON; K grade retained provisionally, educator review pending.

## en-k-meet-owl — Meet Ollie the Owl

- **2026-11-07; eyesight/flight pages and quiz 2.** Changed absolute claims about sight in darkness and noiseless flight to seeing well in dim light and flying quietly; revised the question and evidence to match. Reason: accurate, age-appropriate nonfiction and [Shellfie quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated `tools/authored/meet.js` and built JSON; K grade retained provisionally, educator review pending.

## en-k-meet-penguin — Meet Penny the Penguin

- **2026-11-07; predator page.** Changed “spotted seal” to “leopard seal” for an Antarctic predator. Reason: accurate age-appropriate nonfiction; [Shellfie placement workflow](../standards/grade-placement.md#placement-workflow). Updated `tools/authored/meet.js` and built JSON; K grade retained provisionally, educator review pending.

## en-3-max-drills — Max Practices the Big Five

- **2026-11-07; earthquake drill, shelter-in-place explanation and quiz 1.** Changed the earthquake cue to “Drop, cover, and hold on,” removed an unverified claim that all county schools use identical wording, and replaced the promise of ordinary recess or knowing exactly what to do with following adults’ instructions. Reason: [Earthquake Country Alliance safety guidance](https://www.earthquakecountry.org/step5/) and [Shellfie grade 3, safety and quiz guidance](../standards/grade-placement.md). Updated `tools/authored/mckinley_en.js` and built JSON; grade 3 retained provisionally, educator review pending. School-specific procedures still need local verification.

## en-3-selfish-giant — The Selfish Giant

- **2026-11-07; new grade 3 adaptation.** Wrote a short adaptation of the garden episode in Oscar Wilde’s 1888 public-domain story, using [Project Gutenberg #902](https://www.gutenberg.org/ebooks/902). Omitted the original ending, including its religious imagery, to present a shorter selected episode; the credit explicitly discloses the omission, which is not a judgment that religious content is unsuitable. Reason: user preference for shorter adaptations and [Shellfie grade 3 reader/task guidance](../standards/grade-placement.md). Source: `tools/authored/queue_codex_older.js`. The grade is provisional and the adaptation has not had educator or literary review.

## en-5-casey-at-bat — Casey at the Bat

- **2026-11-07; new grade 5 selected poem.** Used the 1888 Ernest Lawrence Thayer poem in [The Wit and Humor of America, Volume VI, Project Gutenberg #19324](https://www.gutenberg.org/ebooks/19324). Omitted the stanza in which spectators call for killing the umpire; credit identifies it as a selection and discloses the omission. Retained the poem’s outcome and other original wording, including its religious reference. Reason: [Shellfie all-grade safety and grade 5 reader/task guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Source: `tools/authored/queue_codex_older.js`. The grade is provisional; historical, educator and literary review remain open.

## es-4-muneca-negra — La muñeca negra

- **2026-11-07; grade placement, no story text changes; public-domain José Martí (1889), Project Gutenberg #19898.** Moved the provisional shelf recommendation from grade 4 to grade 5 after reading the complete text and quiz: lengthy, intricate nineteenth-century sentences, figurative language, historical vocabulary and shifts between narration and imagined scenes require substantial context and support. Reason: [Shellfie grade placement workflow](../standards/grade-placement.md#placement-workflow), especially qualitative complexity and reader/task matching. A Spanish-language educator should review whether even grade 5 is appropriate. The stable ID retains `es-4` to avoid breaking saved links and progress; the book metadata, catalog, and `build_library.py` recipe use grade 5. A rebuild may repaginate using the grade 5 band and should be reviewed before publishing.

## es-1-leon-raton — El león y el ratón

- **2026-11-07; page 2.** Replaced the lion's direct threat to eat the mouse with a non-threatening interaction, while keeping the rescue and lesson. Reason: [Shellfie K–1 safety guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance) and consistency with the English adaptation. Updated `tools/authored/retellings.js` and built JSON; grade 1 is provisional, and Spanish-language educator review is pending.

## es-5-regalo-reyes — El regalo de los Reyes Magos

- **2026-11-07; final page.** Replaced the assertion that the Reyes Magos invented gift-giving with a description of the narrator's comparison to figures in Christian tradition. This preserves the religious reference while avoiding an unsupported historical claim. Reason: [Shellfie accuracy, inclusion and grade 5 guidance](../standards/grade-placement.md). Updated `tools/authored/retellings.js` and built JSON; grade 5 remains provisional, educator and cultural review pending.

## es-k-conoce-buho — Conoce a Bruno el Búho

- **2026-11-07; eyesight/flight pages and quiz 2.** Clarified that the owl sees well in low light and flies nearly silently, replacing absolute claims; aligned quiz and evidence. Reason: accurate nonfiction and [Shellfie quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated `tools/authored/meet.js` and built JSON; K remains provisional, Spanish-language educator review pending.

## es-3-max-simulacros — Max practica los simulacros

- **2026-11-07; drill and shelter-in-place explanation.** Removed the unverified claim that every county school uses identical wording and the suggestion that sheltering always means normal rainy-day recess; emphasize listening to adults' instructions. Reason: [Shellfie safety guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance), consistent with the English revision. Updated `tools/authored/mckinley_es.js` and built JSON; grade 3 remains provisional, local and Spanish-language educator review pending.

## es-2-cempasuchil — La leyenda del cempasúchil

- **2026-11-07; last page and quiz 2.** Framed the belief about flowers guiding souls as part of a tradition practiced by some families, while preserving the religious/cultural reference. Reason: respectful cultural context and accurate quiz framing under [Shellfie inclusion and quiz guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated `tools/authored/retellings.js` and built JSON; grade 2 remains provisional, cultural and Spanish-language educator review pending.

## es-3-volcanes — La leyenda de los volcanes

- **2026-11-07; pages 3–4 and quiz 1.** Clarified that Iztaccíhuatl dies instead of describing death only as sleep, while retaining the legend, remembrance and the geographic name “Mujer Dormida.” Aligned the torch question and evidence. Reason: age-appropriate, clear treatment of non-graphic death under [Shellfie grade 2–3 content guidance](../standards/grade-placement.md#shellfie-editorial-content-guidance). Updated `tools/authored/retellings.js` and built JSON; grade 3 remains provisional, and Spanish-language educator and cultural review remain open.
