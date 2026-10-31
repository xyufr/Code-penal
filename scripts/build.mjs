import {cp,mkdir,readFile,rm} from 'node:fs/promises';
import {validateCorpus} from '../public/core.js';
validateCorpus(JSON.parse(await readFile(new URL('../public/data/articles.json',import.meta.url),'utf8')));
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
console.log('Built dist/ with validated trilingual corpus.');
