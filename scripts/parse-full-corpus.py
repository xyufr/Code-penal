"""Parse the retained droit.org LEGI mirror; never infer individual effective dates."""
import json,re,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
source=ROOT/'data/source/droit-code-penal.html'
ns={'x':'http://www.w3.org/1999/xhtml'}
root=ET.fromstring(source.read_text())
body=root.find('x:body',ns)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def text(el):return clean(''.join(el.itertext()))
def paragraphs(el):
    parts=[];current=[]
    def flush():
        s=clean(''.join(current));current.clear()
        if s:parts.append(s)
    def visit(node):
        if node.text:current.append(node.text)
        for c in node:
            block=c.tag.split('}')[-1] in ('p','div','br')
            if block:flush()
            visit(c)
            if block:flush()
            if c.tail:current.append(c.tail)
    visit(el);flush();return parts
books=[];groups=[];articles=[];hierarchy={};group_map={};book=None;part=''
for el in body:
    tag=el.tag.split('}')[-1]
    if re.fullmatch(r'h[2-9]',tag):
        level=int(tag[1:]);hierarchy={k:v for k,v in hierarchy.items() if k<level};hierarchy[level]=text(el)
        if level==2:part=text(el)
        if level==3:
            raw=text(el);match=re.match(r'Livre ([^:]+) : (.+)',raw)
            book={'id':len(books)+1,'roman':match[1].replace('Ier','I') if match else str(len(books)+1),'title':{'fr':match[2] if match else raw},'part': 'legislative' if 'législative' in part else 'regulatory','partTitle':{'fr':part}}
            books.append(book)
    if tag!='dl' or el.get('class')!='article':continue
    aid=el.get('id');content=el.find('x:dd[@class="main"]',ns);paras=paragraphs(content)
    if not paras:raise ValueError('Empty article '+aid)
    # droit.org has an extra digit in this cross-reference; verified against official PDF.
    if aid=='R131-2':paras=[p.replace('article R. 1231 du code de la route','article R. 123 du code de la route') for p in paras]
    source_url=el.find('.//x:a[@rel="source"]',ns).get('href').replace('https://legifrance.','https://www.legifrance.')
    snapshot=re.search(r'/(\d{4}-\d{2}-\d{2})$',source_url)[1]
    path=[v for k,v in sorted(hierarchy.items())]
    group_path=tuple(v for k,v in sorted(hierarchy.items()) if k<=5)
    if group_path not in group_map:
        group={'id':f'g{len(groups)+1:03}','book':book['id'],'title':{'fr':re.sub(r'^[^:]+ : ','',group_path[-1])},'range':'','path':{'fr':list(group_path)},'articleIds':[]}
        groups.append(group);group_map[group_path]=group
    group=group_map[group_path];group['articleIds'].append(aid)
    articles.append({'id':aid,'group':group['id'],'title':{'fr':re.sub(r'^[^:]+ : ','',path[-1])},'text':{'fr':paras},'effectiveFrom':None,'snapshotDate':snapshot,'checkedAt':'2026-10-31','source':source_url,'translationStatus':'machine-unreviewed','translationProvider':'French source only; translation pending','related':[],'path':{'fr':path},'sourceId':re.search(r'LEGIARTI\d+',source_url)[0]})
for g in groups:
    ids=g.pop('articleIds');g['range']=ids[0] if len(ids)==1 else ids[0]+' – '+ids[-1]
ids={a['id'] for a in articles}
for a in articles:
    refs=re.findall(r'\b(?:[RD]\.?\s*)?\d{3}-\d+(?:-\d+)*(?: [A-C])?\b',' '.join(a['text']['fr']))
    a['related']=list(dict.fromkeys(re.sub(r'^([RD])\.?\s*',r'\1',v) for v in refs if re.sub(r'^([RD])\.?\s*',r'\1',v) in ids and v!=a['id']))[:12]
corpus={'schemaVersion':2,'edition':'complete','metadata':{'codeId':'LEGITEXT000006070719','snapshotDate':snapshot,'retrievedAt':'2026-10-31','sourceMirror':'https://codes.droit.org/HTML/Code%20p%C3%A9nal.html','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'officialPdf':'https://www.legifrance.gouv.fr/download/file/pdf/LEGITEXT000006070719.pdf/LEGI','lastOfficialUpdate':'2026-08-26','sourceCorrections':[{'article':'R131-2','change':'R. 1231 → R. 123','basis':'Official Légifrance PDF generated 2026-10-29'}],'scope':'Current legislative and regulatory provisions; repealed articles excluded.'},'books':books,'groups':groups,'articles':articles}
(ROOT/'data/staging').mkdir(exist_ok=True,parents=True)
(ROOT/'data/staging/full-fr.json').write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'articles':len(articles),'books':len(books),'groups':len(groups),'paragraphs':sum(len(a['text']['fr']) for a in articles),'snapshot':snapshot}))
