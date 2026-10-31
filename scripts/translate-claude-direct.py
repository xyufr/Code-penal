"""French -> Chinese or English translated by Claude directly, chunk by chunk. No pivot or live writes.

Export pending chunks: python3 scripts/translate-claude-direct.py --lang en --export
Claude writes data/staging/claude-<lang>/out/NNN.json as {"<id>": ["paragraph", ...]} for each in/NNN.json.
Labels (paths, titles) are translated once per segment: labels-<lang>.json is a list aligned with labels-fr.json
(built by scripts/claude-direct-labels.py).
Import and validate:   python3 scripts/translate-claude-direct.py --lang en --import
When every task is cached, writes data/staging/claude-<lang>-ready.json and claude-<lang>-coverage.json.
"""
import argparse, copy, hashlib, importlib.util, json, re, sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('direct',ROOT/'scripts/translate-direct-zh.py');direct=importlib.util.module_from_spec(spec);spec.loader.exec_module(direct)
MODEL='claude-opus-5-5'
PROMPT_EN='''Translate French criminal law directly into precise, plain British English legal prose; no intermediate language.
Preserve every condition, exception, negation, scope and penalty; do not summarise or add. Keep 1°, I., a) numbering, article references and figures exact.
Terms: crime=felony, délit=misdemeanour, contravention=petty offence, infraction=offence, réclusion criminelle=criminal imprisonment, détention criminelle=criminal detention, emprisonnement=imprisonment, amende=fine, personne physique/morale=natural/legal person, sursis=suspended sentence, sursis probatoire=probationary suspended sentence, travail d'intérêt général=community service, juge de l'application des peines=sentence enforcement judge, procureur de la République=public prosecutor.
Example: 1° 38 euros au plus pour les contraventions de la 1re classe ; -> 1° a fine of up to €38 for 1st class petty offences;'''
VERSIONS={'zh':MODEL+'-direct-fr-zh-v1-'+hashlib.sha256(direct.PROMPT.encode()).hexdigest()[:12],
 'en':MODEL+'-direct-fr-en-v1-'+hashlib.sha256(PROMPT_EN.encode()).hexdigest()[:12]}
TARGETS={'zh':'zh-Hans','en':'en'}

def valid(lang,fr,out):
 if not(isinstance(out,list) and len(fr)==len(out) and all(isinstance(p,str) and p.strip() for p in out)):return False
 return all(re.search(r'[㐀-鿿]',p) for p in out) if lang=='zh' else not any(re.search(r'[㐀-鿿]',p) for p in out)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--lang',choices=['zh','en'],default='zh');parser.add_argument('--export',action='store_true');parser.add_argument('--import',dest='load',action='store_true');parser.add_argument('--chunk-chars',type=int,default=10000)
 args=parser.parse_args();lang=args.lang;VERSION=VERSIONS[lang];WORK=ROOT/f'data/staging/claude-{lang}'
 (WORK/'in').mkdir(parents=True,exist_ok=True);(WORK/'out').mkdir(exist_ok=True)
 c=json.loads((ROOT/'public/data/articles.json').read_text());baseline=copy.deepcopy(c)
 objects=list(direct.multilingual(c));tasks={};labels={}
 for obj in objects:
  fr=obj['fr'] if isinstance(obj['fr'],list) else [obj['fr']];tasks[direct.sha([VERSION,fr])]=fr
 for item in [c['books'],c['groups'],c['articles']]:
  for o in item:
   for field in ['title','path','partTitle']:
    if field in o:labels.update(dict.fromkeys(o[field]['fr'] if isinstance(o[field]['fr'],list) else [o[field]['fr']]))
 db=sqlite3.connect(ROOT/f'data/staging/direct-fr-{lang}-claude.sqlite3');db.execute('CREATE TABLE IF NOT EXISTS translations(key TEXT PRIMARY KEY, source_fr TEXT, chinese TEXT, model TEXT, chunk TEXT)')
 def cached(k):
  row=db.execute('SELECT chinese FROM translations WHERE key=?',(k,)).fetchone()
  return json.loads(row[0]) if row else None
 if args.load:
  errors=[];names=json.loads((WORK/'labels-fr.json').read_text());values=json.loads((WORK/f'labels-{lang}.json').read_text()) if (WORK/f'labels-{lang}.json').exists() else []
  glossary={fr:out for fr,out in zip(names,values) if valid(lang,[fr],[out])}
  if len(glossary)!=len(names):errors.append(f'labels ({len(names)-len(glossary)} missing or invalid)')
  for k,fr in tasks.items():
   if all(p in glossary for p in fr):db.execute('INSERT OR REPLACE INTO translations VALUES(?,?,?,?,?)',(k,json.dumps(fr,ensure_ascii=False),json.dumps([glossary[p] for p in fr],ensure_ascii=False),MODEL,'labels'))
  for out in sorted((WORK/'out').glob('*.json')):
   chunk=json.loads((WORK/'in'/out.name).read_text());result=json.loads(out.read_text())
   for item in chunk:
    text=result.get(item['id'])
    if not valid(lang,item['fr'],text):errors.append(f"{out.name}#{item['id']}");continue
    db.execute('INSERT OR REPLACE INTO translations VALUES(?,?,?,?,?)',(item['key'],json.dumps(item['fr'],ensure_ascii=False),json.dumps(text,ensure_ascii=False),MODEL,out.stem))
  db.commit()
  if errors:print('Invalid or misaligned:',', '.join(errors),flush=True)
 pending=[(k,fr) for k,fr in tasks.items() if cached(k) is None]
 if args.export:
  for old in (WORK/'in').glob('*.json'):
   if not (WORK/'out'/old.name).exists():old.unlink()
  start=max([int(p.stem) for p in (WORK/'in').glob('*.json')]+[0])+1;chunks=[];chunk=[];length=0
  (WORK/'labels-fr.json').write_text(json.dumps(list(labels),ensure_ascii=False,indent=0)+'\n')
  for k,fr in pending:
   if all(p in labels for p in fr):continue
   n=sum(map(len,fr))
   if chunk and length+n>args.chunk_chars:chunks.append(chunk);chunk=[];length=0
   chunk.append({'id':str(len(chunk)+1),'key':k,'fr':fr});length+=n
  if chunk:chunks.append(chunk)
  for i,chunk in enumerate(chunks,start):(WORK/'in'/f'{i:03d}.json').write_text(json.dumps(chunk,ensure_ascii=False,indent=1)+'\n')
  print(f'{len(labels)} label segments and {len(chunks)} text chunks exported for {len(pending)} pending tasks.',flush=True)
 print(json.dumps({'lang':lang,'model':MODEL,'version':VERSION,'uniqueTasks':len(tasks),'pending':len(pending)}),flush=True)
 if pending:print('Partial results only; published data unchanged.',flush=True);return
 info={'model':MODEL,'version':VERSION,'sourceLanguage':'fr','targetLanguage':TARGETS[lang],'pivotLanguage':None}
 direct.finalize(c,baseline,objects,lambda fr:cached(direct.sha([VERSION,fr])),info,'Claude Opus 5.5','claude',lang)
if __name__=='__main__':main()
