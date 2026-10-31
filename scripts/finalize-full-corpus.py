"""Gate the complete import on full source coverage and complete trilingual text."""
import json,re,hashlib,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
STAGE=ROOT/'data/staging'
c=json.loads((STAGE/'full-trilingual.json').read_text())
r=json.loads((STAGE/'coverage-report.json').read_text())
if r['missingFromMirror'] or r['extraInMirror'] or r['textDifferences'] or r['extractionMissingLineNumbers']:
 raise RuntimeError('Source coverage failed; refusing complete import')
fr=json.loads((STAGE/'full-fr.json').read_text())
def normalize(s):return re.sub(r'[^\w]','',s).lower()
base={a['id']:a for a in fr['articles']}
for a in c['articles']:
 if normalize(''.join(a['text']['fr']))!=normalize(''.join(base[a['id']]['text']['fr'])):raise ValueError('Changed French text: '+a['id'])
 for l in ['fr','en','zh']:
  if not a['text'].get(l) or any(not p.strip() for p in a['text'][l]):raise ValueError('Empty text '+a['id'])
 if len({len(a['text'][l]) for l in ['fr','en','zh']})!=1:raise ValueError('Misaligned paragraphs '+a['id'])
# Curated navigation labels; avoid low-quality machine translations of the main divisions.
book_labels={
'Dispositions générales':('总则','General provisions'),
'Des crimes et délits contre les personnes':('侵害人身的重罪与轻罪','Crimes and délits against persons'),
'Des crimes et délits contre les biens':('侵害财产的重罪与轻罪','Crimes and délits against property'),
"Des crimes et délits contre la nation, l'Etat et la paix publique":('危害国家、政府及公共安宁的重罪与轻罪','Crimes and délits against the nation, the State and public peace'),
'Des crimes et des délits de guerre':('战争重罪与轻罪','War crimes and délits'),
'Des autres crimes et délits':('其他重罪与轻罪','Other crimes and délits'),
'Des contraventions':('违警罪','Contraventions'),
"Dispositions relatives à l'outre-mer":('海外地区适用规定','Provisions relating to overseas territories')}
for b in c['books']:
 zh,en=book_labels[b['title']['fr']];b['title'].update(zh=zh,en=en)
# Adjacent articles in the same chapter are safe reading suggestions. Do not infer
# intra-code links from bare numbers that may instead refer to another code.
for i,a in enumerate(c['articles']):
 a['related']=[other['id'] for other in c['articles'][max(0,i-1):i+2] if other['group']==a['group'] and other['id']!=a['id']]

# Conservative warning, not a quality certification. Formatting differences may also trigger it.
def numbers(s):
 s=re.sub(r'(?<=\d)[\s\u00a0,，.](?=\d{3}(?:\D|$))','',s)
 return collections.Counter(re.findall(r'\d+',s))
warnings=[]
for a in c['articles']:
 if a['translationStatus']!='machine-unreviewed':continue
 original=numbers(' '.join(a['text']['fr']))
 targets=[l for l in ['en','zh'] if numbers(' '.join(a['text'][l]))!=original]
 if targets:
  a['translationWarnings']=[{'type':'numeric-review','languages':targets}]
  warnings.append({'article':a['id'],'languages':targets})
c['metadata']['coverage']={'matchedArticles':r['normalizedExactMatches'],'missingArticles':0,'extraArticles':0,'officialPdfGeneratedAt':r['officialGeneratedDate'],'normalization':'Unicode compatibility normalization; whitespace and punctuation ignored','verifiedAt':'2026-10-31'}
c['metadata']['translation']['numericReviewArticles']=len(warnings)
c['metadata']['translation']['explicitCorrections']=len(json.loads((ROOT/'data/source/translation-overrides.json').read_text()))
c['metadata']['translation']['numericCheckNote']='Conservative digit-token comparison; may flag formatting or spelled-out numbers. Not a legal translation review.'
# A concise reproducible public verification record, without duplicating the full corpus.
report={**r,'translation':c['metadata']['translation'],'numericReview':warnings,'corpusSha256':hashlib.sha256(json.dumps(c,ensure_ascii=False,sort_keys=True).encode()).hexdigest()}
(ROOT/'public/data/coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(STAGE/'full-ready.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'articles':len(c['articles']),'numericReviewArticles':len(warnings),'ready':str(STAGE/'full-ready.json')},ensure_ascii=False))
