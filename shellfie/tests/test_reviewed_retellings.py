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

    def test_spanish_changes_and_grade_move_are_consistent(self):
        js='global.window={SHELLFIE_STORIES:[]};require(process.argv[1]);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));'
        source=json.loads(subprocess.check_output(['node','-e',js,str(root/'tools/authored/retellings.js')],text=True))
        ids={'es-1-leon-raton','es-5-regalo-reyes','es-3-volcanes'}
        for b in source:
            if b['id'] not in ids: continue
            built=json.loads((root/'books'/f"{b['id']}.json").read_text(encoding='utf-8'))
            self.assertEqual(built,dict(b,human=False))
            for q in b['chapters'][0]['quiz']: self.assertIn(q['ev'],' '.join(b['chapters'][0]['pages']))
        self.assertEqual(len([b for b in source if b['id'] in ids]),3)
        book=json.loads((root/'books'/'es-4-muneca-negra.json').read_text(encoding='utf-8'))
        self.assertEqual(book['grade'],'5')
        base=json.loads((root/'tools/catalog_base.json').read_text(encoding='utf-8'))
        self.assertEqual(len([e for e in base['es']['5'] if e['t']==book['title']]),1)
        self.assertFalse(any(e['t']==book['title'] for e in base['es']['4']))
        raw=(root/'catalog.js').read_text(encoding='utf-8'); catalog,_=json.JSONDecoder().raw_decode(raw[raw.index('=')+1:].strip())
        self.assertEqual(len([e for e in catalog['es']['5'] if e.get('id')==book['id']]),1)
        self.assertFalse(any(e.get('id')==book['id'] for e in catalog['es']['4']))

    def test_spanish_education_edits_match_sources(self):
        wanted={'es-k-conoce-buho','es-3-max-simulacros','es-2-cempasuchil'}
        js='global.window={SHELLFIE_STORIES:[]};for(const p of process.argv.slice(1))require(p);process.stdout.write(JSON.stringify(window.SHELLFIE_STORIES));'
        sources=[root/'tools/authored'/f for f in ('meet.js','mckinley_es.js','retellings.js')]
        books=json.loads(subprocess.check_output(['node','-e',js,*map(str,sources)],text=True))
        found=set()
        for b in books:
            if b['id'] not in wanted: continue
            found.add(b['id'])
            built=json.loads((root/'books'/f"{b['id']}.json").read_text(encoding='utf-8'))
            self.assertEqual(built,dict(b,human=False))
            for q in b['chapters'][0]['quiz']:
                self.assertIn(q['ev'],' '.join(b['chapters'][0]['pages']))
                self.assertIn(q['a'],range(len(q['o'])))
        self.assertEqual(found,wanted)

if __name__=='__main__': unittest.main()
