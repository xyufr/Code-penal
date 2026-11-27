import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderPage,indexCorpus,pageMeta} from '../src/page.js';
import {SECURITY_HEADERS} from '../src/worker.js';
const template=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const corpus=indexCorpus(JSON.parse(await readFile(new URL('../public/data/articles.json',import.meta.url),'utf8')));
const head=(html,re)=>html.match(re)?.[1];
test('article pages carry their own title, description, canonical, hreflang and text',()=>{
 const a=corpus.byId.get('121-3'),html=renderPage(template,corpus,'zh','121-3');
 assert.equal(head(html,/<html lang="([^"]+)">/),'zh-Hans');
 assert.match(head(html,/<title>([^<]+)<\/title>/),/^第 121-3 条 · .+ · Code pénal$/);
 assert.equal(head(html,/<link rel="canonical" href="([^"]+)">/),'https://law.xyufr.com/?lang=zh&amp;article=121-3');
 assert.ok(html.includes('hreflang="fr" href="https://law.xyufr.com/?lang=fr&amp;article=121-3"'));
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.equal((html.match(/hreflang=/g)||[]).length,4);
 assert.ok(head(html,/<meta name="description" content="([^"]+)">/).startsWith('第 121-3 条：'));
 for(const p of a.text.zh)assert.ok(html.includes(p.replaceAll('&','&amp;')),p);
 assert.ok(!html.includes('class="loading"'));
});
test('ids with spaces and every article render',()=>{
 assert.ok(renderPage(template,corpus,'fr','224-1 A').includes('href="https://law.xyufr.com/?lang=fr&amp;article=224-1+A"'));
 for(const a of corpus.articles)for(const l of ['fr','zh','en'])renderPage(template,corpus,l,a.id);
});
test('home and unknown articles fall back to the language home page',()=>{
 for(const id of ['','999-999','<script>']){const html=renderPage(template,corpus,'en',id);assert.equal(head(html,/<link rel="canonical" href="([^"]+)">/),'https://law.xyufr.com/?lang=en');assert.ok(html.includes('class="loading"'));assert.ok(!html.includes('<script>'));}
 assert.equal(pageMeta(corpus,'fr','').canonical,'https://law.xyufr.com/');
});
test('Worker security headers match public/_headers',async()=>{
 const lines=(await readFile(new URL('../public/_headers',import.meta.url),'utf8')).split('\n').slice(1).filter(l=>l.trim()).map(l=>l.trim().split(/:\s(.+)/));
 assert.deepEqual(Object.fromEntries(lines.map(([k,v])=>[k,v])),SECURITY_HEADERS);
});
