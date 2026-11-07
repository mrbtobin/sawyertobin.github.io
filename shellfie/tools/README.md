# Shellfie tools

| File | What it does |
|---|---|
| `fetch.sh` + `sources.txt` | Downloads Project Gutenberg plain texts from the GITenberg mirror on GitHub into `tools/.cache/` (not committed). |
| `build_library.py` | Builds `books/<id>.json` and `catalog.js`. Each book is extracted, cleaned, screened for dated/hurtful language (sentences, paragraphs, or whole chapters removed and noted in the credit), its Spanish spelling modernized, paginated to the grade's words-per-page band, split into quiz-sized parts, and given 3 quiz questions per chapter (authored when present, otherwise generated from the text and checked against it). |
| `authored/*.js` | Hand-written stories: the original retellings, the "Meet a…" animal series and the "Be a…" jobs series (English + Spanish). A Gutenberg original with the same id wins over a retelling. |
| `catalog_base.json`, `catalog_extra.json` | The full catalog from the build prompt plus added fairy-tale and bedtime titles ("soon" until a source exists). |
| `sim_reading.js` | Listener simulation: normal reading with recognizer noise, skipping a paragraph (child rereads or jumps past the part already read), skipping a sentence. |
| `qa_personas.js` | QA reader panel at every level K–5 in English and Spanish: speedy, novice, typical, accents and speech patterns. Reports unneeded help, real stumbles helped, nudges, refocus, help time and the learned profile. `--fixed` runs the no-profile baseline. |

Rebuild everything:

```sh
./shellfie/tools/fetch.sh
python3 shellfie/tools/build_library.py
python3 -m http.server 8765   # from the repo root
node shellfie/tools/sim_reading.js
node shellfie/tools/qa_personas.js           # or --only es, --part 1/4
```

Both test tools stub the browser's speech recognizer and feed `Shellfie.hear()`. They set `window.__SHELLFIE_TEST`
(speech output resolves instantly) and `window.__SHELLFIE_TIMESCALE` (all app timers run 10× faster).
