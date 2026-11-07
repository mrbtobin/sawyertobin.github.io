import re,sys
def body(t):
    s=re.search(r'\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n',t)
    e=re.search(r'\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG',t)
    if not s: s=re.search(r'\*END\*THE SMALL PRINT[^\n]*\n',t)
    if not e: e=re.search(r'End of (the )?Project Gutenberg',t)
    return t[s.end() if s else 0: e.start() if e else len(t)]
for f in sys.argv[1:]:
    t=body(open('.cache/'+f+'.txt',encoding='utf-8').read().replace('\r',''))
    lines=t.split('\n'); out=[]
    for i,l in enumerate(lines):
        x=l.strip()
        if not x or len(x)>70: continue
        prev=lines[i-1].strip() if i else ''; nxt=lines[i+1].strip() if i+1<len(lines) else ''
        up=sum(c.isupper() for c in x); lo=sum(c.islower() for c in x)
        if (prev=='' and nxt=='' and (up>lo*2 and up>=3)) or re.match(r'^(CHAPTER|Chapter|CAP[IÍ]TULO|STAVE|BOOK|PART)\b',x):
            out.append(f'{i}:{x}')
    print(f'== {f} ({len(out)})'); print(' | '.join(out[:int(sys.argv[0:1] and 400)][:160]))
