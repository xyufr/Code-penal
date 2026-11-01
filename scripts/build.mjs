import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {validateCorpus,languages} from '../public/core.js';
const corpus=validateCorpus(JSON.parse(await readFile(new URL('../public/data/articles.json',import.meta.url),'utf8')));
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
// One sitemap entry per language for the home page and each article, matching the canonical URLs set in app.js.
const site='https://law.xyufr.com/';
const pageURL=(lang,id)=>{const p=new URLSearchParams();if(lang!=='fr'||id)p.set('lang',lang);if(id)p.set('article',id);const q=p.toString();return site+(q?'?'+q:'');};
const updated=corpus.articles.map(a=>a.checkedAt).sort().at(-1);
const xml=s=>s.replaceAll('&','&amp;');
const entry=id=>{const alts=languages.map(l=>`<xhtml:link rel="alternate" hreflang="${l==='zh'?'zh-Hans':l}" href="${xml(pageURL(l,id))}"/>`).join('')+`<xhtml:link rel="alternate" hreflang="x-default" href="${xml(pageURL('fr',id))}"/>`;return languages.map(l=>`<url><loc>${xml(pageURL(l,id))}</loc>${alts}<lastmod>${updated}</lastmod></url>`).join('\n');};
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[entry(''),...corpus.articles.map(a=>entry(a.id))].join('\n')}\n</urlset>\n`);
console.log('Built dist/ with validated trilingual corpus and sitemap.xml.');
