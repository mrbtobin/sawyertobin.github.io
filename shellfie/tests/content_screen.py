#!/usr/bin/env python3
"""Flag passages for contextual school suitability review, not a safety certification."""
import argparse
import json
import re
import sys
from pathlib import Path

BOOKS = Path(__file__).resolve().parents[1] / 'books'
# Deliberately conservative: these are review prompts, not judgments. Keep both
# languages and word boundaries; identity, religion, and anatomy are not violations.
RULES = {
    'sexual content': r'\b(?:pornograph\w*|sexual(?:ly)? assault|rape[ds]?|raping|molest(?:ed|ation)|violaci[oó]n sexual|abus[oa] sexual|pornograf[ií]a)\b',
    'self-harm': r'\b(?:suicid(?:e|al|io|arse)|kill (?:myself|yourself|himself|herself|themselves)|matarse|quitarse la vida)\b',
    'graphic violence or threats': r'\b(?:behead(?:ed|ing)?|decapitat\w*|disembowel\w*|tortur(?:e[ds]?|ing)|slaughter(?:ed|ing)?|murder(?:ed|ing)?|assassinat\w*|decapitad[oa]s?|torturad[oa]s?|asesinad[oa]s?)\b',
    'possible graphic injury': r'\b(?:body (?:into|in) (?:four )?(?:quarters|pieces)|sew(?:ed|n)? (?:the )?(?:body|quarters) (?:back )?together|poured (?:boiling|hot) oil|pierced (?:him|her|them) to the heart)\b',
    'violence for grade-level review': r'\b(?:kill(?:s|ed|ing)?|stab(?:s|bed|bing)?|shoot(?:s|ing)?|shot|strangl(?:e[ds]?|ing)|matar(?:on|lo|la|los|las)?|mat[oó]|apu[ñn]alad[oa]s?|dispar[oó]|disparar)\b|pierced (?:him|her|them) to the heart',
    'weapons and explosives': r'\b(?:firearms?|handguns?|pistols?|rifles?|shotguns?|machine guns?|bombs?|explosives?|pistolas?|escopetas?|fusiles?|bombas?|explosivos?)\b',
    'substances': r'\b(?:cocaine|heroin|methamphetamine|cannabis|marijuana|coca[ií]na|hero[ií]na|metanfetamina|marihuana)\b',
    'slurs and dehumanizing terms': r'\b(?:nigg(?:er|a)\w*|pickanin\w*|piccanin\w*|redskins?|injuns?|squaws?|chinks?|spics?|wetbacks?|faggots?|retards?|subhuman\w*|half[- ]breeds?|mulatto\w*|negritos?|negritas?)\b',
    'abuse and coercion': r'\b(?:child abuse|physically abus(?:e[ds]?|ing)|domestic violence|abus[oa] infantil|violencia dom[eé]stica)\b',
    'discriminatory or dehumanizing language': r'\b(?:racial(?:ly)? inferior|inferior race|racial superiority|white supremacy|inferioridad racial|supremac[ií]a blanca)\b',
    'sexual exploitation': r'\b(?:prostitut(?:e|ion)|sex traffick\w*|prostituci[oó]n|explotaci[oó]n sexual)\b',
}
COMPILED = {name: re.compile(pattern, re.IGNORECASE) for name, pattern in RULES.items()}


def fields(book):
    for ci, chapter in enumerate(book.get('chapters', []), 1):
        for pi, page in enumerate(chapter.get('pages', []), 1):
            yield f'chapter {ci}, page {pi}', page
        for qi, quiz in enumerate(chapter.get('quiz', []), 1):
            yield f'chapter {ci}, quiz {qi}, question', quiz.get('q', '')
            for oi, option in enumerate(quiz.get('o', []), 1):
                yield f'chapter {ci}, quiz {qi}, option {oi}', option
            yield f'chapter {ci}, quiz {qi}, evidence', quiz.get('ev', '')


def scan(book):
    for location, content in fields(book):
        if not isinstance(content, str):
            continue
        for category, pattern in COMPILED.items():
            for match in pattern.finditer(content):
                # A small amount of context aids review without duplicating a book.
                start, end = max(0, match.start() - 90), min(len(content), match.end() + 90)
                yield {'book': book.get('id'), 'title': book.get('title'), 'grade': book.get('grade'),
                       'language': book.get('lang'), 'book_source': 'book from public-domain source; quiz provenance may differ' if book.get('human') is True else 'Shellfie version / verify provenance' if book.get('human') is False else 'unknown',
                       'location': location, 'category': category, 'match': match.group(),
                       'context': content[start:end].replace('\n', ' ')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--books', type=Path, default=BOOKS)
    parser.add_argument('--json', action='store_true', help='emit machine-readable findings')
    args = parser.parse_args()
    paths = sorted(args.books.glob('*.json'))
    if not paths:
        print('No book JSON files found', file=sys.stderr); return 2
    findings = []
    for path in paths:
        try:
            with path.open(encoding='utf-8') as f: book = json.load(f)
            findings.extend(scan(book))
        except (OSError, ValueError, TypeError) as exc:
            print(f'Could not inspect {path}: {exc}', file=sys.stderr); return 2
    if args.json:
        print(json.dumps({'books_scanned': len(paths), 'findings': findings}, ensure_ascii=False, indent=2))
    else:
        for f in findings:
            print(f"{f['book']} | {f['location']} | {f['category']} | {f['book_source']} | {f['context']}")
        print(f'\n{len(paths)} books scanned; {len(findings)} matches require contextual review. No matches does not establish suitability.')
    return 1 if findings else 0


if __name__ == '__main__':
    sys.exit(main())
