// Runs only for "/" and "/index.html" (see run_worker_first in wrangler.jsonc); every other path is a static asset.
import {renderPage,indexCorpus} from './page.js';
import {languages} from '../public/core.js';

// public/_headers does not apply to Worker-built responses, so the same headers are set here (tests/page.test.mjs keeps them in sync).
export const SECURITY_HEADERS={
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'DENY',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};

let cache;
async function load(env,origin){
 if(!cache)cache=(async()=>{
  const [t,d]=await Promise.all(['/','/data/articles.json'].map(p=>env.ASSETS.fetch(new Request(origin+p))));
  if(!t.ok||!d.ok)throw new Error('Assets unavailable');
  return {template:await t.text(),corpus:indexCorpus(await d.json())};
 })().catch(e=>{cache=undefined;throw e;});
 return cache;
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method)||!['/','/index.html'].includes(url.pathname))return env.ASSETS.fetch(request);
  try{
   const {template,corpus}=await load(env,url.origin);
   const p=url.searchParams,lang=languages.includes(p.get('lang'))?p.get('lang'):'fr';
   const html=renderPage(template,corpus,lang,p.get('article')||'');
   return new Response(request.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate',...SECURITY_HEADERS}});
  }catch(error){console.error(error);return env.ASSETS.fetch(request);}
 },
};
