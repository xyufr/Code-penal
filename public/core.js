export const languages = ['fr','zh','en'];
export function normalize(value) {
 return String(value).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[‐‑–—−]/g,'-').replace(/['’]/g,' ').replace(/\s+/g,' ').trim();
}
const indexes=new WeakMap();
const articleNumber=value=>normalize(value).replace(/^([rdl])\.?\s*/, '$1').replace(/\s+([a-z])$/, '$1');
export function searchArticles(articles,query,group='all',saved=null) {
 let index=indexes.get(articles);
 if(!index){index=articles.map((a,order)=>({a,order,id:articleNumber(a.id),title:normalize(Object.values(a.title).join(' ')),body:normalize(Object.values(a.text).flat().join(' '))}));indexes.set(articles,index);}
 const q=normalize(query).replace(/^(?:article|art\.?)\s+(?=[rdl\d])/,'').replace(/^第\s*(.+?)\s*条$/,'$1');
 const number=articleNumber(q),tokens=q.split(' ').filter(Boolean),savedSet=saved?new Set(saved):null;
 return index.filter(x=>(group==='all'||x.a.group===group)&&(!savedSet||savedSet.has(x.a.id)))
 .map(x=>{const exact=number===x.id,prefix=number&&x.id.startsWith(number),haystack=`${normalize(x.a.id)} ${x.id} ${x.title} ${x.body}`;
 return {...x,score:!q?0:exact?1000:prefix?500:x.title.includes(q)?100:1,match:exact||prefix||tokens.every(token=>haystack.includes(token))};})
 .filter(x=>x.match).sort((a,b)=>b.score-a.score||a.order-b.order).map(x=>x.a);
}
export function paginateArticles(articles,page=0,pageSize=30){const pages=Math.max(1,Math.ceil(articles.length/pageSize));const current=Math.max(0,Math.min(pages-1,Math.floor(page)||0));return {items:articles.slice(current*pageSize,(current+1)*pageSize),page:current,pages};}
export function validateCorpus(data) {
 const fail=message=>{throw new Error(message);};
 if(![1,2].includes(data?.schemaVersion)||!['selection','complete'].includes(data.edition))fail('Invalid schemaVersion or edition');
 for(const k of ['books','groups','articles'])if(!Array.isArray(data[k])||!data[k].length)fail(`Missing ${k}`);
 const ids=new Set(),groups=new Set(),books=new Set();
 const tri=(v,label,array=false)=>{for(const l of languages){const x=v?.[l];if(array?(!Array.isArray(x)||!x.length||x.some(p=>typeof p!=='string'||!p.trim())):(typeof x!=='string'||!x.trim()))fail(`${label}.${l} is required`);}};
 const date=(v,label)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail(`Invalid ${label}`);};
 for(const b of data.books){if(!Number.isInteger(b.id)||b.id<1||books.has(b.id)||!b.roman)fail('Invalid or duplicate book');books.add(b.id);tri(b.title,'book title');if(b.part&&!['legislative','regulatory'].includes(b.part))fail('Invalid part');}
 for(const g of data.groups){if(!/^[a-z0-9-]+$/.test(g.id)||groups.has(g.id)||!books.has(g.book)||typeof g.range!=='string')fail('Invalid group');groups.add(g.id);tri(g.title,'group title');}
 for(const a of data.articles){
  if(!/^(?:[LRD]\.?\s?)?\d+(?:-\d+)+(?: [A-Z])?$/.test(a.id)||ids.has(a.id))fail(`Invalid or duplicate article ${a.id}`);
  ids.add(a.id);if(!groups.has(a.group))fail(`Unknown group ${a.group}`);tri(a.title,`${a.id} title`);tri(a.text,`${a.id} text`,true);
  if(new Set(languages.map(l=>a.text[l].length)).size!==1)fail(`Unaligned paragraphs: ${a.id}`);
  if(data.schemaVersion===2&&a.effectiveFrom===null)date(a.snapshotDate,'snapshotDate');else date(a.effectiveFrom,'effectiveFrom');
  date(a.checkedAt,'checkedAt');let url;try{url=new URL(a.source);}catch{fail('Invalid source URL');}
  if(url.protocol!=='https:'||url.hostname!=='www.legifrance.gouv.fr')fail('Source must be Légifrance HTTPS');
  if(!['ai-unreviewed','machine-unreviewed','human-reviewed'].includes(a.translationStatus))fail('Missing translation status');if(!Array.isArray(a.related))fail('Missing related articles');
  if(a.path)tri(a.path,`${a.id} path`,true);
 }
 for(const a of data.articles)if(a.related.some(id=>!ids.has(id)))fail(`Unknown related article in ${a.id}`);
 if(data.schemaVersion===2&&data.edition==='complete'){
  const m=data.metadata;if(!m||m.articleCount!==data.articles.length)fail('Corpus article count mismatch');
  date(m.snapshotDate,'snapshotDate');
  if(m.coverage?.matchedArticles!==data.articles.length||m.coverage?.missingArticles!==0||m.coverage?.extraArticles!==0)fail('Complete corpus requires coverage verification');
 }
 return data;
}
