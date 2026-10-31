"""Reproducible, offline, resumable draft translations. Never silently truncate input."""
import json,re,hashlib,time,sqlite3,os
from pathlib import Path
import ctranslate2,sentencepiece
ROOT=Path(__file__).resolve().parent.parent
STAGE=ROOT/'data/staging'
corpus=json.loads((STAGE/'full-fr.json').read_text())
seed=json.loads((ROOT/'data/source/initial-selection.json').read_text())
seed_by_id={a['id']:a for a in seed['articles']}
cache=sqlite3.connect(STAGE/'translations.sqlite3')
cache.execute('CREATE TABLE IF NOT EXISTS translations (key TEXT PRIMARY KEY, source TEXT, target TEXT, value TEXT, created TEXT)')
version='argos-1.9-ct2-int8-beam4-v1'
def key(text,lang):return hashlib.sha256((version+'\0'+lang+'\0'+text).encode()).hexdigest()
def cached(text,lang):
 r=cache.execute('SELECT value FROM translations WHERE key=?',(key(text,lang),)).fetchone()
 return r[0] if r else None
def put(text,lang,value):cache.execute('INSERT OR REPLACE INTO translations VALUES(?,?,?,?,?)',(key(text,lang),text,lang,value,time.strftime('%Y-%m-%dT%H:%M:%S')))
def norm(s):return re.sub(r'\s+','',s).replace('’',"'")
# Apply explicit AI corrections and completed final-batch translations; still unreviewed legally.
for correction in json.loads((ROOT/'data/source/translation-overrides.json').read_text()):
 put(correction['source'],'en',correction['en']);put(correction['en'],'zh',correction['zh'])
cache.commit()
# Retain earlier translations only when the entire original matches the imported original.
retained=set()
for a in corpus['articles']:
 old=seed_by_id.get(a['id'])
 if old and norm(''.join(old['text']['fr']))==norm(''.join(a['text']['fr'])) and old.get('text',{}).get('zh'):
  a['text']=old['text'];a['title']=old['title'];a['effectiveFrom']=old.get('effectiveFrom');a['translationStatus']=old['translationStatus'];a['translationProvider']=old.get('translationProvider','Initial AI-assisted translation');retained.add(a['id'])
# Collect all trilingual objects, including full hierarchy labels.
objects=[]
def collect(obj):
 if isinstance(obj,dict):
  if 'fr' in obj and isinstance(obj['fr'],(str,list)):
   objects.append(obj)
  else:
   for v in obj.values():collect(v)
 elif isinstance(obj,list):
  for v in obj:collect(v)
collect(corpus)
source_strings=list(dict.fromkeys(s for obj in objects if 'en' not in obj for s in (obj['fr'] if isinstance(obj['fr'],list) else [obj['fr']])))
started=time.time()
def translate_all(strings,target,pair):
 path=ROOT/'.translation-models'/f'translate-{pair}-1_9'
 tok=sentencepiece.SentencePieceProcessor(model_file=str(path/'sentencepiece.model'))
 model=ctranslate2.Translator(str(path/'model'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=4)
 missing=[s for s in strings if cached(s,target) is None]
 print(json.dumps({'target':target,'pending':len(missing),'total':len(strings)}),flush=True)
 for offset in range(0,len(missing),24):
  batch=missing[offset:offset+24];segments=[];owners=[]
  for i,s in enumerate(batch):
   # Split at sentence boundaries, then token-bound chunks as a fallback for very long legal sentences.
   sentences=re.split(r'(?<=[.!?;])\s+(?=[A-ZÀ-Ý0-9«"“])',s)
   for sentence in sentences:
    words=sentence.split();piece=[]
    for word in words:
     candidate=' '.join(piece+[word])
     if piece and len(tok.encode(candidate))>180:
      segments.append(tok.encode(' '.join(piece),out_type=str));owners.append(i);piece=[]
     piece.append(word)
    if piece:segments.append(tok.encode(' '.join(piece),out_type=str));owners.append(i)
  translated=model.translate_batch(segments,beam_size=4,batch_type='tokens',max_batch_size=2048,max_input_length=0,max_decoding_length=768,repetition_penalty=1.05)
  values=[[] for _ in batch]
  for owner,result in zip(owners,translated):
   tokens=result.hypotheses[0]
   if len(tokens)>=768:raise RuntimeError('Translation reached decoder limit; refusing truncated output')
   value=tok.decode(tokens).replace('▁',' ').strip()
   if not value:raise RuntimeError('Empty translation')
   values[owner].append(value)
  for s,parts in zip(batch,values):put(s,target,' '.join(parts))
  cache.commit()
  print(json.dumps({'target':target,'done':min(offset+24,len(missing)),'pendingTotal':len(missing),'elapsedSeconds':round(time.time()-started)}),flush=True)
 del model
translate_all(source_strings,'en','fr_en')
english=list(dict.fromkeys(cached(s,'en') for s in source_strings))
translate_all(english,'zh','en_zh')
for obj in objects:
 if 'en' in obj:continue
 def tr(s,l):
  en=cached(s,'en');return en if l=='en' else cached(en,'zh')
 for l in ['en','zh']:obj[l]=[tr(s,l) for s in obj['fr']] if isinstance(obj['fr'],list) else tr(obj['fr'],l)
corpus['metadata']['translation']={'engine':'Argos Translate 1.9 / CTranslate2 4.8.4','method':'French to English; English to Simplified Chinese','review':'Unreviewed machine drafts; initial translations retained when source matches','retainedInitialArticles':len(retained),'cacheVersion':version}
corpus['metadata']['articleCount']=len(corpus['articles'])
(STAGE/'full-trilingual.json').write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'complete':True,'articles':len(corpus['articles']),'retained':len(retained),'elapsedSeconds':round(time.time()-started)}),flush=True)
