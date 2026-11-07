#!/usr/bin/env python3
"""Rebuild the published-books inventory; assignments are not review decisions."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
rows = []
for path in sorted((root / 'books').glob('*.json')):
    book = json.loads(path.read_text(encoding='utf-8'))
    rows.append({'id': book.get('id', path.stem), 'title': book.get('title', ''),
                 'language': book.get('lang', ''), 'assigned_grade': book.get('grade', ''),
                 'author': book.get('author', ''), 'source': book.get('src', ''),
                 'credit': book.get('credit', ''), 'review_status': 'not assessed by inventory'})
with (root / 'standards' / 'book-inventory.csv').open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, lineterminator='\n', fieldnames=list(rows[0]) if rows else ['id','title','language','assigned_grade','author','source','credit','review_status'])
    writer.writeheader(); writer.writerows(rows)
print(f'Inventoried {len(rows)} books; existing grades are provisional.')
