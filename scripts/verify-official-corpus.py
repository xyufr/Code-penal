"""Compare article identifiers and full normalized texts with the official PDF extraction."""
import json,re,unicodedata,difflib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
lines={}
for f in (ROOT/'data/source/official-chunks').glob('*.txt'):
 for line in f.read_text().splitlines():
  m=re.match(r'^L(\d+)(?:@[^:]+)?:\s?(.*)',line)
  if m:lines[int(m[1])]=m[2]
if not lines:
 retained=ROOT/'data/source/official-pdf-text.txt'
 if not retained.exists():raise RuntimeError('Official PDF extraction is missing')
 lines=dict(enumerate(retained.read_text().split('\n')))
missing=[n for n in range(11696) if n not in lines]
print('Lines',len(lines),'missing',len(missing),'sample',missing[:40])
full='\n'.join(lines[i] for i in sorted(lines))
(ROOT/'data/source/official-pdf-text.txt').write_text(full)
footer=r'Code pénal - Dernière modification le 26 août 2026 - Document généré le 29 octobre 2026'
full=re.sub(footer,'\n',full)
article_pattern=r'(?m)^Article ([RD]?\s?\d+(?:-\d+)+(?:\s[A-C])?)\s*$'
headings=list(re.finditer(article_pattern,full));official={}
for i,m in enumerate(headings):
 aid=re.sub(r'^([RD])\s+',r'\1',m[1]);body=full[m.end():headings[i+1].start() if i+1<len(headings) else len(full)]
 # The next section heading belongs to the following article, not to this one.
 body=re.split(r'(?m)^(?:Partie (?:législative|réglementaire)|Livre |Titre |Sous-titre |Chapitre |Section \d|Sous-section |Paragraphe \d)',body)[0]
 if aid in official:raise ValueError('Duplicate official article '+aid)
 official[aid]=body.strip()
corpus=json.loads((ROOT/'data/staging/full-fr.json').read_text());local={a['id']:' '.join(a['text']['fr']) for a in corpus['articles']}
def norm(s):return re.sub(r'[^\w]','',unicodedata.normalize('NFKC',s)).lower().replace('_','')
common=set(official)&set(local);different=[]
for aid in common:
 if norm(official[aid])!=norm(local[aid]):
  ratio=difflib.SequenceMatcher(None,norm(official[aid]),norm(local[aid]),autojunk=False).ratio()
  different.append({'id':aid,'ratio':round(ratio,5),'officialChars':len(official[aid]),'mirrorChars':len(local[aid])})
report={'officialPdf':'https://www.legifrance.gouv.fr/download/file/pdf/LEGITEXT000006070719.pdf/LEGI','officialGeneratedDate':'2026-10-29','officialLastUpdate':'2026-08-26','mirrorSnapshotDate':'2026-10-20','officialCount':len(official),'mirrorCount':len(local),'missingFromMirror':sorted(set(official)-set(local)),'extraInMirror':sorted(set(local)-set(official)),'normalizedExactMatches':len(common)-len(different),'textDifferences':sorted(different,key=lambda x:x['ratio']),'extractionMissingLineNumbers':missing}
(ROOT/'data/staging/coverage-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/staging/official-articles.json').write_text(json.dumps(official,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['textDifferences','extractionMissingLineNumbers']},ensure_ascii=False));print('Differences',json.dumps(report['textDifferences'][:30]))
