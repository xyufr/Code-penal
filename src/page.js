// Server-side page for the home page and each article URL (?lang=…&article=…).
// Crawlers get a page-specific title, description, canonical, hreflang and the
// article text in the HTML itself; app.js then replaces #app as before.
import texts from '../public/i18n.js';
import {languages} from '../public/core.js';

export const SITE='https://law.xyufr.com/';
// Same URL shape as pageURL() in app.js and the sitemap built by scripts/build.mjs.
export function pageURL(lang,id){const p=new URLSearchParams();if(lang!=='fr'||id)p.set('lang',lang);if(id)p.set('article',id);const q=p.toString();return SITE+(q?'?'+q:'');}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const htmlLang=l=>l==='zh'?'zh-Hans':l;
const ogLocale={fr:'fr_FR',zh:'zh_CN',en:'en_GB'};
const articleWord=(lang,id)=>lang==='zh'?`第 ${id} 条`:`Article ${id}`;
const ui={
 fr:{source:'Texte officiel sur Légifrance',related:'Articles liés',other:'Autres langues',note:'Traductions chinoise et anglaise non officielles, sans révision juridique.'},
 zh:{source:'Légifrance 官方文本',related:'关联法条',other:'其他语言',note:'中文和英文为未经法律专业审校的参考译文。'},
 en:{source:'Official text on Légifrance',related:'Related articles',other:'Other languages',note:'Chinese and English are unofficial translations without legal review.'},
};
const langName={fr:'Français',zh:'中文',en:'English'};

export function pageMeta(corpus,lang,id){
 const a=id?corpus.byId.get(id):null;
 if(!a)return {lang,article:null,title:texts[lang].metaTitle,description:texts[lang].metaDescription,canonical:pageURL(lang,'')};
 const word=articleWord(lang,a.id);
 const text=`${word}${{fr:' : ',zh:'：',en:': '}[lang]}${a.text[lang].join(' ')}`.replace(/\s+/g,' ');
 return {lang,article:a,title:`${word} · ${a.title[lang]} · Code pénal`,description:text.length>160?text.slice(0,157).trimEnd()+'…':text,canonical:pageURL(lang,a.id)};
}

function articleBody(corpus,{lang,article:a}){
 const u=ui[lang],link=(l,id,text)=>`<a href="${esc(pageURL(l,id))}">${esc(text)}</a>`;
 const related=a.related.map(id=>corpus.byId.get(id)).filter(Boolean);
 return `<main id="main" class="prerendered" lang="${htmlLang(lang)}"><nav aria-label="Code pénal"><a href="${esc(pageURL(lang,''))}">Code pénal</a>${(a.path?.[lang]||[]).map(p=>` › ${esc(p)}`).join('')}</nav>`
 +`<article><h1>${esc(articleWord(lang,a.id))}</h1><h2>${esc(a.title[lang])}</h2>${a.text[lang].map(p=>`<p>${esc(p)}</p>`).join('')}</article>`
 +(lang!=='fr'?`<p><small>${esc(u.note)}</small></p>`:'')
 +`<p><a href="${esc(a.source)}" rel="noopener">${esc(u.source)}</a></p>`
 +(related.length?`<h3>${esc(u.related)}</h3><ul>${related.map(r=>`<li>${link(lang,r.id,`${articleWord(lang,r.id)} · ${r.title[lang]}`)}</li>`).join('')}</ul>`:'')
 +`<h3>${esc(u.other)}</h3><ul>${languages.filter(l=>l!==lang).map(l=>`<li lang="${htmlLang(l)}">${link(l,a.id,`${langName[l]} · ${articleWord(l,a.id)} · ${a.title[l]}`)}</li>`).join('')}</ul></main>`;
}

// Each pattern must match the index.html template exactly once, so a template change fails loudly instead of shipping the generic head.
function replaceOnce(html,pattern,value){let n=0;const out=html.replace(pattern,()=>{n++;return value;});if(n!==1)throw new Error(`Template pattern ${pattern} matched ${n} times`);return out;}

export function renderPage(template,corpus,lang,id){
 const m=pageMeta(corpus,lang,id),id2=m.article?.id||'',title=esc(m.title),desc=esc(m.description);
 const alt=languages.map(l=>`<link rel="alternate" hreflang="${htmlLang(l)}" href="${esc(pageURL(l,id2))}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${esc(pageURL('fr',id2))}">`;
 let html=template;
 html=replaceOnce(html,/<html lang="[^"]*">/,`<html lang="${htmlLang(lang)}">`);
 html=replaceOnce(html,/<meta name="description" content="[^"]*">/,`<meta name="description" content="${desc}">`);
 html=replaceOnce(html,/<title>[^<]*<\/title>/,`<title>${title}</title>`);
 html=replaceOnce(html,/<link rel="canonical" href="[^"]*">(?:<link rel="alternate" hreflang="[^"]*" href="[^"]*">)+/,`<link rel="canonical" href="${esc(m.canonical)}">${alt}`);
 html=replaceOnce(html,/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${esc(m.canonical)}">`);
 html=replaceOnce(html,/<meta property="og:locale" content="[^"]*">(?:<meta property="og:locale:alternate" content="[^"]*">)+/,`<meta property="og:locale" content="${ogLocale[lang]}">`+languages.filter(l=>l!==lang).map(l=>`<meta property="og:locale:alternate" content="${ogLocale[l]}">`).join(''));
 if(m.article){
  html=replaceOnce(html,/<meta property="og:type" content="[^"]*">/,'<meta property="og:type" content="article">');
  html=replaceOnce(html,/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${title}">`);
  html=replaceOnce(html,/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${desc}">`);
  html=replaceOnce(html,/<meta name="twitter:title" content="[^"]*">/,`<meta name="twitter:title" content="${title}">`);
  html=replaceOnce(html,/<meta name="twitter:description" content="[^"]*">/,`<meta name="twitter:description" content="${desc}">`);
  html=replaceOnce(html,/<div id="app">[\s\S]*?<\/div>(?=<div id="toast")/,`<div id="app">${articleBody(corpus,m)}</div>`);
 }
 return html;
}

export function indexCorpus(data){return {...data,byId:new Map(data.articles.map(a=>[a.id,a]))};}
