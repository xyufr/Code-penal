import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {searchArticles,validateCorpus,paginateArticles} from '../public/core.js';
import texts from '../public/i18n.js';
import corpus from '../scripts/seed.mjs';
const published=JSON.parse(await readFile(new URL('../public/data/articles.json',import.meta.url),'utf8'));
test('published corpus contains complete, aligned translations and valid references',()=>{assert.ok(validateCorpus(published).articles.length>0);});
test('article lookup ranks exact numbers over text references and accepts French or Chinese notation',()=>{for(const q of ['121-7','Article 121-7','第121-7条','121–7'])assert.equal(searchArticles(corpus.articles,q)[0].id,'121-7');});
test('cross-language search supports French accents, Chinese and English',()=>{for(const q of ['legitime defense','正当防卫','self-defence'])assert.ok(searchArticles(corpus.articles,q).some(a=>a.id==='122-5'));});
test('search combines collection, bookmarks and text filters',()=>{assert.deepEqual(searchArticles(corpus.articles,'盗窃','theft',['311-1']).map(a=>a.id),['311-1']);assert.equal(searchArticles(corpus.articles,'盗窃','principles').length,0);assert.equal(searchArticles(corpus.articles,'','all',[]).length,0);});
test('unmatched queries and HTML-like input do not return articles',()=>{assert.equal(searchArticles(corpus.articles,'not-a-real-query').length,0);assert.equal(searchArticles(corpus.articles,'<script>').length,0);});
test('import rejects missing translations, duplicate IDs, paragraph mismatch and unsafe source links',()=>{for(const mutate of [d=>delete d.articles[0].text.zh,d=>d.articles.push(d.articles[0]),d=>d.articles[0].text.en.push('extra'),d=>d.articles[0].source='javascript:alert(1)',d=>d.articles[0].related.push('999-999'),d=>d.articles[0].effectiveFrom='2026-02-30']){const d=structuredClone(corpus);mutate(d);assert.throws(()=>validateCorpus(d));}});
test('all interface strings have French, Chinese and English values',()=>{for(const lang of ['zh','en']){assert.deepEqual(Object.keys(texts[lang]).sort(),Object.keys(texts.fr).sort());for(const value of Object.values(texts[lang]))assert.ok(value.length>0);}});

test('full corpus article forms support regulatory prefixes and letter suffixes',()=>{
 const fixtures=[{...corpus.articles[0],id:'R131-2'},{...corpus.articles[1],id:'224-1 A'},{...corpus.articles[2],id:'224-1'}];
 for(const q of ['R131-2','R. 131-2','Article R131-2','第R131-2条'])assert.equal(searchArticles(fixtures,q)[0].id,'R131-2');
 assert.equal(searchArticles(fixtures,'224-1 A')[0].id,'224-1 A');assert.equal(searchArticles(fixtures,'224-1')[0].id,'224-1');
});
test('published complete corpus has independently verified coverage and real source text',()=>{
 if(published.edition!=='complete'||published.schemaVersion!==2)return;
 assert.equal(published.articles.length,1301);
 assert.equal(published.metadata.coverage.matchedArticles,published.articles.length);
 assert.equal(published.metadata.coverage.missingArticles,0);
 assert.equal(published.metadata.coverage.extraArticles,0);
 assert.ok(published.books.some(b=>b.part==='regulatory'));
 assert.ok(published.articles.some(a=>a.id==='R722-7'));
 for(const a of published.articles){assert.ok(a.sourceId.startsWith('LEGIARTI'));for(const l of ['en','zh'])assert.ok(a.text[l].every(p=>p&&!p.includes('▁')));}
});
test('schema v2 permits unknown effective dates without inventing them',()=>{
 const d=structuredClone(corpus);d.schemaVersion=2;d.edition='selection';d.articles[0].effectiveFrom=null;d.articles[0].snapshotDate='2026-10-20';d.articles[0].translationStatus='machine-unreviewed';
 assert.doesNotThrow(()=>validateCorpus(d));delete d.articles[0].snapshotDate;assert.throws(()=>validateCorpus(d));
});
test('unverified imports cannot claim complete coverage',()=>{
 const d=structuredClone(corpus);d.schemaVersion=2;d.edition='complete';assert.throws(()=>validateCorpus(d));
});

test('pagination bounds the rendered list and handles last pages',()=>{
 const all=Array.from({length:1301},(_,i)=>i);
 assert.equal(paginateArticles(all,0).items.length,30);
 assert.equal(paginateArticles(all,100).page,43);
 assert.equal(paginateArticles(all,100).items.length,11);
 assert.equal(paginateArticles([],5).page,0);
 assert.equal(paginateArticles(all,-1).page,0);
});
