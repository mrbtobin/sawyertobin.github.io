import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from approved_adaptations import PASSAGES, CREDIT, OLD_OPTION, NEW_OPTION, adapt_story, adapt_quiz

class ApprovedAdaptationsTests(unittest.TestCase):
    def test_published_edits_are_reproducible_from_source_passages(self):
        for book_id, edits in PASSAGES.items():
            with self.subTest(book=book_id):
                published = json.loads((ROOT / 'books' / (book_id + '.json')).read_text(encoding='utf-8'))
                source = copy.deepcopy(published)
                source['credit'] = source['credit'].replace(' ' + CREDIT, '')
                for old, new in edits:
                    matches = [(ch, i) for ch in source['chapters'] for i, p in enumerate(ch['pages']) if new in p]
                    self.assertEqual(len(matches), 1, new)
                    ch, i = matches[0]
                    ch['pages'][i] = ch['pages'][i].replace(new, old, 1)
                if book_id == 'en-4-ali-baba':
                    q = source['chapters'][0]['quiz'][1]
                    i = q['o'].index(NEW_OPTION)
                    self.assertNotEqual(i, q['a'])
                    q['o'][i] = OLD_OPTION
                adapt_story(source); adapt_quiz(source)
                self.assertEqual(source, published)

    def test_adapted_ali_baba_quiz_and_key_scenes(self):
        book = json.loads((ROOT / 'books' / 'en-4-ali-baba.json').read_text(encoding='utf-8'))
        chapter = book['chapters'][0]
        text = ' '.join(chapter['pages'])
        for phrase in ('body into four quarters', 'sew the quarters together',
                       'poured enough oil into every jar', 'plunged the dagger into his heart'):
            self.assertNotIn(phrase, text)
        for question in chapter['quiz']:
            self.assertIn(question['ev'], text)
            self.assertIn(question['a'], range(len(question['o'])))
        self.assertLess(text.index('So she ran to the wife of Cassim and borrowed a measure.'),
                        text.index('saw the mark the robber had made'))
        self.assertLess(text.index('saw the mark the robber had made'),
                        text.index('Morgiana thanked him for his advice, took the oil pot'))

    def test_changed_source_fails_instead_of_silently_losing_edit(self):
        with self.assertRaises(ValueError):
            adapt_story({'id':'en-4-ali-baba','chapters':[{'pages':['changed']}], 'credit':''})

    def test_correct_answer_is_never_replaced_as_a_distractor(self):
        with self.assertRaises(ValueError):
            adapt_quiz({'id':'en-4-ali-baba','chapters':[{'quiz':[{'a':0,'o':[OLD_OPTION]}]}]})

if __name__ == '__main__': unittest.main()
