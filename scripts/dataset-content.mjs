import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import schema from './content-schema.json' with {type:'json'};

const markdown=unified().use(remarkParse).use(remarkGfm);
const text=node=>node?.value??node?.children?.map(text).join('')??'';
const ajv=new Ajv({allErrors:true,jsonPointers:true,schemaId:'auto',format:'full'});
ajv.addSchema(schema,'content');
const validateProduct=ajv.getSchema('content#/definitions/product');
const validateDocument=ajv.getSchema('content#/definitions/document');
const validateRegions=ajv.getSchema('content#/definitions/regions');
const validateTable=ajv.getSchema('content#/definitions/table');

function validationError(file,check){
 return new Error(`${file}: ${ajv.errorsText(check.errors,{separator:'\n'})}`);
}
function mapping(raw,file){
 try{
  if(/^\s*(?:__proto__|constructor|prototype):/m.test(raw))throw new Error('reserved field name');
  const value=yaml.load(raw,{schema:yaml.JSON_SCHEMA,filename:file});
  if(!value||Array.isArray(value)||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw new Error('expected a YAML mapping');
  return value;
 }catch(error){throw new Error(`${file}: ${error.message}`);}
}

export function readDatasetIndex(raw,file='INDEX.md'){
 const nodes=markdown.parse(raw).children;
 const starts=nodes.flatMap((node,index)=>node.type==='heading'&&node.depth===2&&text(node)==='Datasets'?[index]:[]);
 if(starts.length!==1)throw new Error(`${file}: expected one ## Datasets section`);
 const entries=[],ids=new Set();
 for(let i=starts[0]+1;i<nodes.length;i++){
  const node=nodes[i];
  if(node.type==='heading'&&node.depth<=2)break;
  if(node.type==='paragraph')continue;
  if(node.type!=='list')throw new Error(`${file}: datasets must be Markdown entries in a list`);
  for(const item of node.children){
   const paragraph=item.children[0];
   const nameNode=paragraph?.children?.find(child=>child.type==='strong');
   const links=paragraph?.children?.filter(child=>child.type==='link')??[];
   const guidance=links.find(link=>text(link)==='Guidance');
   const metadata=links.find(link=>text(link)==='Metadata');
   const name=text(nameNode).trim();
   const guidanceMatch=guidance?.url.match(/^guidance\/datasets\/([a-z][a-z0-9-]*)\.md$/);
   const metadataMatch=metadata?.url.match(/^datasets\/([a-z][a-z0-9-]*)\.yaml$/);
   if(paragraph?.type!=='paragraph'||!name||!guidanceMatch||!metadataMatch||links.length!==2)throw new Error(`${file}: invalid dataset entry; link Guidance and Metadata using repository paths`);
   if(guidanceMatch[1]!==metadataMatch[1])throw new Error(`${file}: Guidance and Metadata need matching filename stems`);
   const id=guidanceMatch[1];
   if(ids.has(id))throw new Error(`${file}: duplicate dataset ID ${id}`);
   ids.add(id);
   if(item.children.length>2||(item.children[1]&&item.children[1].type!=='list'))throw new Error(`${file} [${id}]: aliases must be indented list items`);
   const aliases=(item.children[1]?.children??[]).map(alias=>{
    if(alias.children.length!==1||alias.children[0].type!=='paragraph')throw new Error(`${file} [${id}]: use one alias per indented list item`);
    const value=text(alias.children[0]);
    if(!value.startsWith('Alias: ')||!value.slice(7).trim())throw new Error(`${file} [${id}]: prefix each familiar name with Alias:`);
    return value.slice(7).trim();
   });
   entries.push({id,name,aliases,metadataFile:metadata.url,guidanceFile:guidance.url});
  }
 }
 if(!entries.length)throw new Error(`${file}: no datasets listed`);
 return entries;
}

export function parseDataset(raw,file,identity){
 const value=mapping(raw,file);
 for(const field of ['id','name','aliases','guidance'])if(Object.hasOwn(value,field))throw new Error(`${file}: ${field} is defined by INDEX.md, not the metadata file`);
 const product={...value,id:identity.id,name:identity.name,aliases:identity.aliases,guidance:`product-guidance/${identity.id}.md`};
 if(!validateProduct(product))throw validationError(file,validateProduct);
 return {value:product,file,type:'product'};
}

export function parseGuidance(raw,file,{regional=false}={}){
 try{
  raw=raw.replace(/\r\n?/g,'\n');
  const match=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!match)throw new Error('expected YAML front matter between --- lines');
  const value=mapping(match[1],file);
  if(regional&&value.regions)throw new Error('regional guidance cannot contain regional overrides');
  if(value.regions){
   for(const[region,path]of Object.entries(value.regions)){
    const expected=/^guidance\/datasets\/regional\/([a-z][a-z0-9.-]*)\.md$/.exec(path);
    if(!expected)throw new Error(`invalid regional guidance path for ${region}`);
    value.regions[region]=`product-guidance/${expected[1]}.md`;
   }
  }
  if(!validateDocument(value))throw validationError(file,validateDocument);
  if(!match[2].trim())throw new Error('Markdown body is empty');
  return {value,body:match[2].trim(),file,type:'document'};
 }catch(error){
  if(error.message.startsWith(`${file}:`))throw error;
  throw new Error(`${file}: ${error.message}`);
 }
}

export function parseConfig(raw,file,type){
 try{
  const value=yaml.load(raw,{schema:yaml.JSON_SCHEMA,filename:file});
  const check={regions:validateRegions,table:validateTable}[type];
  if(!check)throw new Error(`unknown configuration type ${type}`);
  if(!check(value))throw validationError(file,check);
  return value;
 }catch(error){
  if(error.message.startsWith(`${file}:`))throw error;
  throw new Error(`${file}: ${error.message}`);
 }
}

export function readDatasetContent(root){
 const index=readDatasetIndex(readFileSync(resolve(root,'INDEX.md'),'utf8'));
 const metadataNames=new Set(index.map(entry=>`${entry.id}.yaml`));
 const guidanceNames=new Set(index.map(entry=>`${entry.id}.md`));
 for(const file of readdirSync(resolve(root,'datasets')))if(file.endsWith('.yaml')&&!metadataNames.has(file))throw new Error(`datasets/${file}: missing entry in INDEX.md`);
 for(const file of readdirSync(resolve(root,'guidance/datasets')))if(file.endsWith('.md')&&!guidanceNames.has(file))throw new Error(`guidance/datasets/${file}: missing entry in INDEX.md`);
 const records=new Map();
 records.set('catalog.yaml',{value:{version:1,products:index.map(entry=>entry.id)},type:'catalog',file:'INDEX.md'});
 for(const entry of index){
  if(!existsSync(resolve(root,entry.metadataFile)))throw new Error(`${entry.metadataFile}: linked from INDEX.md but missing`);
  if(!existsSync(resolve(root,entry.guidanceFile)))throw new Error(`${entry.guidanceFile}: linked from INDEX.md but missing`);
  records.set(`products/${entry.id}.yaml`,parseDataset(readFileSync(resolve(root,entry.metadataFile),'utf8'),entry.metadataFile,entry));
  records.set(`product-guidance/${entry.id}.md`,parseGuidance(readFileSync(resolve(root,entry.guidanceFile),'utf8'),entry.guidanceFile));
 }
 const regionalRoot=resolve(root,'guidance/datasets/regional');
 for(const entry of existsSync(regionalRoot)?readdirSync(regionalRoot):[]){
  if(!entry.endsWith('.md'))continue;
  if(!/^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.md$/.test(entry))throw new Error(`guidance/datasets/regional/${entry}: expected <dataset>.<region>.md`);
  const file=`guidance/datasets/regional/${entry}`;
  const output=`product-guidance/${entry}`;
  if(records.has(output))throw new Error(`Duplicate generated path ${output}`);
  records.set(output,parseGuidance(readFileSync(resolve(root,file),'utf8'),file,{regional:true}));
 }
 return records;
}
