"""User-approved edits to published source texts; see tests/content_review_2026-11-07.md."""
import json
from pathlib import Path

PASSAGES = {
    'en-1-365-bedtime': [
        ('If they didn’t like any one or imagined he might do them harm, they had him beheaded, and Bishop Valentine, as he was then called, was beheaded.',
         'The rulers punished people they saw as a threat. Bishop Valentine was punished and later died.'),
        ('His friends felt dreadfully that such a good man should be so cruelly murdered',
         'His friends were very sad that such a good man had died'),
        ('and although he was so cruelly beheaded, still his deeds of charity and kindness will always be known',
         'and his deeds of charity and kindness are still remembered'),
    ],
    'en-4-ali-baba': [
        ('The guide was so confounded that he knew not what answer to make, and when they returned he was at once beheaded for having failed.',
         'The guide was so confounded that he knew not what answer to make, and when they returned, the Captain sent him away.'),
    ],
}
PASSAGES['en-4-ali-baba'].extend(json.loads((Path(__file__).parent / 'ali_baba_approved_edits.json').read_text(encoding='utf-8')))

CREDIT = 'Selected passages were adapted for younger readers.'
OLD_OPTION = 'Two men must have known it; we have killed one, we must now find the other.'
NEW_OPTION = 'Morgiana saw the chalk mark on the door.'


def adapt_story(book):
    edits = PASSAGES.get(book['id'])
    if not edits:
        return
    for old, new in edits:
        pages = [(ch, i) for ch in book['chapters'] for i, page in enumerate(ch['pages']) if old in page]
        if len(pages) != 1:
            raise ValueError(f"{book['id']}: approved passage appears {len(pages)} times; review source before building")
        ch, index = pages[0]
        ch['pages'][index] = ch['pages'][index].replace(old, new, 1)
    if CREDIT not in book.get('credit', ''):
        book['credit'] = (book.get('credit', '').rstrip() + ' ' + CREDIT).strip()


def adapt_quiz(book):
    if book['id'] != 'en-4-ali-baba':
        return
    for chapter in book['chapters']:
        for question in chapter.get('quiz', []):
            for index, option in enumerate(question.get('o', [])):
                if option == OLD_OPTION:
                    if question.get('a') == index:
                        raise ValueError('Approved replacement is only valid for a distractor')
                    question['o'][index] = NEW_OPTION
