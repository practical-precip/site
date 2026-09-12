import {writeFileSync,cpSync,mkdirSync,rmSync,existsSync,renameSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import {readMarkdownContent} from './markdown-content.mjs';
export const root=fileURLToPath(new URL('../',import.meta.url));
export function prepareContent(base=root){
 if(process.env.SITE_CONTENT_MODE==='snapshot'){
  const published=resolve(base,'docs/content-assets');
  if(!existsSync(published))throw Error('Published assets are missing from docs/content-assets.');
  rmSync(resolve(base,'public/content-assets'),{recursive:true,force:true});
  cpSync(published,resolve(base,'public/content-assets'),{recursive:true});return;
 }
 const source=resolve(base,'metadata/datasets-and-guidance');
 if(!existsSync(resolve(source,'INDEX.md')))throw Error('Missing metadata/datasets-and-guidance. Run git submodule update --init --recursive.');
 const records=readMarkdownContent(source),stage=resolve(base,'.content-staging');
 rmSync(stage,{recursive:true,force:true});mkdirSync(stage);
 const emitted=new Set();
 const put=(file,value)=>{if(emitted.has(file))throw Error(`Duplicate generated path ${file}; check dataset and regional guidance addresses.`);emitted.add(file);const p=resolve(stage,file);if(!p.startsWith(stage+'/'))throw Error(`Unsafe output path: ${file}`);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,value);};
 const doc=(file,value,body)=>put(file,'---\n'+yaml.dump(value)+'---\n'+body);
 const papers={},sources={};
 try{
  cpSync(resolve(base,'scripts/content-schema.json'),resolve(stage,'schema.json'));
  for(const[file,record]of records){let value=structuredClone(record.value);sources[file]=record.file;
   if(record.type==='paper'){papers[file.slice(7,-5)]=value;continue;}
   if(record.type==='product'){
    const guidance=value.expert_guidance;delete value.expert_guidance;
    doc(value.guidance,guidance,record.body);sources[value.guidance]=record.file;
   }else if(record.type==='document'){doc(file,value,record.body);continue;}
   if(record.type==='row'&&value.figure){value.figure.data=value.figure.data?.replace('/content-assets/guidance/figures/','/illustrations/');value.figure.code=value.figure.code?.replace('/content-assets/guidance/figures/','/illustrations/');}
   put(file,yaml.dump(value));
  }
  put('papers.yaml',yaml.dump(papers));put('source-map.json',JSON.stringify(sources,null,2)+'\n');
  rmSync(resolve(base,'content'),{recursive:true,force:true});renameSync(stage,resolve(base,'content'));
  rmSync(resolve(base,'public/content-assets'),{recursive:true,force:true});cpSync(resolve(source,'assets'),resolve(base,'public/content-assets'),{recursive:true});
 }catch(error){rmSync(stage,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{prepareContent();console.log(process.env.SITE_CONTENT_MODE==='snapshot'?'Using the published content snapshot.':'Converted NestedText datasets and definitions, plus Markdown guidance into site content.');}catch(e){console.error(e.message);process.exitCode=1;}
}
