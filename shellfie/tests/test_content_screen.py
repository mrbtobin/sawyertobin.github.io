import unittest
from content_screen import scan

class ContentScreenTests(unittest.TestCase):
    def test_story_and_all_quiz_fields_are_scanned_with_location(self):
        book = {'id': 'test', 'human': True, 'chapters': [{'pages': ['A pistol appeared.'], 'quiz': [
            {'q': 'Was there a bomb?', 'o': ['A rifle', 'A flower'], 'ev': 'A pistol appeared.'}]}]}
        found = list(scan(book))
        self.assertEqual([f['location'] for f in found], ['chapter 1, page 1', 'chapter 1, quiz 1, question', 'chapter 1, quiz 1, option 1', 'chapter 1, quiz 1, evidence'])
        self.assertTrue(all(f['book_source'] == 'book from public-domain source; quiz provenance may differ' for f in found))

    def test_spanish_and_no_identity_word_filter(self):
        book = {'human': False, 'chapters': [{'pages': ['Una pistola.', 'Una familia judía y un niño indígena.'], 'quiz': []}]}
        found = list(scan(book))
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]['match'], 'pistola')

    def test_unknown_provenance_is_not_guessed(self):
        self.assertEqual(next(scan({'chapters':[{'pages':['A bomb.']}]}))['book_source'], 'unknown')

if __name__ == '__main__':
    unittest.main()
