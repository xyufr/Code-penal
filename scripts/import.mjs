import {readFile,writeFile,rename} from 'node:fs/promises';
import {validateCorpus} from '../public/core.js';
const path=process.argv[2];
if(!path){console.error('Usage: npm run import -- /path/to/corpus.json');process.exit(1);}
try{
const data=validateCorpus(JSON.parse(await readFile(path,'utf8')));
const destination=new URL('../public/data/articles.json',import.meta.url);
const temporary=new URL('../public/data/articles.json.tmp',import.meta.url);
await writeFile(temporary,JSON.stringify(data,null,2)+'\n');
await rename(temporary,destination);
console.log(`Imported ${data.articles.length} articles. Run npm run build before deployment.`);
}catch(error){console.error(`Import rejected: ${error.message}`);process.exit(1);}
