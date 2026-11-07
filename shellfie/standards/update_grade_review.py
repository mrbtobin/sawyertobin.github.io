#!/usr/bin/env python3
"""Create a book-by-book review worklist; word counts are triage data, not grade ratings."""
import csv
import json
import re
import statistics
from pathlib import Path

root = Path(__file__).resolve().parents[1]
output = root / 'standards' / 'grade-review.csv'
previous = {}
if output.exists():
    with output.open(encoding='utf-8', newline='') as f:
        previous = {row['id']: row for row in csv.DictReader(f)}
rows = []
for path in sorted((root / 'books').glob('*.json')):
    book = json.loads(path.read_text(encoding='utf-8'))
    pages = [p for ch in book.get('chapters', []) for p in ch.get('pages', [])]
    counts = [len(re.findall(r"\b[\w]+(?:['’][\w]+)?\b", p)) for p in pages]
    old = previous.get(book['id'], {})
    rows.append({'id':book['id'], 'title':book['title'], 'language':book['lang'], 'assigned_grade':book['grade'],
                 'chapters':len(book.get('chapters',[])), 'pages':len(pages), 'words_total':sum(counts),
                 'median_words_per_page':statistics.median(counts) if counts else '', 'max_words_per_page':max(counts,default=0),
                 'review_status':old.get('review_status') or 'not yet read for grade review',
                 'review_notes':old.get('review_notes','')})
fields = ['id','title','language','assigned_grade','chapters','pages','words_total','median_words_per_page','max_words_per_page','review_status','review_notes']
with output.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows)
print(f'{len(rows)} books inventoried; {sum(r["review_status"] == "not yet read for grade review" for r in rows)} remain unreviewed.')
