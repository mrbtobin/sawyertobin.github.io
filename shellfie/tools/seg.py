import re,sys
def body(t):
    t=t.replace('\r','')
    s=re.search(r'\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n',t) or re.search(r'\*END\*THE SMALL PRINT[^\n]*\n',t)
    e=re.search(r'\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG',t) or re.search(r'End of (the )?Project Gutenberg',t)
    return t[s.end() if s else 0: e.start() if e else len(t)]
def sections(t, nl=3):
    parts=re.split(r'\n(?:[ \t]*\n){%d,}'%nl, t)
    out=[]
    for p in parts:
        p=p.strip('\n')
        if not p.strip(): continue
        lines=[l for l in p.split('\n')]
        head=lines[0].strip()
        words=len(re.findall(r'\w+',p))
        out.append((head,words,p))
    return out
if __name__=='__main__':
    nl=int(sys.argv[2]) if len(sys.argv)>2 else 3
    t=body(open('.cache/'+sys.argv[1]+'.txt',encoding='utf-8').read())
    S=sections(t,nl)
    print(len(S),' | '.join(f'{h[:38]}({w})' for h,w,_ in S if w>40)[:5000])
