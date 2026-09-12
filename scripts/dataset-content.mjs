import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'nestedtext';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import schema from './content-schema.json' with { type: 'json' };

const markdown = unified().use(remarkParse).use(remarkGfm);
const text = node => node.value ?? node.children?.map(text).join('') ?? '';
export function readDatasetIndex(raw, file = 'INDEX.md') {
  const nodes = markdown.parse(raw).children;
  const starts = nodes.flatMap((n, i) => n.type === 'heading' && n.depth === 2 && text(n) === 'Datasets' ? [i] : []);
  if (starts.length !== 1) throw new Error(`${file}: expected one ## Datasets section`);
  const entries = [], ids = new Set();
  for (let i = starts[0] + 1; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'heading' && node.depth <= 2) break;
    if (node.type === 'paragraph') continue;
    if (node.type !== 'list') throw new Error(`${file}: datasets must be Markdown links in a list`);
    for (const item of node.children) {
      const paragraph = item.children[0];
      const link = paragraph?.children?.[0];
      if (paragraph?.type !== 'paragraph' || paragraph.children.length !== 1 || link?.type !== 'link') throw new Error(`${file}: use - [Dataset name](datasets/stable-id.nt)`);
      const match = link.url.match(/^datasets\/([a-z][a-z0-9-]*)\.nt$/);
      const name = text(link).trim();
      if (!match || !name) throw new Error(`${file}: invalid dataset name or .nt path: ${link.url}`);
      const id = match[1];
      if (ids.has(id)) throw new Error(`${file}: duplicate dataset ID ${id}`);
      ids.add(id);
      if (item.children.length > 2 || (item.children[1] && item.children[1].type !== 'list')) throw new Error(`${file} [${id}]: aliases must be indented list items`);
      const aliases = (item.children[1]?.children ?? []).map(alias => {
        if (alias.children.length !== 1 || alias.children[0].type !== 'paragraph') throw new Error(`${file} [${id}]: use one alias per indented list item`);
        return text(alias.children[0]);
      });
      entries.push({ id, name, aliases, file: link.url });
    }
  }
  if (!entries.length) throw new Error(`${file}: no datasets listed`);
  return entries;
}
function resolveSchema(spec) {
  return spec.$ref ? schema.definitions[spec.$ref.split('/').at(-1)] : spec;
}
function convert(value, spec, path) {
  spec = resolveSchema(spec);
  if (Array.isArray(spec.type)) {
    if (value === '' && spec.type.includes('null')) return null;
    spec = {...spec, type: spec.type.find(t => t !== 'null')};
  }
  if (spec.anyOf) {
    if (value === '' && spec.anyOf.some(s => s.type === 'null')) return null;
    spec = spec.anyOf.find(s => s.type !== 'null');
  }
  if (spec.type === 'object') {
    if (!value || Array.isArray(value) || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) throw new Error(`${path}: expected a mapping`);
    const out = {};
    for (const [rawKey, item] of Object.entries(value)) {
      const key = rawKey.replaceAll(' ', '_');
      if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error(`${path}: reserved field ${rawKey}`);
      const field = spec.properties?.[key] ?? (typeof spec.additionalProperties === 'object' ? spec.additionalProperties : undefined);
      if (!field) throw new Error(`${path}: unknown field ${rawKey}`);
      if (Object.hasOwn(out, key)) throw new Error(`${path}: duplicate normalized field ${rawKey}`);
      out[key] = convert(item, field, `${path} / ${rawKey}`);
    }
    return out;
  }
  if (spec.type === 'array') {
    if (!Array.isArray(value)) throw new Error(`${path}: expected a list; an empty list is [] on its own indented line`);
    return value.map((v, i) => convert(v, spec.items, `${path} / item ${i + 1}`));
  }
  if (typeof value !== 'string') throw new Error(`${path}: expected text`);
  if (['number', 'integer'].includes(spec.type)) {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) || !Number.isFinite(Number(value))) throw new Error(`${path}: expected a number`);
    if (spec.type === 'integer' && !Number.isSafeInteger(Number(value))) throw new Error(`${path}: expected an integer`);
    return Number(value);
  }
  return value;
}
export function parseDataset(raw, file, identity) {
  try {
    // These are not dataset fields. Reject them before the JS loader can interpret prototype keys.
    if (/^\s*(?:__proto__|constructor|prototype):/m.test(raw)) throw new Error('reserved field name');
    const value = load(raw);
    if (!value || Array.isArray(value) || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) throw new Error('expected a NestedText mapping');
    let document;
    if (identity) {
      for (const field of ['id', 'name', 'aliases', 'guidance']) if (Object.hasOwn(value, field)) throw new Error(`${field} is defined by INDEX.md, not the dataset file`);
      document = value['expert guidance'];
      delete value['expert guidance'];
    } else document = value;
    if (!document || Array.isArray(document) || typeof document !== 'object') throw new Error('missing expert guidance mapping');
    const body = document.text;
    delete document.text;
    if (typeof body !== 'string' || !body.trim()) throw new Error('guidance text must be a nonempty NestedText multiline string');
    if (document.regions) {
      if (!identity) throw new Error('regional guidance cannot contain regional overrides');
      for (const [region, path] of Object.entries(document.regions)) {
        if (typeof path !== 'string' || !/^datasets\/regional\/[a-z][a-z0-9.-]*\.nt$/.test(path)) throw new Error(`invalid regional dataset path for ${region}`);
        document.regions[region] = path.replace('datasets/regional/', 'product-guidance/').replace(/\.nt$/, '.md');
      }
    }
    const meta = convert(document, schema.definitions.document, 'expert guidance');
    if (!identity) return { value: meta, body, file, type: 'document' };
    const product = convert(value, schema.definitions.product, 'dataset');
    return { value: { ...product, id: identity.id, name: identity.name, aliases: identity.aliases, guidance: `product-guidance/${identity.id}.md`, expert_guidance: meta }, body, file, type: 'product' };
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}
export function readDatasetContent(root) {
  const index = readDatasetIndex(readFileSync(resolve(root, 'INDEX.md'), 'utf8'));
  const known = new Set(index.map(r => `${r.id}.nt`));
  for (const file of readdirSync(resolve(root, 'datasets'))) if (file.endsWith('.nt') && !known.has(file)) throw new Error(`datasets/${file}: missing entry in INDEX.md`);
  const records = new Map();
  records.set('catalog.yaml', { value: { version: 1, products: index.map(r => r.id) }, type: 'catalog', file: 'INDEX.md' });
  for (const entry of index) records.set(`products/${entry.id}.yaml`, parseDataset(readFileSync(resolve(root, entry.file), 'utf8'), entry.file, entry));
  for (const entry of existsSync(resolve(root, 'datasets/regional')) ? readdirSync(resolve(root, 'datasets/regional')) : []) {
    if (!entry.endsWith('.nt')) continue;
    const file = `datasets/regional/${entry}`;
    records.set(`product-guidance/${entry.replace(/\.nt$/, '.md')}`, parseDataset(readFileSync(resolve(root, file), 'utf8'), file));
  }
  return records;
}
