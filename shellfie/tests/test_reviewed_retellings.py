import json
import subprocess
import unittest
from pathlib import Path

root=Path(__file__).resolve().parents[1]

class ReviewedRetellingsTests(unittest.TestCase):
    def test_generated_output_matches_preferred_authored_sources(self):
        js='global.window={SHELLFIE_STORIES:[]};require(process.argv[1]);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));'
        books=json.loads(subprocess.check_output(['node','-e',js,str(root/'tools/authored/retellings.js')],text=True))
        for b in books:
            if b['id'] not in {'en-1-tortoise-hare','en-1-lion-mouse'}: continue
            with self.subTest(book=b['id']):
                built=json.loads((root/'books'/f"{b['id']}.json").read_text(encoding='utf-8'))
                self.assertEqual(built,dict(b,human=False))
                for q in b['chapters'][0]['quiz']:
                    self.assertIn(q['ev'],' '.join(b['chapters'][0]['pages']))
                    self.assertIn(q['a'],range(len(q['o'])))
        self.assertEqual(len([b for b in books if b['id'] in {'en-1-tortoise-hare','en-1-lion-mouse'}]),2)

    def test_revised_originals_match_sources_and_quiz_evidence(self):
        wanted={'en-k-be-firefighter','en-k-be-teacher','en-k-meet-owl','en-k-meet-penguin'}
        js='global.window={SHELLFIE_STORIES:[]};for(const p of process.argv.slice(1))require(p);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));'
        source=json.loads(subprocess.check_output(['node','-e',js,str(root/'tools/authored/jobs.js'),str(root/'tools/authored/meet.js')],text=True))
        found=set()
        for book in source:
            if book['id'] not in wanted: continue
            found.add(book['id'])
            with self.subTest(book=book['id']):
                built=json.loads((root/'books'/f"{book['id']}.json").read_text(encoding='utf-8'))
                self.assertEqual(built,dict(book,human=False))
                for chapter in built['chapters']:
                    for q in chapter['quiz']:
                        self.assertIn(q['ev'],' '.join(chapter['pages']))
                        self.assertIn(q['a'],range(len(q['o'])))
        self.assertEqual(found,wanted)

    def test_emergency_story_matches_authored_source_and_quiz(self):
        js='global.window={SHELLFIE_STORIES:[]};require(process.argv[1]);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES.find(s=>s.id==="en-3-max-drills")));'
        b=json.loads(subprocess.check_output(['node','-e',js,str(root/'tools/authored/mckinley_en.js')],text=True))
        built=json.loads((root/'books'/'en-3-max-drills.json').read_text(encoding='utf-8'))
        self.assertEqual(built,dict(b,human=False))
        text=' '.join(b['chapters'][0]['pages'])
        self.assertIn('Drop, cover, and hold on', text)
        for q in b['chapters'][0]['quiz']:
            self.assertIn(q['ev'],text)
            self.assertIn(q['a'],range(len(q['o'])))

if __name__=='__main__': unittest.main()
