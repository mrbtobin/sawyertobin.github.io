#!/usr/bin/env python3
"""Shellfie library build (Section 11 of the build prompt).

Reads Project Gutenberg plain texts (tools/.cache, fetched by tools/fetch.sh from the GITenberg mirror),
plus hand-written stories (tools/authored/*.js), and writes:
  books/<id>.json   one file per readable book (lazy-loaded by the app)
  catalog.js        the full bilingual catalog with metadata for every shelf

Per book: extract the story / chapters, clean Gutenberg markup, screen for dated or hurtful language
(chapters that fail are left out and noted), modernize old Spanish spelling, paginate to the grade's
words-per-page band at sentence/paragraph boundaries, split very long chapters into parts, and attach
a 3-question quiz per chapter (authored when present, otherwise generated from the text itself:
who / sequence / missing word, each answer checked against the text).
Run:  python3 tools/build_library.py
"""
import json, os, random, re, subprocess, sys, unicodedata
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(ROOT, "books")
random.seed(7)

from approved_adaptations import adapt_story, adapt_quiz, adapt_gingerbread

# ───────────────────────── source text helpers ─────────────────────────
def body(src):
    t = open(os.path.join(CACHE, f"{src}.txt"), encoding="utf-8").read().replace("\r", "").replace("﻿", "")
    s = re.search(r"\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n", t) or re.search(r"\*END\*THE SMALL PRINT[^\n]*\n", t)
    e = re.search(r"\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG", t) or re.search(r"End of (the )?Project Gutenberg", t, re.I)
    t = t[s.end() if s else 0: e.start() if e else len(t)]
    # drop illustration / footnote blocks (may span lines) before anything else
    def _ill(m): return "\n" * max(m.group(1).count("\n"), m.group(2).count("\n"))
    t = re.sub(r"(\n(?:[ \t]*\n)*)[ \t]*\[(?:Illustration|Ilustración|imagen|Image)[^\]]*\][ \t]*((?:\n[ \t]*)*\n)", _ill, t, flags=re.I)
    t = re.sub(r"\[(Illustration|Ilustración|imagen|Image)[^\]]*\]", "", t, flags=re.I | re.S)
    t = re.sub(r"\[Footnote[^\]]*\]", "", t, flags=re.S)
    return t

def chunks_by_blank(t, nl=3):
    out = []
    for p in re.split(r"\n(?:[ \t]*\n){%d,}" % nl, t):
        if not p.strip(): continue
        lines = p.strip("\n").split("\n")
        out.append([lines[0].strip(), "\n".join(lines[1:])])
    return out

def chunks_by_regex(t, rx):
    lines = t.split("\n"); starts = []
    for i, l in enumerate(lines):
        if re.match(rx, l.strip()) and (i == 0 or not lines[i - 1].strip() or True):
            starts.append(i)
    out = []
    for k, s in enumerate(starts):
        e = starts[k + 1] if k + 1 < len(starts) else len(lines)
        out.append([lines[s].strip(), "\n".join(lines[s + 1:e])])
    return out

def wc(s): return len(re.findall(r"[\w’']+", s))

ROMAN = r"[IVXLC]+"
NUMWORD = r"ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY|THIRTY|FORTY|FIFTY|[-\s]"
def is_bare_head(h):
    return bool(re.fullmatch(rf"(CHAPTER|Chapter|STORY|STAVE|FÁBULA|CAP[IÍ]TULO|ADVENTURE)?\s*({ROMAN}|\d+|(?:{NUMWORD})+)?\s*[.:]?\s*", h.strip())) and h.strip() != ""

SMALL = {"a","an","the","and","or","of","in","on","to","for","at","by","with","from","as","but","into","is"}
def nice_title(s, lang):
    s = re.sub(r"<[^>]+>|\[\d+\]|_", "", s).strip().rstrip(".,;:").strip()
    s = re.sub(rf"^(CHAPTER|Chapter|STAVE|STORY|ADVENTURE|CAP[IÍ]TULO)\s+({ROMAN}|\d+|(?:{NUMWORD})+)\s*[.:]?\s*", "", s).strip()
    s = re.sub(rf"^({ROMAN}|\d+)\s*[.:]?\s+(?=\S)", "", s).strip()
    letters = [c for c in s if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) > .8 * len(letters):
        if lang == "es":
            s = s.lower(); s = re.sub(r"^([^\w]*)(\w)", lambda m: m.group(1) + m.group(2).upper(), s)
        else:
            words = s.lower().split(" ")
            cap = lambda w: re.sub(r"^([^A-Za-z]*)([a-z])", lambda m: m.group(1) + m.group(2).upper(), w)
            s = " ".join(w if (i and w in SMALL) else cap(w) for i, w in enumerate(words))
            s = re.sub(r"(?<=[-’'])([a-z])", lambda m: m.group(1) if m.group(1) in "st" else m.group(1).upper(), s)
            s = re.sub(r"\bMc([a-z])", lambda m: "Mc" + m.group(1).upper(), s)
    return s.strip(" -—")

# ───────────────────────── cleaning + paragraphs ─────────────────────────
ES_MODERN = [(r"\bá\b", "a"), (r"\bÁ\b", "A"), (r"\bó\b", "o"), (r"\bé\b", "e"), (r"\bfué\b", "fue"), (r"\bFué\b", "Fue"),
             (r"\bdió\b", "dio"), (r"\bvió\b", "vio"), (r"\bfuí\b", "fui"), (r"\bví\b", "vi"), (r"\bdí\b", "di"), (r"\bpié\b", "pie"),
             (r"\bpiés\b", "pies"), (r"\bfuése\b", "fuese"), (r"\bsóla\b", "sola"), (r"\bsólo\b", "solo"), (r"\bSólo\b", "Solo"), (r"\bDíme\b", "Dime"), (r"\bdíme\b", "dime")]
def clean_para(p, lang):
    p = re.sub(r"<[^>]+>|\[\d+\]|\{\d+\}|\[[A-Z]\]", "", p)
    p = re.sub(r"(?<![\w])_([^_]+)_(?![\w])", r"\1", p).replace("_", "")
    p = re.sub(r"#([^#\n]+)#", r"\1", p)
    p = p.replace("--", "—").replace("``", "“").replace("''", "”")
    p = re.sub(r"[ \t]+", " ", p)
    p = re.sub(r"^([“\"‘«¿¡—]*)([A-ZÁÉÍÓÚÑ])([A-ZÁÉÍÓÚÑ]+)\b(?=[\s,]+[a-záéíóúñ])", lambda m: m.group(1) + m.group(2) + m.group(3).lower(), p.strip())
    if lang == "es":
        for a, b in ES_MODERN: p = re.sub(a, b, p)
    return p.strip()

def paragraphs(text, lang, poem):
    out = []
    for raw in re.split(r"\n[ \t]*\n", text):
        lines = [l.rstrip() for l in raw.split("\n") if l.strip()]
        if not lines: continue
        if all(re.fullmatch(r"[\s*.·]+", l) for l in lines): continue
        is_poem = poem or (len(lines) >= 2 and sum(len(l.strip()) < 52 for l in lines) >= .75 * len(lines) and max(len(l) for l in lines) < 62)
        if is_poem:
            p = "\n".join(clean_para(l, lang) for l in lines)
        else:
            p = clean_para(" ".join(l.strip() for l in lines), lang)
        if re.fullmatch(r"(THE END|FIN|THE END\.|FIN\.)", p.strip()): continue
        if p: out.append(p)
    return out

# ───────────────────────── content screen ─────────────────────────
BLOCK_EN = re.compile(r"\b(nigger\w*|nigga\w*|negro(es)?|darkey|darkies?|darky|pickaninn\w*|piccaninn\w*|redskins?|injuns?|squaws?|coolies?|half-breeds?|mulatto\w*|hottentots?|savages|gipsy|gipsies|gypsy|gypsies|jews?|jewess|wops?|dagoes|dagos?)\b", re.I)
BLOCK_ES = re.compile(r"\b(negrito|negrita|negrillo|gitano|gitanos|gitana|gitanas|judío|judíos)\b", re.I)
LIGHT = {"en": [(r"\bChinamen\b", "Chinese people"), (r"\bChinaman\b", "Chinese man")], "es": []}
def screen(text, lang):
    m = (BLOCK_ES if lang == "es" else BLOCK_EN).search(text)
    return m.group(0) if m else None
def screen_paras(paras, lang):
    """Remove the few paragraphs that use hurtful terms; give up (None) if too much of the chapter is affected."""
    rx = BLOCK_ES if lang == "es" else BLOCK_EN
    edited = False; out = []
    for p in paras:
        q = p
        for a, b in LIGHT[lang]:
            q2 = re.sub(a, b, q)
            if q2 != q: edited = True; q = q2
        out.append(q)
    bad = [i for i, p in enumerate(out) if rx.search(p)]
    if not bad: return out, edited, None
    total = sum(wc(p) for p in out)
    # remove just the offending sentences (or the whole paragraph if it is short)
    fixed = list(out); cut = 0; nb = 0
    for i in bad:
        ss = sentences(out[i]); keep = [x for x in ss if not rx.search(x)]
        nb += len(ss) - len(keep)
        if wc(" ".join(keep)) < .5 * wc(out[i]) or wc(out[i]) < 60: cut += wc(out[i]); fixed[i] = None
        else: cut += wc(out[i]) - wc(" ".join(keep)); fixed[i] = " ".join(keep)
    if nb <= 6 and cut <= .05 * total:
        return [p for p in fixed if p], True, None
    return None, edited, rx.search(" ".join(out[i] for i in bad)).group(0)

# ───────────────────────── sentences + pagination ─────────────────────────
ABBR = r"\b(Mr|Mrs|Ms|Dr|St|Mt|Jr|Sr|Sra|Srta|Esq|Capt|Col|Gen|Rev|Prof|No|vs|etc|Ud|Uds|Vd|Vds|D|Dª)\."
def sentences(p):
    q = re.sub(ABBR, lambda m: m.group(0)[:-1] + "§", p)
    parts = re.split(r"(?<=[.!?…])([”’\"»)]*)\s+(?=[“‘\"«¿¡—(]*[A-ZÁÉÍÓÚÑ0-9])", q)
    out, buf = [], ""
    for i, x in enumerate(parts):
        if i % 2 == 1: buf += x; continue
        if buf: out.append(buf)
        buf = x
    if buf: out.append(buf)
    return [s.replace("§", ".").strip() for s in out if s.strip()]

BAND = {"K": (5, 14), "1": (12, 35), "2": (30, 70), "3": (60, 130), "4": (110, 200), "5": (170, 300)}
PART = {"K": 450, "1": 900, "2": 1500, "3": 2200, "4": 3600, "5": 5200}

def paginate(paras, grade):
    lo, hi = BAND[grade]; pages = []; cur = []; n = 0
    def flush():
        nonlocal cur, n
        if cur:
            # a heading never ends a page
            if cur[-1].startswith("## ") and len(cur) > 1: tail = [cur.pop()]
            else: tail = []
            pages.append("\n\n".join(cur)); cur = tail; n = sum(wc(x) for x in cur)
    for p in paras:
        w = wc(p)
        if p.startswith("## "):
            if n >= lo: flush()
            cur.append(p); continue
        if "\n" in p:  # poem stanza: keep whole if possible, else split by line pairs
            if n + w > hi and n >= lo: flush()
            if w <= hi: cur.append(p); n += w
            else:
                lines = p.split("\n"); step = 2 if grade in "K1" else 4
                for i in range(0, len(lines), step):
                    seg = "\n".join(lines[i:i + step]); sw = wc(seg)
                    if n + sw > hi and n >= lo: flush()
                    cur.append(seg); n += sw
            continue
        if n + w <= hi: cur.append(p); n += w; continue
        if grade in "45" and n >= lo and w <= hi: flush(); cur.append(p); n = w; continue
        # split this paragraph at sentence boundaries
        piece = []; pn = 0
        for s in sentences(p):
            sw = wc(s)
            if n + pn + sw > hi and (n + pn) >= max(lo, 1):
                if piece: cur.append(" ".join(piece)); piece = []; pn = 0
                flush()
            piece.append(s); pn += sw
        if piece: cur.append(" ".join(piece)); n += pn
    flush()
    return [pg for pg in pages if wc(pg.replace("## ", "")) > 0]

# ───────────────────────── auto quiz ─────────────────────────
Q_TEXT = {
    "en": {"who": "Who is in this part of the story?", "first": "Which of these happened first?", "firstPoem": "Which line came first?",
           "miss": "Which word is missing?", "from": "Which sentence is from this story?"},
    "es": {"who": "¿Quién aparece en esta parte del cuento?", "first": "¿Qué pasó primero?", "firstPoem": "¿Qué verso aparece primero?",
           "miss": "¿Qué palabra falta?", "from": "¿Qué oración es de este cuento?"},
}
NAME_STOP = set("""I God Lord Mr Mrs Miss Sir Madam Master Mister Dame Christmas Sunday Monday Tuesday Wednesday Thursday Friday Saturday January February March April May June July
August September October November December English England London France French Heaven Oh O Yes No Then And But The A He She It They We You His Her Its Their Our This That There
Don Doña Dios Señor Señora Navidad Sí El La Los Las Un Una Pero Y Entonces Ah Ay Well Now Here What Why How When Where Who Mother Father Grandfather Grandmother Aunt Uncle Old Little
King Queen Prince Princess Captain Doctor Dr St Mistress Sahib Mem Ayah Mamá Papá Madre Padre Abuelo Abuela Rey Reina Príncipe Princesa""".split())

def names_in(text):
    c = Counter()
    for m in re.finditer(r"(?<=[a-záéíóúñ,;:—]\s)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})", text):
        w = m.group(1)
        if w not in NAME_STOP: c[w] += 1
    return c

def short_sents(pages, lo, hi, loose=False):
    if loose:
        out = []
        for pg in pages:
            for para in pg.split("\n\n"):
                if para.startswith("## "): continue
                for x in sentences(para.replace("\n", " ")):
                    x = re.sub(r"[“”\"«»]|(?<!\w)[‘’']|[‘’'](?!\w)", "", x).strip(" —")
                    if lo <= wc(x) <= hi and re.match(r"[A-ZÁÉÍÓÚÑ¿¡]", x) and re.search(r"[.!?]$", x): out.append(x)
        return out
    return _short_sents(pages, lo, hi)
def _short_sents(pages, lo, hi):
    out = []
    for pi, pg in enumerate(pages):
        for para in pg.split("\n\n"):
            if para.startswith("## "): continue
            for s in sentences(para.replace("\n", " ")):
                s = re.sub(r"^[“\"‘«]+|[”\"’»]+$", "", s.strip()).strip()
                n = wc(s)
                if lo <= n <= hi and not re.search(r"[“”\"‘«»—]|’(?!\w)|(?<!\w)’|^'|'$", s) and re.match(r"[A-ZÁÉÍÓÚÑ¿¡]", s) and re.search(r"[.!?]$", s): out.append(s)
    return out

def auto_quiz(ch_pages, book_names, pool_names, book_words, lang, grade, poem):
    T = Q_TEXT[lang]; nopt = 3 if grade in "K1" else 4; qs = []
    text = " ".join(p.replace("\n", " ") for p in ch_pages)
    # 1) who (literal)
    here = names_in(text)
    lower = set(re.findall(r"\b[a-záéíóúñ]+\b", text))
    real = lambda n: n.lower() not in lower
    book_names = [n for n in book_names if real(n)]; pool_names = [n for n in pool_names if n.lower() not in lower]
    top = [] if poem else [n for n, c in here.most_common(6) if c >= 2 and real(n)]
    if top:
        name = top[0]
        others = [n for n in book_names if n not in here and n != name]
        if len(others) < nopt - 1: others += [n for n in pool_names if n not in here and n not in others and n != name]
        random.shuffle(others)
        if len(others) >= nopt - 1:
            ev = next((s for s in sentences(text) if name in s), "")
            qs.append({"k": "literal", "q": T["who"], "o": [name] + others[:nopt - 1], "a": 0, "ev": ev, "auto": 1})
    # 2) sequence
    lo, hi = (3, 12) if grade in "K1" else (5, 16)
    ss = short_sents(ch_pages, lo, hi)
    if len(ss) < nopt * 2: ss = short_sents(ch_pages, lo, hi + 6, loose=True)
    if len(ss) >= nopt * 2:
        idx = sorted(random.sample(range(len(ss)), nopt))
        picks = [ss[i] for i in idx]
        if len(set(picks)) == nopt:
            qs.append({"k": "infer", "q": T["firstPoem" if poem else "first"], "o": picks, "a": 0, "ev": picks[0], "auto": 1})
    # 3) missing word (vocabulary in context)
    minlen = 4 if grade == "K" else 5 if grade == "1" else 6
    words = [w for w in re.findall(r"\b[a-záéíóúñ]+\b", text) if len(w) >= minlen]
    cnt = Counter(words)
    cands = [w for w in cnt if cnt[w] <= 2]
    random.shuffle(cands)
    sent_pool = short_sents(ch_pages, 5 if grade in "K1" else 6, 24 if grade not in "K1" else 16) or short_sents(ch_pages, 5, 26, loose=True)
    used_s = set()
    for w in cands:
        if len(qs) >= 3: break
        s = next((s for s in sent_pool if re.search(rf"\b{re.escape(w)}\b", s)), None)
        if not s or s in used_s: continue
        same = [x for x in book_words if x != w and abs(len(x) - len(w)) <= 3 and x[-2:] == w[-2:] and not re.search(rf"\b{re.escape(x)}\b", s)]
        if len(same) < nopt - 1: same += [x for x in book_words if x != w and abs(len(x) - len(w)) <= 3 and x not in same and not re.search(rf"\b{re.escape(x)}\b", s)]
        if len(same) < nopt - 1: continue
        random.shuffle(same)
        blank = re.sub(rf"\b{re.escape(w)}\b", "____", s, count=1)
        qs.append({"k": "vocab", "q": f"{T['miss']} {'«' + blank + '»' if lang == 'es' else '“' + blank + '”'}", "o": [w] + same[:nopt - 1], "a": 0, "ev": s, "auto": 1})
        used_s.add(s)
        if len(qs) >= 2 and len(ss) >= nopt * 2: break
    # backfill to three
    tries = 0
    while len(qs) < 3 and tries < 2 and len(ss) >= nopt * 2:
        tries += 1
        idx = sorted(random.sample(range(len(ss)), nopt)); picks = [ss[i] for i in idx]
        if len(set(picks)) == nopt and all(picks[0] != q.get("ev") for q in qs):
            qs.append({"k": "infer", "q": T["firstPoem" if poem else "first"], "o": picks, "a": 0, "ev": picks[0], "auto": 1})
    return qs[:3]

# ───────────────────────── recipes ─────────────────────────
GUT = "https://www.gutenberg.org/ebooks/{}"
R = []
def B(id, lang, grade, genre, title, author, src, pick=None, cat=None, icon=None, season=None, poem=False, split=None, nl=3,
      group=0, whole=False, minw=60, single=False, daily=False, star=False, skip_heads=None, titles=None, note=None, start=None, end=None):
    R.append(dict(id=id, lang=lang, grade=grade, genre=genre, title=title, author=author, src=src, pick=pick, cat=cat, icon=icon,
                  season=season, poem=poem, split=split, nl=nl, group=group, whole=whole, minw=minw, single=single, daily=daily,
                  star=star, skip_heads=skip_heads, titles=titles, note=note, start=start, end=end))

FRONT = r"^(contents|table of contents|list of|illustrations|preface|introduction|transcriber|note|notes|footnotes|índice|prólogo|advertencia|notas|vocabulario|the end|fin|produced by|a los niños|la última página|amicis en su obra)"

BRYANT = r"^[A-Z][A-Z \-',\"!?.]{3,}(\[\d\])?\??$"
# ── English ──
B("en-k-mother-goose-rhymes", "en", "K", "poetry", "Mother Goose Rhymes (Hey Diddle Diddle, Jack and Jill, Humpty Dumpty, Little Bo Peep)", "The Real Mother Goose (1916)", 10607,
  pick=["THE CAT AND THE FIDDLE", "JACK AND JILL", "HUMPTY DUMPTY", "LITTLE BO-PEEP"], split=r"^[A-Z][A-Z0-9 ,'’.!?\-&]{2,}$", poem=True, minw=8, single=True, icon="🐄",
  cat="Mother Goose Rhymes (Hey Diddle Diddle, Jack and Jill, Humpty Dumpty, Little Bo Peep)")
B("en-k-real-mother-goose", "en", "K", "poetry", "The Real Mother Goose", "Blanche Fisher Wright, illus. (1916)", 10607, split=r"^[A-Z][A-Z0-9 ,'’.!?\-&]{2,}$", start=r"^LITTLE BO-PEEP$",
  poem=True, minw=8, group=8, icon="🪿", star=True, cat="The Real Mother Goose", skip_heads=[r"^A LIST OF", r"^THE REAL$", r"^MOTHER GOOSE$"])
B("en-k-owl-pussycat", "en", "K", "poetry", "The Owl and the Pussy-cat", "Edward Lear (1871)", 13647, pick=["THE OWL AND THE PUSSY-CAT"], split=r"^THE [A-Z ,.\-]+\.$", poem=True, minw=40, icon="🦉", cat="The Owl and the Pussy-cat (Edward Lear, 1871)")
for t, ic in [("THE LITTLE PINK ROSE", "🌹"), ("THE COCK-A-DOO-DLE-DOO", "🐓"), ("THE CLOUD", "☁️"), ("TWO LITTLE RIDDLES IN RHYME", "❓")]:
    B("en-k-bryant-" + re.sub(r"\W+", "-", t.lower()).strip("-"), "en", "K", "bedtime", nice_title(t, "en"), "Sara Cone Bryant, Stories to Tell to Children (1907)", 473,
      pick=[t], icon=ic, minw=30, split=BRYANT)
# grade 1
for sid, src, ic, cat in [("en-1-tom-kitten", 14837, "🐱", "The Tale of Tom Kitten"), ("en-1-jeremy-fisher", 15077, "🐸", "The Tale of Mr. Jeremy Fisher"),
                          ("en-1-fierce-bad-rabbit", 45265, "🐇", "The Story of a Fierce Bad Rabbit"), ("en-1-miss-moppet", 14848, "🐈", "The Story of Miss Moppet")]:
    B(sid, "en", "1", "animal", cat, "Beatrix Potter", src, whole=True, icon=ic, cat=cat, start=r"^(Once upon a time|This is a|ONCE upon|THIS is)")
for sid, head, ic, cat in [("en-1-tortoise-hare", "THE HARE AND THE TORTOISE", "🐢", "The Tortoise and the Hare"), ("en-1-lion-mouse", "THE LION AND THE MOUSE", "🦁", "The Lion and the Mouse"),
                           ("en-1-town-country-mouse", "THE TOWN MOUSE AND THE COUNTRY MOUSE", "🐭", "The Town Mouse and the Country Mouse"),
                           ("en-1-boy-cried-wolf", "THE SHEPHERD BOY AND THE WOLF", "🐺", "The Boy Who Cried Wolf"), ("en-1-north-wind-sun", "THE NORTH WIND AND THE SUN", "🌬️", "The North Wind and the Sun")]:
    B(sid, "en", "1", "fables", cat, "The Aesop for Children (1919)", 19994, pick=[head], icon=ic, cat=cat, minw=40)
B("en-1-more-aesop", "en", "1", "fables", "More Aesop: The Fox and the Grapes, The Crow and the Pitcher", "The Aesop for Children (1919)", 19994,
  pick=["THE FOX AND THE GRAPES", "THE CROW AND THE PITCHER"], icon="🦊", cat="More Aesop: The Fox and the Grapes, The Crow and the Pitcher", minw=40)
for sid, head, ic, cat in [("en-1-three-little-pigs", "THE STORY OF THE THREE LITTLE PIGS", "🐷", "The Three Little Pigs"), ("en-1-three-bears", "THE STORY OF THE THREE BEARS", "🐻", "The Story of the Three Bears"),
                           ("en-1-henny-penny", "HENNY-PENNY", "🐔", "Henny Penny"), ("en-1-johnny-cake", "JOHNNY-CAKE", "🥞", "Johnny-Cake"), ("en-1-teeny-tiny", "TEENY-TINY", "👵", "The Teeny-Tiny Woman")]:
    B(sid, "en", "1", "fairy", cat, "Joseph Jacobs, English Fairy Tales (1890)", 7439, pick=[head], icon=ic, cat=cat)
B("en-1-red-riding-hood", "en", "1", "fairy", "Little Red Riding Hood (Little Red Cap)", "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=["LITTLE RED CAP"], icon="🧺", cat="Little Red Riding Hood")
B("en-1-elves-shoemaker", "en", "1", "fairy", "The Elves and the Shoemaker", "Sara Cone Bryant, Stories to Tell to Children (1907)", 473, pick=["THE ELVES AND THE SHOEMAKER"], split=BRYANT, icon="👞", cat="The Elves and the Shoemaker")
B("en-1-childs-garden", "en", "1", "poetry", "A Child's Garden of Verses (selected)", "Robert Louis Stevenson (1885)", 136, split=r"^[IVXL]+$", poem=True, group=6, minw=25, icon="🌷",
  star=True, cat="A Child's Garden of Verses (selected)", titles="next")
for t, ic in [("THE LITTLE RED HEN", "🐔"), ("THE GINGERBREAD MAN", "🍪"), ("THE LITTLE HALF-CHICK", "🐥"), ("LITTLE JACK ROLLAROUND", "🌙"), ("THE LAMBIKIN", "🐑"),
              ("THE ADVENTURES OF THE LITTLE FIELD MOUSE", "🐁"), ("THE COUNTRY MOUSE AND THE CITY MOUSE", "🏙️")]:
    grade = "K" if t == "THE GINGERBREAD MAN" else "1"
    genre = "fairy" if t == "THE GINGERBREAD MAN" else "bedtime"
    sid = f"en-{grade.lower()}-bryant-" + re.sub(r"\W+", "-", t.lower()).strip("-")
    B(sid, "en", grade, genre, nice_title(t, "en"), "Sara Cone Bryant, Stories to Tell to Children (1907)", 473, pick=[t], icon=ic, split=BRYANT,
      cat="The Gingerbread Boy" if t == "THE GINGERBREAD MAN" else None)
for t, ic in [("THE GOLDEN GOOSE", "🪿"), ("TOM THUMB", "👍")]:
    B("en-1-brooke-" + re.sub(r"\W+", "-", t.lower()).strip("-"), "en", "1", "bedtime", nice_title(t, "en"), "L. Leslie Brooke, The Golden Goose Book (1905)", 15661, pick=[t], icon=ic)
B("en-1-365-bedtime", "en", "1", "bedtime", "365 Bedtime Stories", "Mary Graham Bonner (1923)", 69225, split=r"^(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER) \d+:",
  minw=40, daily=True, icon="🌙", note="One story for every night of the year. It opens on tonight's date.")
# grade 2
for sid, src, ic, cat in [("en-2-peter-rabbit", 14838, "🥕", "The Tale of Peter Rabbit"), ("en-2-benjamin-bunny", 14407, "🐰", "The Tale of Benjamin Bunny"),
                          ("en-2-squirrel-nutkin", 14872, "🐿️", "The Tale of Squirrel Nutkin"), ("en-2-jemima", 14814, "🦆", "The Tale of Jemima Puddle-Duck"),
                          ("en-2-two-bad-mice", 45264, "🐭", "The Tale of Two Bad Mice"), ("en-2-flopsy", 14220, "🐇", "The Tale of the Flopsy Bunnies"),
                          ("en-2-tittlemouse", 17089, "🏠", "The Tale of Mrs. Tittlemouse"), ("en-2-johnny-town-mouse", 15284, "🧺", "The Tale of Johnny Town-Mouse")]:
    B(sid, "en", "2", "animal", cat, "Beatrix Potter", src, whole=True, icon=ic, cat=cat, start=r"^(Once upon a time|This is a|ONCE upon|THIS is|One |ONE |Johnny Town-mouse|JOHNNY TOWN-MOUSE|You know|YOU know|Mrs\.|MRS\.|It is said|IT is said)")
B("en-2-uncle-wiggily", "en", "2", "animal", "Uncle Wiggily's Adventures", "Howard R. Garis (1912)", 15281, split=r"^STORY [IVXL]+$", icon="🐰", cat="Uncle Wiggily's Adventures (selected)", titles="next")
B("en-2-raggedy-ann", "en", "2", "adventure", "Raggedy Ann Stories", "Johnny Gruelle (1918)", 18190, icon="🪆", cat="Raggedy Ann Stories (selected)", skip_heads=[r"^PREFACE", r"^INTRODUCTION"])
B("en-2-raggedy-andy", "en", "2", "adventure", "Raggedy Andy Stories", "Johnny Gruelle (1920)", 17371, icon="🧸", cat="Raggedy Andy Stories (selected)", skip_heads=[r"^RAGGEDY ANDY$"])
B("en-2-princess-pea", "en", "2", "fairy", "The Princess and the Pea (The Real Princess)", "Hans Christian Andersen, tr. 1909", 1597, pick=["THE REAL PRINCESS"], icon="👑", cat="The Princess and the Pea", minw=40)
for sid, head, ic, cat in [("en-2-bremen", "THE BREMEN TOWN MUSICIANS", "🎺", "The Bremen Town Musicians"), ("en-2-frog-prince", "THE FROG PRINCE", "🐸", "The Frog Prince"),
                           ("en-2-wolf-seven-kids", "THE WOLF AND THE SEVEN LITTLE GOATS", "🐐", "The Wolf and the Seven Young Kids"), ("en-2-sleeping-beauty", "THE SLEEPING BEAUTY", "🌹", "The Sleeping Beauty")]:
    B(sid, "en", "2", "fairy", nice_title(head, "en") if sid != "en-2-sleeping-beauty" else "The Sleeping Beauty (Briar Rose)", "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=[head], icon=ic, cat=cat)
for sid, head, ic, cat in [("en-2-puss-in-boots", "THE MASTER CAT; OR, PUSS IN BOOTS", "🐈", "Puss in Boots"), ("en-2-cinderella", "CINDERELLA, OR THE LITTLE GLASS SLIPPER", "👠", "Cinderella")]:
    B(sid, "en", "2", "fairy", nice_title(head, "en"), "Charles Perrault, in Andrew Lang's Blue Fairy Book (1889)", 503, pick=[head], icon=ic, cat=cat)
B("en-2-book-of-nonsense", "en", "2", "poetry", "A Book of Nonsense (funny limericks)", "Edward Lear (1846)", 13646, nl=1, poem=True, group=10, minw=20, icon="🤪", star=True, cat="A Book of Nonsense (funny limericks)")
for head, ic in [("RAPUNZEL", "👱‍♀️"), ("THE GOLDEN GOOSE", "🪿"), ("MOTHER HULDA", "🛏️"), ("THE STRAW, THE COAL, AND THE BEAN", "🫘"), ("THE QUEEN BEE", "🐝"), ("THE ELVES", "🧝")]:
    B("en-2-grimm-" + re.sub(r"\W+", "-", head.lower()).strip("-"), "en", "2", "bedtime", nice_title(head, "en"), "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=[head], icon=ic)
# grade 3
B("en-3-velveteen", "en", "3", "adventure", "The Velveteen Rabbit", "Margery Williams (1922)", 11757, whole=True, icon="🐰", cat="The Velveteen Rabbit", start=r"^(THERE was once|There was once)")
B("en-3-just-so", "en", "3", "animal", "Just So Stories: The Elephant's Child, How the Camel Got His Hump, How the Whale Got His Throat", "Rudyard Kipling (1902)", 2781,
  pick=["THE ELEPHANT’S CHILD", "HOW THE CAMEL GOT HIS HUMP", "HOW THE WHALE GOT HIS THROAT"], icon="🐘", cat="Just So Stories: The Elephant's Child, How the Camel Got His Hump, How the Whale Got His Throat")
B("en-3-mother-west-wind", "en", "3", "animal", "Old Mother West Wind", "Thornton W. Burgess (1910)", 2557, split=r"^CHAPTER [IVXL]+", icon="🌬️", cat="Old Mother West Wind (selected)")
B("en-3-peter-cottontail", "en", "3", "animal", "The Adventures of Peter Cottontail", "Thornton W. Burgess (1914)", 46866, split=r"^[IVXL]+\. [A-Z]", icon="🐇", cat="The Adventures of Peter Cottontail")
B("en-3-reddy-fox", "en", "3", "animal", "The Adventures of Reddy Fox", "Thornton W. Burgess (1913)", 1825, split=r"^[IVXL]+\. [A-Z]", icon="🦊", cat="The Adventures of Reddy Fox")
B("en-3-tiggy-winkle", "en", "3", "animal", "The Tale of Mrs. Tiggy-Winkle", "Beatrix Potter (1905)", 15137, whole=True, icon="🦔", cat="The Tale of Mrs. Tiggy-Winkle", start=r"^(Once upon a time|ONCE upon)")
B("en-3-emperor", "en", "3", "fairy", "The Emperor's New Clothes", "Hans Christian Andersen, tr. 1909", 1597, pick=["THE EMPEROR'S NEW CLOTHES"], icon="🧥", cat="The Emperor's New Clothes")
for sid, head, ic, cat in [("en-3-ugly-duckling", "THE UGLY DUCKLING", "🦢", "The Ugly Duckling"), ("en-3-thumbelina", "LITTLE TINY OR THUMBELINA", "🌸", "Thumbelina"),
                           ("en-3-tin-soldier", "THE BRAVE TIN SOLDIER", "💂", "The Steadfast Tin Soldier")]:
    B(sid, "en", "3", "fairy", cat, "Hans Christian Andersen, tr. H. P. Paull (1872)", 27200, pick=[head], icon=ic, cat=cat)
B("en-3-fir-tree", "en", "3", "seasons", "The Fir Tree (Christmas)", "Hans Christian Andersen, tr. 1909", 1597, pick=["THE FIR TREE"], icon="🎄", season="winter", cat="The Fir Tree (Christmas)")
B("en-3-jack-beanstalk", "en", "3", "fairy", "Jack and the Beanstalk", "Joseph Jacobs, English Fairy Tales (1890)", 7439, pick=["JACK AND THE BEANSTALK"], icon="🌱", cat="Jack and the Beanstalk")
B("en-3-rumpelstiltskin", "en", "3", "fairy", "Rumpelstiltskin", "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=["RUMPELSTILTSKIN"], icon="🧵", cat="Rumpelstiltskin")
B("en-3-hansel-gretel", "en", "3", "fairy", "Hansel and Gretel", "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=["HANSEL AND GRETHEL"], icon="🍬", cat="Hansel and Gretel")
B("en-3-aladdin", "en", "3", "fairy", "Aladdin and the Wonderful Lamp", "Andrew Lang, Blue Fairy Book (1889)", 503, pick=["ALADDIN AND THE WONDERFUL LAMP"], icon="🪔", cat="Aladdin and the Wonderful Lamp")
B("en-3-fifty-famous", "en", "3", "adventure", "Fifty Famous Stories Retold", "James Baldwin (1896)", 18442, split=r"^[A-Z][A-Z .,'’!?\-]{4,}$", icon="📜", minw=150, skip_heads=[r"^PREFACE", r"^CONTENTS", r"^FIFTY FAMOUS"])
for head, ic in [("THE GALLANT TAILOR", "🪡"), ("THE FISHERMAN AND HIS WIFE", "🐟")]:
    B("en-3-grimm-" + re.sub(r"\W+", "-", head.lower()).strip("-"), "en", "3", "bedtime", nice_title(head, "en"), "Brothers Grimm, tr. Lucy Crane (1882)", 19068, pick=[head], icon=ic)
for head, ic in [("WHY THE SEA IS SALT", "🧂"), ("TOADS AND DIAMONDS", "💎")]:
    B("en-3-lang-" + re.sub(r"\W+", "-", head.lower()).strip("-"), "en", "3", "bedtime", nice_title(head, "en"), "Andrew Lang, Blue Fairy Book (1889)", 503, pick=[head], icon=ic)
# grade 4
B("en-4-oz", "en", "4", "adventure", "The Wonderful Wizard of Oz", "L. Frank Baum (1900)", 55, split=r"^\d+\.\s+[A-Z]", icon="🌪️", cat="The Wonderful Wizard of Oz (chapters)")
B("en-4-alice", "en", "4", "adventure", "Alice's Adventures in Wonderland", "Lewis Carroll (1865)", 11, split=r"^CHAPTER [IVXL]+\.", icon="🐇", cat="Alice's Adventures in Wonderland (chapters)")
B("en-4-five-children", "en", "4", "adventure", "Five Children and It", "E. Nesbit (1902)", 778, split=r"^CHAPTER \d+$", icon="🏖️", cat="Five Children and It (chapters)", titles="next")
B("en-4-princess-goblin", "en", "4", "adventure", "The Princess and the Goblin", "George MacDonald (1872)", 708, split=r"^CHAPTER \d+$", icon="👸", cat="The Princess and the Goblin (chapters)", titles="next")
B("en-4-reluctant-dragon", "en", "4", "adventure", "The Reluctant Dragon", "Kenneth Grahame (1898)", 270, pick=["THE RELUCTANT DRAGON"], icon="🐉", cat="The Reluctant Dragon")
B("en-4-rikki", "en", "4", "animal", "Rikki-Tikki-Tavi", "Rudyard Kipling, The Jungle Book (1894)", 236, pick=["“Rikki-Tikki-Tavi”"], icon="🐍", cat="Rikki-Tikki-Tavi")
B("en-4-mowgli", "en", "4", "animal", "Mowgli's Brothers and Kaa's Hunting", "Rudyard Kipling, The Jungle Book (1894)", 236, pick=["Mowgli’s Brothers", "Kaa’s Hunting"], icon="🐺", cat="Mowgli's Brothers and Kaa's Hunting")
B("en-4-heidi", "en", "4", "everyday", "Heidi", "Johanna Spyri, tr. 1915", 1448, split=r"^CHAPTER [IVXL]+\.", icon="🏔️", cat="Heidi (chapters)")
B("en-4-pollyanna", "en", "4", "everyday", "Pollyanna", "Eleanor H. Porter (1913)", 1450, split=r"^CHAPTER [IVXL]+\.", icon="😊", cat="Pollyanna (chapters)")
B("en-4-ali-baba", "en", "4", "fairy", "Ali Baba and the Forty Thieves", "Andrew Lang, Blue Fairy Book (1889)", 503, pick=["THE FORTY THIEVES"], icon="🏺", cat="Ali Baba and the Forty Thieves")
B("en-4-burgess-animal", "en", "4", "nonfiction", "The Burgess Animal Book for Children", "Thornton W. Burgess (1920)", 2441, split=r"^CHAPTER [IVXL]+", icon="🦝", cat="The Burgess Animal Book for Children (selected chapters)")
B("en-4-bad-child-beasts", "en", "4", "poetry", "The Bad Child's Book of Beasts (funny verse)", "Hilaire Belloc (1896)", 27175, nl=2, poem=True, group=6, minw=20, icon="🦁", star=True,
  cat="The Bad Child's Book of Beasts (funny verse)", skip_heads=[r"^THE$", r"^INTRODUCTION"])
B("en-4-snow-queen", "en", "4", "seasons", "The Snow Queen (winter)", "Hans Christian Andersen, tr. 1909", 1597, pick=["THE SNOW QUEEN"], icon="❄️", season="winter", cat="The Snow Queen (winter)")
for head, ic in [("BEAUTY AND THE BEAST", "🌹"), ("EAST OF THE SUN AND WEST OF THE MOON", "🧭"), ("THE PRINCESS ON THE GLASS HILL", "🏔️")]:
    B("en-4-lang-" + re.sub(r"\W+", "-", head.lower()).strip("-"), "en", "4", "bedtime", nice_title(head, "en"), "Andrew Lang, Blue Fairy Book (1889)", 503, pick=[head], icon=ic)
B("en-4-nightingale", "en", "4", "bedtime", "The Nightingale", "Hans Christian Andersen, tr. H. P. Paull (1872)", 27200, pick=["THE NIGHTINGALE"], icon="🐦")
# grade 5
B("en-5-treasure-island", "en", "5", "adventure", "Treasure Island", "Robert Louis Stevenson (1883)", 120, split=r"^\d+$", icon="🏴‍☠️", cat="Treasure Island (chapters)", titles="next")
B("en-5-peter-wendy", "en", "5", "adventure", "Peter and Wendy", "J. M. Barrie (1911)", 26654, split=r"^CHAPTER [IVXL]+$", icon="🧚", cat="Peter and Wendy (chapters)", titles="next")
B("en-5-wind-willows", "en", "5", "adventure", "The Wind in the Willows", "Kenneth Grahame (1908)", 289, split=r"^[IVXL]+\.\s+[A-Z‘]", icon="🐸", cat="The Wind in the Willows (chapters)")
B("en-5-robin-hood", "en", "5", "adventure", "The Merry Adventures of Robin Hood", "Howard Pyle (1883)", 964, icon="🏹", cat="The Merry Adventures of Robin Hood (selected)", skip_heads=[r"^PREFACE", r"^CONTENTS", r"^Epilogue"])
B("en-5-sherlock", "en", "5", "adventure", "The Adventures of Sherlock Holmes: The Red-Headed League, The Blue Carbuncle", "Arthur Conan Doyle (1892)", 1661,
  pick=["ADVENTURE II. THE RED-HEADED LEAGUE", "VII. THE ADVENTURE OF THE BLUE CARBUNCLE"], icon="🔎", cat="The Adventures of Sherlock Holmes (selected: The Red-Headed League, The Blue Carbuncle)")
B("en-5-black-beauty", "en", "5", "animal", "Black Beauty", "Anna Sewell (1877)", 271, split=r"^\d\d [A-Z]", icon="🐴", cat="Black Beauty (chapters)")
B("en-5-call-wild", "en", "5", "animal", "The Call of the Wild", "Jack London (1903)", 215, split=r"^Chapter [IVX]+\.", icon="🐕", cat="The Call of the Wild (chapters)")
B("en-5-secret-garden", "en", "5", "everyday", "The Secret Garden", "Frances Hodgson Burnett (1911)", 113, split=r"^CHAPTER [IVXL]+$", icon="🗝️", cat="The Secret Garden (chapters)", titles="next")
B("en-5-little-princess", "en", "5", "everyday", "A Little Princess", "Frances Hodgson Burnett (1905)", 146, split=r"^\d+$", icon="👧", cat="A Little Princess (chapters)", titles="next")
B("en-5-railway-children", "en", "5", "everyday", "The Railway Children", "E. Nesbit (1906)", 1874, split=r"^Chapter [IVXL]+\.", icon="🚂", cat="The Railway Children (chapters)")
B("en-5-anne", "en", "5", "everyday", "Anne of Green Gables", "L. M. Montgomery (1908)", 45, split=r"^CHAPTER [IVXL]+\.", icon="🍁", cat="Anne of Green Gables (chapters)")
B("en-5-little-women", "en", "5", "everyday", "Little Women", "Louisa May Alcott (1868)", 514, split=r"^CHAPTER [A-Z\-]+$", icon="📚", cat="Little Women (chapters)", titles="next")
B("en-5-tom-sawyer", "en", "5", "everyday", "The Adventures of Tom Sawyer", "Mark Twain (1876)", 74, split=r"^CHAPTER [IVXL]+$", icon="🎣", cat="The Adventures of Tom Sawyer (chapters)")
B("en-5-cautionary", "en", "5", "poetry", "Cautionary Tales for Children (funny verse)", "Hilaire Belloc (1907)", 27424, poem=True, minw=40, icon="⚠️", star=True,
  cat="Cautionary Tales for Children (funny verse)", skip_heads=[r"^INTRODUCTION"])
B("en-5-pied-piper", "en", "5", "poetry", "The Pied Piper of Hamelin", "Robert Browning (1842)", 18343, whole=True, poem=True, icon="🐀", cat="The Pied Piper of Hamelin", start=r"^Hamelin Town")
B("en-5-sleepy-hollow", "en", "5", "seasons", "The Legend of Sleepy Hollow (Halloween)", "Washington Irving (1820)", 41, whole=True, icon="🎃", season="halloween",
  cat="The Legend of Sleepy Hollow (Halloween)", start=r"^In the bosom of one", end=r"^POSTSCRIPT")
B("en-5-christmas-carol", "en", "5", "seasons", "A Christmas Carol", "Charles Dickens (1843)", 46, split=r"^STAVE [IVX]+", icon="🕯️", season="winter", cat="A Christmas Carol (abridged chapters)")
B("en-5-gift-magi", "en", "5", "seasons", "The Gift of the Magi", "O. Henry (1905)", 2776, pick=["THE GIFT OF THE MAGI"], icon="🎁", season="winter", cat="The Gift of the Magi")

B("en-k-lullabies", "en", "K", "bedtime", "Mother Goose Lullabies", "The Real Mother Goose (1916)", 10607, pick=["HUSH-A-BYE", "SLEEP, BABY, SLEEP", "WEE WILLIE WINKIE", "THE MAN IN THE MOON"],
  split=r"^[A-Z][A-Z0-9 ,'’.!?\-&]{2,}$", poem=True, minw=8, single=True, icon="🌛")
B("en-3-swineherd", "en", "3", "bedtime", "The Swineherd", "Hans Christian Andersen, tr. 1909", 1597, pick=["THE SWINEHERD"], icon="🐖")
B("en-4-little-mermaid", "en", "4", "bedtime", "The Little Mermaid", "Hans Christian Andersen, tr. H. P. Paull (1872)", 27200, pick=["THE LITTLE MERMAID"], icon="🧜‍♀️")

# ── Español ──
B("es-3-samaniego", "es", "3", "fables", "Fábulas: La cigarra y la hormiga, La lechera, El cuervo y el zorro", "Félix María Samaniego (1781)", 55206,
  split=r"^FÁBULA [IVXL]+$", titles="next", pick=["La Cigarra y la Hormiga", "La Lechera", "El Cuervo y el Zorro"], poem=True, minw=20, icon="🐜", cat="Fábulas: La cigarra y la hormiga, La lechera, El cuervo y el zorro")
B("es-3-iriarte", "es", "3", "fables", "Fábulas: El burro flautista, Los dos conejos", "Tomás de Iriarte (1782)", 29497, split=r"^FÁBULA [IVXL]+$", pick=["El Burro flautista", "Los dos Conejos"], poem=True,
  minw=20, icon="🐰", cat="Fábulas: El burro flautista, Los dos conejos", titles="next")
for sid, head, ic, cat, g, gen in [("es-3-bebe-pomposo", "Bebé y el señor don Pomposo", "👶", "Bebé y el señor don Pomposo", "3", "everyday"),
                                   ("es-3-nene-traviesa", "Nené traviesa", "🎀", "Nené traviesa", "3", "everyday"),
                                   ("es-3-cuentos-elefantes", "Cuentos de elefantes", "🐘", "Cuentos de elefantes", "3", "nonfiction"),
                                   ("es-4-menique", "Meñique", "🪓", "Meñique", "4", "fairy"),
                                   ("es-4-camaron", "El camarón encantado", "🦐", "El camarón encantado", "4", "fairy"),
                                   ("es-4-muneca-negra", "La muñeca negra", "🪆", "La muñeca negra", "5", "everyday"),
                                   ("es-4-tres-heroes", "Tres héroes", "🎖️", "Tres héroes: Bolívar, Hidalgo, San Martín", "4", "nonfiction"),
                                   ("es-4-juego-nuevo", "Un juego nuevo y otros viejos", "🎲", "Un juego nuevo y otros viejos", "4", "nonfiction"),
                                   ("es-4-zapaticos", "Los zapaticos de rosa", "🩰", "Los zapaticos de rosa", "4", "poetry"),
                                   ("es-5-dos-ruisenores", "Los dos ruiseñores", "🐦", "Los dos ruiseñores", "5", "fairy"),
                                   ("es-5-cuchara-tenedor", "Historia de la cuchara y el tenedor", "🍴", "Historia de la cuchara y el tenedor", "5", "nonfiction"),
                                   ("es-5-iliada", "La Ilíada, de Homero", "🏛️", "La Ilíada, de Homero", "5", "adventure")]:
    B(sid, "es", g, gen, cat if sid != "es-4-tres-heroes" else "Tres héroes: Bolívar, Hidalgo, San Martín", "José Martí, La Edad de Oro (1889)", 19898, pick=[head], icon=ic, cat=cat,
      poem=(sid == "es-4-zapaticos"))
B("es-4-raton-perez", "es", "4", "fairy", "Ratón Pérez", "Luis Coloma (1894)", 36558, whole=True, icon="🐭", cat="Ratón Pérez", start=r"^(Había una vez|HABÍA una vez|Hubo una vez|HUBO una vez|Érase)")
B("es-5-platero", "es", "5", "everyday", "Platero y yo", "Juan Ramón Jiménez (1914)", 39209, split=r"^[IVXLC]+$", titles="next", group=4, minw=40, icon="🫏",
  cat="Platero y yo (capítulos escogidos)")
B("es-5-corazon", "es", "5", "adventure", "De los Apeninos a los Andes; El pequeño escribiente florentino; El tamborcillo sardo", "Edmondo De Amicis, Corazón (1886), trad. española", 73486,
  pick=["EL PEQUEÑO ESCRIBIENTE FLORENTINO", "EL TAMBORCILLO SARDO", "DE LOS APENINOS A LOS ANDES"], icon="🏔️", cat="De los Apeninos a los Andes; El pequeño escribiente florentino; El tamborcillo sardo")

# ───────────────────────── extraction ─────────────────────────
def norm_head(s): return re.sub(r"[^\w]+|_", " ", s.lower().replace("’", "'")).strip()

def extract(r):
    t = body(r["src"]); lang = r["lang"]
    if r["whole"]:
        lines = t.split("\n")
        si = 0
        if r["start"]:
            si = next((i for i, l in enumerate(lines) if re.match(r["start"], l.strip())), 0)
        ei = len(lines)
        if r["end"]:
            ei = next((i for i, l in enumerate(lines) if i > si and re.match(r["end"], l.strip())), len(lines))
        txt = "\n".join(lines[si:ei])
        txt = re.split(r"\n\s*THE END\s*\n", txt)[0]
        return [(r["title"], txt)]
    if r["start"]:
        m = re.search(r["start"], t, re.M)
        if m: t = t[m.start():]
    ch = chunks_by_regex(t, r["split"]) if r["split"] else chunks_by_blank(t, r["nl"])
    out = []
    for head, txt in ch:
        if not head: continue
        if re.match(FRONT, head.strip().strip("#"), re.I): continue
        if r["skip_heads"] and any(re.match(p, head) for p in r["skip_heads"]): continue
        # title: bare heads take the next short line
        lines = [l for l in txt.split("\n")]
        title = head
        if r["titles"] == "next" or is_bare_head(head):
            k = 0
            while k < len(lines) and not lines[k].strip(): k += 1
            if k < len(lines) and 0 < len(lines[k].strip()) <= 70 and not re.search(r"[.,;]$", lines[k].strip()) or (k < len(lines) and r["titles"] == "next" and len(lines[k].strip()) <= 70):
                title = head + " " + lines[k].strip() if is_bare_head(head) and r["titles"] != "next" else (lines[k].strip() if r["titles"] == "next" else head)
                lines = lines[k + 1:]
        # drop leading subtitle lines that are all caps (e.g. "THE OWL AND THE PUSSY-CAT.")
        out.append([title, "\n".join(lines), head])
    # merge sections that are continuations (heads that are really body text)
    merged = []
    for title, txt, head in out:
        if merged and (len(title) > 80 or (title[:1].islower())):
            merged[-1][1] += "\n\n" + title + "\n" + txt; continue
        merged.append([title, txt, head])
    out = [(a, b, c) for a, b, c in merged if wc(b) >= r["minw"]]
    if r["pick"]:
        sel = []
        for p in r["pick"]:
            np_ = norm_head(p)
            hit = next(((a, b) for a, b, c in out if norm_head(a).startswith(np_) or norm_head(c).startswith(np_)), None)
            if not hit: print(f"   !! {r['id']}: missing section {p!r}"); continue
            sel.append(hit)
        out = sel
    else: out = [(a, b) for a, b, c in out]
    return out

def build_recipe(r, name_pool):
    lang, grade = r["lang"], r["grade"]
    secs = extract(r)
    if not secs: return None, "no sections"
    chapters, dropped = [], []
    for title, txt in secs:
        paras = paragraphs(txt, lang, r["poem"])
        paras, was_edited, bad = screen_paras(paras, lang)
        if paras is None: dropped.append((title, bad)); continue
        if was_edited: r["_edited"] = True
        # strip leading heading-ish lines that repeat the title
        while paras and len(paras[0]) < 70 and (norm_head(paras[0]) in norm_head(title) or norm_head(title) in norm_head(paras[0])) and "\n" not in paras[0]:
            paras.pop(0)
        if not paras: continue
        chapters.append([nice_title(title, lang), paras])
    if not chapters: return None, f"all screened ({dropped[:2]})"
    # grouping (poem collections) and single-chapter merges
    if r["group"] or r["single"]:
        size = len(chapters) if r["single"] else r["group"]
        grouped = []
        for i in range(0, len(chapters), size):
            block = chapters[i:i + size]
            paras = []
            for t_, ps in block: paras += [f"## {t_}"] + ps
            ttl = r["title"] if r["single"] else (block[0][0] if len(block) == 1 else f"{block[0][0]} …")
            grouped.append([ttl, paras])
        chapters = grouped
    # split very long chapters into parts at paragraph boundaries (quiz cadence)
    cap = PART[grade]; final = []
    for t_, ps in chapters:
        total = sum(wc(p) for p in ps)
        if total <= cap * 1.3: final.append([t_, ps]); continue
        nparts = max(2, round(total / cap)); target = total / nparts; cur = []; n = 0; k = 1
        for p in ps:
            cur.append(p); n += wc(p)
            if n >= target and k < nparts: final.append([f"{t_} ({'parte' if lang == 'es' else 'part'} {k})", cur]); cur = []; n = 0; k += 1
        if cur: final.append([f"{t_} ({'parte' if lang == 'es' else 'part'} {k})" if k > 1 else t_, cur])
    chapters = final
    # pages
    book_text = " ".join(" ".join(ps) for _, ps in chapters)
    book_names = [n for n, c in names_in(book_text).most_common(40) if c >= 2]
    name_pool.setdefault(lang, Counter()).update({n: 1 for n in book_names})
    words = Counter(w for w in re.findall(r"\b[a-záéíóúñ]+\b", book_text) if len(w) >= 5)
    book_words = [w for w, c in words.most_common(400) if c <= 6]
    out = []
    for t_, ps in chapters:
        pages = paginate(ps, grade)
        if not pages: continue
        out.append({"title": t_, "pages": pages, "_names": book_names, "_words": book_words})
    return out, dropped

def node_authored():
    files = sorted(f for f in os.listdir(os.path.join(HERE, "authored")) if f.endswith(".js"))
    js = "global.window={SHELLFIE_STORIES:[]};" + "".join(f"require({json.dumps(os.path.join(HERE, 'authored', f))});" for f in files) + "process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));"
    return json.loads(subprocess.check_output(["node", "-e", js]))

SEASON_KEYS = [("halloween", "halloween"), ("jack-o", "halloween"), ("muertos", "muertos"), ("catrina", "muertos"), ("calaver", "muertos"), ("cempas", "muertos"),
               ("thanksgiving", "thanksgiving"), ("lunar", "lunar"), ("reyes", "reyes"), ("rosca", "reyes"), ("christmas", "winter"), ("navidad", "winter"),
               ("nochebuena", "winter"), ("posadas", "winter"), ("st. nicholas", "winter"), ("villancico", "winter"), ("hanukkah", "winter"), ("jingle", "winter"),
               ("snow", "winter"), ("nieves", "winter"), ("winter", "winter"), ("diwali", "diwali"), ("septiembre", "independencia"), ("grito", "independencia"),
               ("fall", "fall"), ("otoño", "fall"), ("appleseed", "fall"), ("seasons", "spring"), ("estaciones", "spring"), ("months", "spring"), ("magi", "winter")]
def season_of(t):
    tl = t.lower()
    for k, v in SEASON_KEYS:
        if k in tl: return v
    return "any"

# ───────────────────────── main ─────────────────────────
def main():
    base = json.load(open(os.path.join(HERE, "catalog_base.json"), encoding="utf-8"))
    extra = json.load(open(os.path.join(HERE, "catalog_extra.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".json"): os.remove(os.path.join(OUT, f))
    # catalog: base (doc) + extra (new titles), entries are dicts t,a,l,g,u,star?
    cat = {L: {g: [dict(e) for e in base[L][g]] + [dict(e) for e in extra.get(L, {}).get(g, [])] for g in "K12345"} for L in ("en", "es")}
    books = {}
    name_pool = {}
    report = []
    for r in R:
        try:
            chs, dropped = build_recipe(r, name_pool)
        except FileNotFoundError:
            report.append(f"!! {r['id']}: source missing"); continue
        if not chs: report.append(f"!! {r['id']}: {dropped}"); continue
        credit = (f"From Project Gutenberg eBook #{r['src']} (public domain in the US). " if r['lang'] == 'en' else f"Del libro electrónico #{r['src']} de Project Gutenberg (dominio público en EE. UU.). ")
        if r["lang"] == "es": credit += "Ortografía actualizada a las normas actuales. "
        if r.get("_edited"): credit += ("A few passages with dated language were removed or lightly updated. " if r["lang"] == "en" else "Se quitaron o actualizaron algunos pasajes con lenguaje anticuado. ")
        if dropped: credit += ("Some chapters with dated, hurtful language were left out. " if r["lang"] == "en" else "Se omitieron algunos capítulos con lenguaje anticuado u ofensivo. ")
        books[r["id"]] = dict(id=r["id"], lang=r["lang"], grade=r["grade"], genre=r["genre"], title=r["title"], author=r["author"], credit=credit.strip(),
                              icon=r["icon"] or None, season=r["season"] or (season_of(r["title"]) if r["genre"] == "seasons" else None), daily=r["daily"] or None,
                              src=GUT.format(r["src"]), note=r["note"], chapters=chs, human=True, _recipe=r)
        report.append(f"   {r['id']}: {len(chs)} ch, {sum(len(c['pages']) for c in chs)} pages, {sum(wc(' '.join(c['pages'])) for c in chs)} words" + (f"  (dropped {len(dropped)}: {', '.join(d[1] for d in dropped[:4])})" if dropped else ""))
    # These reviewed, age-appropriate retellings replace the longer original editions.
    preferred_retellings = {"en-1-tortoise-hare", "en-1-lion-mouse"}
    for s in node_authored():
        if s["id"] in books and s["id"] not in preferred_retellings: continue
        s["human"] = False
        books[s["id"]] = s
    # Apply approved changes before generating quizzes so evidence reflects the adaptation.
    for b in books.values():
        adapt_story(b)
        adapt_gingerbread(b)
    # quizzes: authored if present (and verified), else generated
    authored_q = json.load(open(os.path.join(HERE, "quizzes.json"), encoding="utf-8")) if os.path.exists(os.path.join(HERE, "quizzes.json")) else {}
    for b in books.values():
        lang, grade = b["lang"], b["grade"]
        pool = [n for n, _ in name_pool.get(lang, Counter()).most_common(300)]
        for ci, ch in enumerate(b["chapters"]):
            text = " ".join(ch["pages"])
            q = None
            if b["id"] in authored_q and ci < len(authored_q[b["id"]]):
                q = authored_q[b["id"]][ci]
                missing = [x["ev"] for x in q if x.get("ev") and x["ev"] not in text]
                if missing: report.append(f"!! quiz ev not found in {b['id']} ch{ci}: {missing[0][:60]}"); q = None
            if q is None and ch.get("quiz"):
                q = ch["quiz"]
            if q is None:
                q = auto_quiz(ch["pages"], ch.get("_names", []), pool, ch.get("_words", []), lang, grade, bool(b.get("_recipe", {}).get("poem")))
            ch["quiz"] = q
            ch.pop("_names", None); ch.pop("_words", None)
        adapt_quiz(b)
    # write books + link catalog
    def find_entry(L, g, title):
        for e in cat[L][g]:
            if e["t"] == title: return e
        return None
    for b in books.values():
        r = b.pop("_recipe", None)
        L, g = b["lang"], b["grade"]
        e = find_entry(L, g, (r or {}).get("cat") or b.get("cat") or b["title"])
        if not e:
            e = {"t": b["title"], "a": b["author"], "l": "Public domain" if b.get("human") else "Original", "g": b["genre"], "u": b.get("src", "")}
            cat[L][g].append(e)
        e.update({"t": b["title"], "a": b["author"], "g": b["genre"], "id": b["id"], "icon": b.get("icon"), "pc": [len(c["pages"]) for c in b["chapters"]]})
        if b.get("src"): e["u"] = b["src"]
        if b.get("human"): e["h"] = 1
        if b["id"] in preferred_retellings:
            e["l"] = "Original adaptation"
            e.pop("h", None); e.pop("u", None)
        if b.get("daily"): e["d"] = 1
        if r and r.get("star"): e["star"] = 1
        if b["genre"] == "seasons": e["s"] = b.get("season") or season_of(b["title"])
        b.pop("cat", None)
        with open(os.path.join(OUT, b["id"] + ".json"), "w", encoding="utf-8") as f:
            json.dump({k: v for k, v in b.items() if v is not None}, f, ensure_ascii=False, separators=(",", ":"))
    for L in cat:
        for g in cat[L]:
            for e in cat[L][g]:
                if e["g"] == "seasons" and "s" not in e: e["s"] = season_of(e["t"])
                e.pop("star", None) if not e.get("star") else None
                for k in [k for k, v in e.items() if v in (None, "", [])]: e.pop(k)
    with open(os.path.join(ROOT, "catalog.js"), "w", encoding="utf-8") as f:
        f.write("/* Shellfie catalog: generated by tools/build_library.py. Entries with an id are readable (books/<id>.json). */\n")
        f.write("window.SHELLFIE_CATALOG = " + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("\n".join(report))
    n = sum(1 for L in cat for g in cat[L] for e in cat[L][g] if e.get("id"))
    tot = sum(len(cat[L][g]) for L in cat for g in cat[L])
    print(f"\nreadable {n} / {tot} catalog titles; books dir {sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) // 1024} KB")

if __name__ == "__main__":
    main()
