import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import {readBibliography} from './bibliography.mjs';
import layout from './markdown-layout.json' with {type:'json'};
const parser=unified().use(remarkParse).use(remarkGfm);
const label=k=>k.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const key=(s,shape)=>Object.keys(shape??{}).find(k=>label(k)===s)??s.toLowerCase().replaceAll(' ','_');
const decode=s=>s.replace(/\\([\\|])/g,'$1').replaceAll('<br>','\n');
function scalar(raw,shape){const s=decode(raw.trim());if(s==='(not recorded)')return null;if(Array.isArray(shape))return s?s.split('; ').map(x=>scalar(x,shape[0])):[];if(shape==='number'){if(!s||!Number.isFinite(Number(s)))throw Error(`Expected a number, found "${s}"`);return Number(s);}if(shape==='boolean'){if(!['true','false'].includes(s))throw Error('Expected true or false');return s==='true';}return s;}
function assign(out,path,raw,shape){let target=out,desc=shape;for(let i=0;i<path.length;i++){const k=key(path[i],desc);if(["__proto__","constructor","prototype"].includes(k))throw Error("Reserved field name");if(i===path.length-1){if(Object.hasOwn(target,k))throw Error(`Duplicate field ${path.join(' / ')}`);if(raw.trim()!=='(omit)')target[k]=scalar(raw,desc?.[k]);}else{target[k]??={};target=target[k];desc=desc?.[k];}}}
export function parseMarkdown(raw,shape,file='Markdown'){try{
 raw=raw.replace(/\r\n?/g,'\n');
 const marker=raw.indexOf('\n## Guidance\n'),body=marker<0?undefined:raw.slice(marker+'\n## Guidance\n'.length);
 const text=marker<0?raw:raw.slice(0,marker);const nodes=parser.parse(text).children;
 const source=n=>text.slice(n.position.start.offset,n.position.end.offset);
 function block(start,end,desc){const out=Array.isArray(desc)?[]:{};let saw=false;
  for(let i=start;i<end;i++){const n=nodes[i];if(n.type==='heading'){
   if(n.depth===1)continue;
   const name=n.children.map(c=>c.value??'').join('');const k=key(name,desc);let stop=i+1;while(stop<end&&!(nodes[stop].type==='heading'&&nodes[stop].depth<=n.depth))stop++;
   if(Object.hasOwn(out,k))throw Error(`Duplicate section ${name}`);
   if(!desc?.[k]&& !['cells','regions'].includes(k))throw Error(`Unknown section ${name}`);
   out[k]=block(i+1,stop,desc?.[k]??{});i=stop-1;saw=true;
  }else if(n.type==='table'){
   if(n.children.some(row=>row.children.length!==n.children[0].children.length))throw Error('Table row has a different number of cells; escape a literal bar as \\|');
   const rows=n.children.map(row=>row.children.map(c=>c.children.length?text.slice(c.children[0].position.start.offset,c.children.at(-1).position.end.offset):''));const headers=rows.shift().map(x=>decode(x.trim()));
   if(new Set(headers).size!==headers.length)throw Error('Duplicate table column');
   if(Array.isArray(desc)){for(const row of rows){const item={};headers.forEach((h,j)=>assign(item,h.split(' / '),row[j]??'',desc[0]));out.push(item);}}
   else{if(headers.join('|')!=='Field|Value')throw Error('Expected a Field | Value table');for(const row of rows)assign(out,[decode(row[0].trim())],row[1]??'',desc);}
   saw=true;
  }else if(n.type==='list'&&Array.isArray(desc)){for(const item of n.children){const value=item.children.map(source).join('\n');out.push(scalar(value,desc[0]));}saw=true;
  }else if(n.type==='paragraph'&&source(n).trim()==='No entries.'){saw=true;}
  else if(n.type!=='thematicBreak')throw Error('Place free prose below the "## Guidance" heading; metadata uses tables and lists.');
  }
  if(!saw)throw Error('Empty metadata section');return out;
 }
 return {value:block(0,nodes.length,shape),body};
}catch(e){throw Error(`${file}: ${e.message}`);}}
function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);}
export function readMarkdownContent(root){const entries=layout.files.filter(e=>!['product','document','row','paper'].includes(e.type));
 for(const[folder,type,prefix]of [['datasets','product','products'],['guidance/applications','row','rows'],['guidance/cells','document','cells']])for(const path of walk(resolve(root,folder))){if(!path.endsWith('.md')||path.includes('/regional/'))continue;const file=relative(root,path);entries.push({file,type,output:prefix+'/'+relative(resolve(root,folder),path).replace(/\.md$/,type==='document'?'.md':'.yaml'),document:type==='document'||type==='product'});}
 for(const path of walk(resolve(root,'datasets/regional')))if(path.endsWith('.md'))entries.push({file:relative(root,path),type:'document',output:'product-guidance/'+relative(resolve(root,'datasets/regional'),path),document:true});
 const records=new Map();for(const entry of entries){const parsed=parseMarkdown(readFileSync(resolve(root,entry.file),'utf8'),layout.groups[entry.type],entry.file);if(entry.type==='product')parsed.value.guidance=`product-guidance/${parsed.value.id}.md`;if(entry.document&& !parsed.body?.trim())throw Error(`${entry.file}: missing ## Guidance prose`);if(records.has(entry.output))throw Error(`Duplicate output ${entry.output}`);records.set(entry.output,{...parsed,file:entry.file,type:entry.type});}for(const[id,value]of Object.entries(readBibliography(readFileSync(resolve(root,'references.bib'),'utf8'))))records.set(`papers/${id}.yaml`,{value,file:'references.bib',type:'paper'});return records;
}
