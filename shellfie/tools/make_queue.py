#!/usr/bin/env python3
"""Writes/refreshes shellfie/books/QUEUE.md: the to-be-authored list (catalog titles that have no readable book yet).

Rows are keyed by the proposed book id. Existing Status / Claimed-by / Notes cells are kept when you re-run this,
rows whose book now exists in books/<id>.json (or whose catalog entry got an id) are marked `done`, and new catalog
"soon" titles are appended as `queued`. Run from the repo root:  python3 shellfie/tools/make_queue.py
Check the queue without rewriting:  python3 shellfie/tools/make_queue.py --check   (exit 1 if QUEUE.md is stale)"""
import json, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CATALOG = os.path.join(ROOT, "catalog.js")
BOOKS = os.path.join(ROOT, "books")
QUEUE = os.path.join(BOOKS, "QUEUE.md")

GRADE_ORDER = ["K", "1", "2", "3", "4", "5"]
LANG_NAME = {"en": "English", "es": "Español (México)"}
START = "<!-- queue:start -->"
END = "<!-- queue:end -->"


def load_catalog():
    s = open(CATALOG, encoding="utf-8").read()
    cat, _ = json.JSONDecoder().raw_decode(s[s.index("=") + 1:].strip())
    return cat


def slug(title):
    t = re.sub(r"\(.*?\)", "", title)
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    words = [w for w in re.findall(r"[a-z0-9]+", t) if w not in ("the", "a", "an", "el", "la", "los", "las", "un", "una", "de", "del", "y", "and", "of")]
    return "-".join(words[:4]) or "untitled"


def source_hint(e):
    lic, auth, url = e.get("l") or "", e.get("a") or "", e.get("u") or ""
    if "public domain" in lic.lower():
        kind = "Public domain: retell in your own words, or fetch via tools/build_library.py recipe"
    elif lic:
        kind = f"{lic}: re-author as an original retelling, keep attribution in `credit`"
    else:
        kind = "Original idea: write fresh"
    return kind, auth, url


def esc(x):
    return str(x).replace("|", "\\|").replace("\n", " ")


def existing_rows():
    rows = {}
    if not os.path.exists(QUEUE):
        return rows
    for line in open(QUEUE, encoding="utf-8"):
        if not line.startswith("| `"):
            continue
        cells = [c.strip() for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]
        if len(cells) >= 7:
            rows[cells[0].strip("`")] = {"status": cells[5], "claimed": cells[6], "notes": cells[7] if len(cells) > 7 else "", "line": line.strip()}
    return rows


def build():
    cat = load_catalog()
    prev = existing_rows()
    built = {f[:-5] for f in os.listdir(BOOKS) if f.endswith(".json")}
    items = []
    for lang in ("en", "es"):
        for g in GRADE_ORDER:
            for e in cat.get(lang, {}).get(g, []):
                if e.get("id"):
                    continue
                bid = f"{lang}-{g.lower()}-{slug(e['t'])}"
                items.append((lang, g, bid, e))
    # ids must be unique
    seen = {}
    for i, (lang, g, bid, e) in enumerate(items):
        if bid in seen:
            bid = bid + "-2"; items[i] = (lang, g, bid, e)
        seen[bid] = 1
    done_prev = [k for k, v in prev.items() if k not in {b for _, _, b, _ in items} and (v["status"].startswith("done") or k in built)]
    out = []
    counts = {"queued": 0, "claimed": 0, "done": 0}
    for lang in ("en", "es"):
        out.append(f"\n### {LANG_NAME[lang]}\n")
        for g in GRADE_ORDER:
            rows = [x for x in items if x[0] == lang and x[1] == g]
            if not rows:
                continue
            out.append(f"\n#### {LANG_NAME[lang]} · {'Kindergarten' if g == 'K' else 'Grade ' + g} ({len(rows)} to write)\n")
            out.append("| Book id | Title | Genre | Source / how | Pages | Status | Claimed by | Notes |")
            out.append("|---|---|---|---|---|---|---|---|")
            for _, _, bid, e in rows:
                p = prev.get(bid, {})
                status = p.get("status") or "queued"
                if bid in built:
                    status = "done"
                kind, auth, url = source_hint(e)
                counts["done" if status.startswith("done") else "claimed" if status.startswith("claimed") else "queued"] += 1
                src = f"{kind}. {auth}" + (f" · [link]({url})" if url else "")
                out.append(f"| `{bid}` | {esc(e['t'])} | {esc(e.get('g', ''))} | {esc(src)} | {BANDS[g]} | {esc(status)} | {esc(p.get('claimed', ''))} | {esc(p.get('notes', ''))} |")
    if done_prev:
        out.append("\n### Completed\n")
        out.append("| Book id | Title | Genre | Source / how | Pages | Status | Claimed by | Notes |")
        out.append("|---|---|---|---|---|---|---|---|")
        for bid in done_prev:
            row = prev[bid]
            line = row['line']
            if not row['status'].startswith('done'):
                line = line.replace('| ' + row['status'] + ' |', '| done |', 1)
            out.append(line)
        counts['done'] += len(done_prev)
    head = (f"{START}\n**Queue summary:** {counts['queued']} queued · {counts['claimed']} claimed · {counts['done']} done "
            f"({len(items) + len(done_prev)} rows). Regenerate with `python3 shellfie/tools/make_queue.py`.\n")
    return head + "\n".join(out) + f"\n\n{END}\n"


BANDS = {"K": "5–14 words/page, ~8–14 pages", "1": "12–35 words/page", "2": "30–70 words/page", "3": "60–130 words/page", "4": "110–200 words/page", "5": "170–300 words/page"}

HEADER = """# Shellfie book queue (to be authored)

> **For agents: this is the list of books that are wanted but do not exist yet.** Everything in the tables below is
> `queued` unless the Status column says otherwise. Pick rows, mark them, write the books, and mark them `done`.
> Books that already exist live next to this file as `<id>.json` (do not edit those by hand; they are built).

## How to take a row

1. Edit **only** the `Status` and `Claimed by` cells of your rows: set Status to `claimed` and put your agent name
   and date in `Claimed by` (for example `claimed` / `agent-2 2026-11-08`). Claim a batch (a grade or a series), not a single row at a time.
   Do not claim a row someone else already holds. Commit the claim first so other agents see it.
2. Write the story in **your own new file** `shellfie/tools/authored/queue_<yourname>.js` (one file per agent so merges never collide),
   in the same format as `tools/authored/meet.js`: `window.SHELLFIE_STORIES.push({ id, lang, grade, genre, icon, title, author, credit, chapters:[{ pages:[…], quiz:[…] }] })`.
   Use the **Book id** from the table exactly (it is `<lang>-<grade>-<slug>`). If a title needs a different id, change it here too.
3. Build and check: `python3 shellfie/tools/build_library.py`, then `node shellfie/tools/sim_reading.js` and the tests in `shellfie/tests/` (see its README).
   The build writes `books/<id>.json` and links the catalog entry (matched by title) so the book shows on the shelf.
4. Set Status to `done`, commit, push. Re-running `python3 shellfie/tools/make_queue.py` also marks any row `done` once its `books/<id>.json` exists.

## Rules for every book

- **Human-written or original only.** Public-domain titles: retell in your own words or use the existing fetch/recipe pipeline; no machine paraphrase of a source passed off as the original.
  CC BY titles (Pratham / African Storybook): write an original retelling and keep the attribution in `credit`.
- **Reading level:** pages must fit the grade band shown in the table (words per page). K = a few short sentences per page. Read-aloud sentences, no walls of text.
  Hard words are fine in small doses; avoid more than ~1 in 10 words above grade level. Mostly everyday words.
- **Every chapter ends with a 3-question quiz** (`quiz:[{ k:"literal"|"infer"|"vocab", q, o:[3 options], a:index, ev:"exact sentence from the story" }]`). `ev` must appear verbatim in the chapter text or the build drops the quiz.
- **Spanish books are Mexican Spanish**, written natively (not translated word-for-word), with correct accents.
- **Jobs ("Be a…") series:** end with (1) what training and how long to become that job and (2) what kids can do now to get exposed to this work.
- **Animal ("Meet a…") series:** funny, K–1, covers food, home, family life, predators and prey.
- **Max the Bulldog (McKinley) books:** Max is male but **avoid gendering** (no he/his/him for Max where it can be avoided). Do not name real students, families or private matters. Only Ms. Soohoo may be named as staff.
- **Kind and safe:** no scary violence beyond classic tale beats told gently, no slurs, no dated or hurtful language (the build screens public-domain text, your original text should be clean to begin with).
- **Icon:** one emoji in `icon`. **Genre:** use a genre already in use (`fairy`, `animal`, `everyday`, `meet`, `jobs`, `seasons`, `bedtime`, `mckinley`, …); check `catalog.js`.

## The queue

Status values: `queued` (free to take) · `claimed` (someone is writing it) · `done` (book file exists) · `blocked: <why>`.
"""


def main():
    body = build()
    text = HEADER + "\n" + body
    if "--check" in sys.argv:
        cur = open(QUEUE, encoding="utf-8").read() if os.path.exists(QUEUE) else ""
        if cur.strip() != text.strip():
            print("books/QUEUE.md is stale: run python3 shellfie/tools/make_queue.py")
            sys.exit(1)
        print("books/QUEUE.md is up to date"); return
    open(QUEUE, "w", encoding="utf-8").write(text)
    print("wrote", os.path.relpath(QUEUE), "-", re.search(r"\*\*Queue summary:\*\* (.*?) \(", body).group(1))


if __name__ == "__main__":
    main()
