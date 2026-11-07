"""Checks the first Codex-authored queue books and their catalog integration."""
import json
import re
import subprocess
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]

class QueueBooksTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        js = 'global.window={SHELLFIE_STORIES:[]};require(process.argv[1]);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));'
        cls.books = []
        for filename in ('queue_codex.js', 'queue_codex_older.js'):
            cls.books.extend(json.loads(subprocess.check_output(['node','-e',js,str(root/'tools/authored'/filename)],text=True)))
        raw = (root/'catalog.js').read_text(encoding='utf-8')
        cls.catalog, _ = json.JSONDecoder().raw_decode(raw[raw.index('=')+1:].strip())

    def test_generated_books_match_sources_and_catalog(self):
        for book in self.books:
            with self.subTest(book=book['id']):
                generated = json.loads((root/'books'/f"{book['id']}.json").read_text(encoding='utf-8'))
                self.assertEqual(generated, dict(book,human=False))
                links = [e for e in self.catalog[book['lang']][book['grade']] if e.get('id') == book['id']]
                self.assertEqual(len(links),1)
                self.assertEqual(links[0]['t'],book['title'])
                for chapter in book['chapters']:
                    self.assertEqual(len(chapter['quiz']),3)
                    for q in chapter['quiz']:
                        self.assertIn(q['ev'],' '.join(chapter['pages']))
                        self.assertEqual(len(q['o']),3)
                        self.assertEqual(len(set(q['o'])),3)
                        self.assertIn(q['a'],range(3))
                    lower,upper={'K':(5,14),'1':(12,35),'3':(60,130),'5':(170,300)}[book['grade']]
                    for page in chapter['pages']:
                        n=len(re.findall(r"\b[\w]+(?:['’][\w]+)?\b",page))
                        self.assertTrue(lower<=n<=upper, f"{book['id']}: {n} words: {page}")

    def test_soup_is_not_advice_to_cook_stones(self):
        soup = next(b for b in self.books if b['id']=='en-1-stone-soup')
        self.assertIn('do not put stones in food',soup['credit'])
        self.assertIn('imagine', ' '.join(soup['chapters'][0]['pages']).lower())

if __name__=='__main__': unittest.main()
