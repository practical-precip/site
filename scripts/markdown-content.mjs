import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { readDatasetContent } from './dataset-content.mjs';
import { readBibliography } from './bibliography.mjs';
import layout from './markdown-layout.json' with { type: 'json' };

const parser = unified().use(remarkParse).use(remarkGfm);
const label = k => k.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
function key(name, shape) {
  const field = Object.keys(shape ?? {}).find(k => label(k) === name)
    ?? name.toLowerCase().replaceAll(' ', '_');
  if (['__proto__', 'constructor', 'prototype'].includes(field)) {
    throw new Error('Reserved field name');
  }
  return field;
}
function scalar(raw, shape) {
  // Soft-wrapped metadata is one value. Free Markdown prose is handled separately.
  if (/\n[ \t]*__[^\n]+?:__/.test(raw)) throw new Error('Start each additional field with a bullet point');
  const value = raw.trim().replace(/\n[ \t]*/g, ' ');
  if (value === '(not recorded)') return null;
  if (shape === 'number') {
    if (!value || !Number.isFinite(Number(value))) throw new Error(`Expected a number, found "${value}"`);
    return Number(value);
  }
  if (shape === 'boolean') {
    if (!['true', 'false'].includes(value)) throw new Error('Expected true or false');
    return value === 'true';
  }
  return value;
}

export function parseMarkdown(raw, shape, file = 'Markdown') {
  try {
    raw = raw.replace(/\r\n?/g, '\n');
    const marker = raw.indexOf('\n## Guidance\n');
    const body = marker < 0 ? undefined : raw.slice(marker + '\n## Guidance\n'.length);
    const text = marker < 0 ? raw : raw.slice(0, marker);
    const nodes = parser.parse(text).children;
    const source = node => text.slice(node.position.start.offset, node.position.end.offset);
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    function set(out, name, value) {
      if (Object.hasOwn(out, name)) throw new Error(`Duplicate field ${label(name)}`);
      out[name] = value;
    }
    function field(item, out, desc) {
      const paragraph = item.children[0];
      if (paragraph?.type !== 'paragraph') throw new Error('Start each field with - __Field:__ value');
      const match = source(paragraph).match(/^__([^\n]+?):__\s*([\s\S]*)$/);
      if (!match) throw new Error('Use __Field:__ labels, with double underscores');
      const name = key(match[1], desc);
      const type = desc?.[name];
      const children = item.children.slice(1);
      if (type && typeof type === 'object') {
        if (match[2].trim() === 'No entries.' && !children.length) {
          set(out, name, Array.isArray(type) ? [] : {});
        } else {
          if (match[2].trim() || children.length !== 1 || children[0].type !== 'list') {
            throw new Error(`${match[1]} requires an indented list, or No entries.`);
          }
          set(out, name, values(children[0], type));
        }
      } else {
        if (children.length) throw new Error(`${match[1]} is a single value; check list indentation`);
        set(out, name, scalar(match[2], type));
      }
    }
    function object(list, desc, out = {}) {
      if (list.ordered) throw new Error('Use bullet points for fields and numbered entries for collections');
      for (const item of list.children) field(item, out, desc);
      return out;
    }
    function values(list, desc) {
      if (!Array.isArray(desc)) return object(list, desc);
      if (isObject(desc[0])) {
        if (!list.ordered) throw new Error('Use numbered entries for a collection of records');
        return list.children.map(item => {
          // The first field identifies the entry; indented bullets hold its other fields.
          const out = {};
          field({ children: [item.children[0]] }, out, desc[0]);
          if (item.children.length > 2 || (item.children[1] && item.children[1].type !== 'list')) {
            throw new Error('Put the remaining record fields in indented bullet points');
          }
          if (item.children[1]) object(item.children[1], desc[0], out);
          return out;
        });
      }
      return list.children.map(item => {
        if (item.children.length !== 1 || item.children[0].type !== 'paragraph') {
          throw new Error('Use one value per list item; check list indentation');
        }
        return scalar(source(item.children[0]), desc[0]);
      });
    }
    function block(start, end, desc) {
      const out = Array.isArray(desc) ? [] : {};
      let saw = false;
      let empty = false;
      for (let i = start; i < end; i++) {
        const node = nodes[i];
        if (node.type === 'heading' && node.depth === 1) continue;
        if (empty) throw new Error('Replace No entries. before adding fields or list items');
        if (node.type === 'heading') {
          if (Array.isArray(desc)) throw new Error('Use numbered entries inside a collection');
          const name = node.children.map(c => c.value ?? '').join('');
          const fieldName = key(name, desc);
          if (!desc?.[fieldName] && !['cells', 'regions'].includes(fieldName)) throw new Error(`Unknown section ${name}`);
          if (!isObject(desc?.[fieldName]) && !Array.isArray(desc?.[fieldName]) && !['cells', 'regions'].includes(fieldName)) throw new Error(`${name} is a single value; use a labeled bullet point`);
          let stop = i + 1;
          while (stop < end && !(nodes[stop].type === 'heading' && nodes[stop].depth <= node.depth)) stop++;
          set(out, fieldName, block(i + 1, stop, desc?.[fieldName] ?? {}));
          i = stop - 1;
        } else if (node.type === 'list') {
          if (Array.isArray(desc)) out.push(...values(node, desc));
          else object(node, desc, out);
        } else if (node.type === 'paragraph' && source(node).trim() === 'No entries.') {
          if (saw) throw new Error('No entries. cannot be combined with fields or list items');
          empty = true;
        } else if (node.type === 'table') {
          throw new Error('Use labeled lists such as - __Name:__ value instead of metadata tables');
        } else {
          throw new Error('Place free prose below ## Guidance; metadata uses labeled lists');
        }
        saw = true;
      }
      if (!saw) throw new Error('Empty metadata section');
      return out;
    }
    return { value: block(0, nodes.length, shape), body };
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}
function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);}
export function readMarkdownContent(root){const entries=layout.files.filter(e=>!['product','document','row','paper'].includes(e.type));
 for(const[folder,type,prefix]of [['guidance/applications','row','rows'],['guidance/cells','document','cells']])for(const path of walk(resolve(root,folder))){if(!path.endsWith('.md')||path.includes('/regional/'))continue;const file=relative(root,path);entries.push({file,type,output:prefix+'/'+relative(resolve(root,folder),path).replace(/\.md$/,type==='document'?'.md':'.yaml'),document:type==='document'||type==='product'});}
 const records=readDatasetContent(root);for(const entry of entries){const parsed=parseMarkdown(readFileSync(resolve(root,entry.file),'utf8'),layout.groups[entry.type],entry.file);if(entry.type==='product')parsed.value.guidance=`product-guidance/${parsed.value.id}.md`;if(entry.document&& !parsed.body?.trim())throw Error(`${entry.file}: missing ## Guidance prose`);if(records.has(entry.output))throw Error(`Duplicate output ${entry.output}`);records.set(entry.output,{...parsed,file:entry.file,type:entry.type});}for(const[id,value]of Object.entries(readBibliography(readFileSync(resolve(root,'references.bib'),'utf8'))))records.set(`papers/${id}.yaml`,{value,file:'references.bib',type:'paper'});return records;
}
