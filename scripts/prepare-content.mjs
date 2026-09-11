import {readFileSync,writeFileSync,cpSync,mkdirSync,rmSync,existsSync,renameSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import {spawnSync} from 'node:child_process';
export const root=fileURLToPath(new URL('../',import.meta.url));
export function prepareContent(base=root){
 if(process.env.SITE_CONTENT_MODE==='snapshot'){
  const published=resolve(base,'docs/content-assets');
  if(!existsSync(published))throw Error('Published assets are missing from docs/content-assets.');
  rmSync(resolve(base,'public/content-assets'),{recursive:true,force:true});
  cpSync(published,resolve(base,'public/content-assets'),{recursive:true});
  return;
 }
 const source=resolve(base,'metadata');
 for(const repo of ['guidance','datasets'])if(!existsSync(resolve(source,repo,'schema.json')))throw Error(`Missing metadata/${repo}. Run git submodule update --init --recursive.`);
 const stage=resolve(base,'.content-staging');rmSync(stage,{recursive:true,force:true});mkdirSync(stage);
 const copy=(repo,name)=>cpSync(resolve(source,repo,name),resolve(stage,name),{recursive:true});
 try{
  for(const name of ['table.yaml','regions.yaml','rows','cells'])copy('guidance',name);
  for(const name of ['catalog.yaml','products','product-guidance'])copy('datasets',name);
  const schemas={},papers={};
  for(const repo of ['guidance','datasets']){
   const schema=JSON.parse(readFileSync(resolve(source,repo,'schema.json')));
   const refs=yaml.load(readFileSync(resolve(source,repo,'papers.yaml'),'utf8'),{schema:yaml.JSON_SCHEMA});
   for(const [target,input,label] of [[schemas,schema.definitions,'schema'],[papers,refs,'paper']])for(const [key,value] of Object.entries(input)){
    if(Object.hasOwn(target,key)&&JSON.stringify(target[key])!==JSON.stringify(value))throw Error(`Conflicting ${label} ${key} between metadata repositories. Reconcile before updating the site.`);
    target[key]=value;
   }
  }
  writeFileSync(resolve(stage,'schema.json'),JSON.stringify({$schema:'http://json-schema.org/draft-07/schema#',definitions:schemas},null,2)+'\n');
  writeFileSync(resolve(stage,'papers.yaml'),yaml.dump(papers));
  // These directories contain only disposable assembled data, never author edits.
  rmSync(resolve(base,'content'),{recursive:true,force:true});renameSync(stage,resolve(base,'content'));
  for(const repo of ['guidance','datasets']){
   const assets=resolve(base,'public/content-assets',repo);rmSync(assets,{recursive:true,force:true});mkdirSync(dirname(assets),{recursive:true});
   cpSync(resolve(source,repo,'assets'),assets,{recursive:true});
  }
 }catch(error){rmSync(stage,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
 if(process.argv.includes('--validate')&&process.env.SITE_CONTENT_MODE!=='snapshot'){
  for(const repo of ['guidance','datasets']){
   const script=resolve(root,'metadata',repo,'scripts/validate.mjs');
   if(!existsSync(script))throw Error('Missing metadata repositories. Run git submodule update --init --recursive.');
   const result=spawnSync(process.execPath,[script],{stdio:'inherit'});
   if(result.status!==0)throw Error(`${repo} validation failed`);
  }
 }
 prepareContent();console.log(process.env.SITE_CONTENT_MODE==='snapshot'?'Using the published content snapshot.':'Assembled guidance and datasets from the checked-out metadata revisions.');}catch(e){console.error(e.message);process.exitCode=1;}
}
