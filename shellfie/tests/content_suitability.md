# Story and quiz suitability review

These cases help reviewers assess age suitability for California public-school readers; they do not determine legal compliance or replace district, teacher, librarian, or family judgment. The agreed initial standard is to avoid graphic violence and review other violence in context and by grade. Respectful references to race, disability, gender, family, religion, and cultural traditions are not inherently unsuitable; review stereotypes, dehumanization, and treatment in context rather than excluding identities.

## Automated checks

From the repository root:

```sh
python3 -m unittest discover -s shellfie/tests -p 'test_*adaptations.py'
python3 -m unittest discover -s shellfie/tests -p 'test_content_screen.py'
python3 shellfie/tests/content_screen.py --json > /tmp/shellfie-content-review.json
```

The scanner inspects published book pages, questions, all answer choices (including wrong answers), and quiz evidence. It reports exact book, chapter, page or quiz field, grade, language, source classification, category and context. Exit status 1 means matches need review, 0 means no matches, and 2 means a scan failure. Search rules are English/Spanish review prompts, not a complete list of harmful concepts: indirect language, coded stereotypes, images, threats, sexual content, violence and mistranslations can be missed. Some matches are benign (such as a vaccination “shot” or “chink” meaning a crack). A clean scan is not proof of suitability or compliance. The source flag identifies the book, not necessarily the author of an individual quiz: trace the text through `tools/authored/`, recipes, and quiz generation before editing.

## Review cases

### CONTENT-001 — Scan story text
- **Priority:** High
- **Platforms:** All; English and Spanish, grades K–5.
- **Setup:** Built book JSON in `shellfie/books/`.
- **Steps:** Run the scanner and review each flagged passage alongside the complete page and adjacent pages.
- **Expected:** Potentially unsuitable material is identified with its context, grade and source; reviewers distinguish harmless matches and do not treat a keyword as a verdict.

### CONTENT-002 — Review quiz questions and every answer
- **Priority:** High
- **Platforms:** All; English and Spanish, grades K–5.
- **Setup:** Include question, correct and incorrect options, and evidence for each chapter.
- **Steps:** Scan all fields and manually review the question and every option in context. Check distractors as carefully as correct answers.
- **Expected:** No question, answer or evidence introduces inappropriate content or stereotypes. Flagged source excerpts receive the same review as story text.

### CONTENT-003 — Violence and frightening material
- **Priority:** Release blocker for confirmed graphic violence; high for other concerning material.
- **Platforms:** All grades, with attention to younger readers.
- **Setup:** Review the complete scene, not only a matched word.
- **Steps:** Identify graphic injury, killing, torture, threats, weapons, abuse, frightening or traumatic events; consider intensity and grade.
- **Expected:** Graphic violence is proposed for removal or revision; other violence is reviewed by grade. Track unresolved cases and proposed mitigations.

### CONTENT-004 — Sexual content, exploitation, self-harm and substances
- **Priority:** High
- **Platforms:** All grades and languages.
- **Setup:** Read context; distinguish literal content from idioms and educational or medical references.
- **Steps:** Review passages and quiz choices for explicit sexual content, coercion, self-harm, substance use, and age-inappropriate detail.
- **Expected:** Concerns are escalated with the relevant passage and grade. A benign term alone does not fail a story.

### CONTENT-005 — Respectful and inclusive representation
- **Priority:** High
- **Platforms:** All grades and languages.
- **Setup:** Read the whole scene and quiz, including translated or historical wording.
- **Steps:** Review slurs, dehumanization, stereotypes, bullying, and biased portrayals; examine who is depicted and how.
- **Expected:** Actual discriminatory or demeaning treatment is flagged with context. Identity and respectful cultural or religious references are not flagged merely for existing.

### CONTENT-006 — Provenance and proposed corrections
- **Priority:** High
- **Platforms:** All content.
- **Setup:** Identify the authoritative authored file, public-domain recipe/source, and quiz origin; generated `books/*.json` may be overwritten by a rebuild.
- **Steps:** Trace each confirmed concern to its source. Correct material in its source and generated output as authorized by the user, preserving attribution and logging each revision for later review. Verify rights before using source material. Check the revised story, quiz and continuity.
- **Expected:** Revisions follow the current user authorization, are disclosed in the revision log and credit, survive the normal build, and do not silently change the author's meaning.

### CONTENT-007 — Regression and reviewer sign-off
- **Priority:** High
- **Platforms:** All changed grades and languages.
- **Setup:** Rebuild or update the affected output by the documented process; retain a record of what was reviewed.
- **Steps:** Rerun automated checks, review the full revised story and quiz, and record reviewer, date, source, case, decision and unresolved issues.
- **Expected:** Confirmed issues stay fixed, unrelated content remains intact, and release readiness is not inferred from automated scans alone.

## Review record

See [public-domain proposals and scan record](content_review_2026-11-07.md). These are review findings, not a complete manual review of the library.
