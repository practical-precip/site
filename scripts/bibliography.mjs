import { parse } from '@retorquere/bibtex-parser';

/** Convert standard BibTeX plus the site's support/scope annotations. */
export function readBibliography(text, file = 'references.bib') {
  let library;
  try {
    library = parse(text, { sentenceCase: false, caseProtection: false });
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  if (library.errors.length) {
    throw new Error(`${file}: ${library.errors.map(e => e.error).join('; ')}`);
  }
  if (!library.entries.length) throw new Error(`${file}: no bibliography entries`);
  const papers = Object.create(null);
  for (const entry of library.entries) {
    const id = entry.key;
    const fields = entry.fields;
    const fail = message => { throw new Error(`${file} [${id}]: ${message}`); };
    if (!/^[a-z][a-z0-9-]*$/.test(id) || ['constructor', 'prototype'].includes(id)) fail('use a lowercase citation key with letters, digits, and hyphens');
    if (Object.hasOwn(papers, id)) fail('duplicate citation key');
    if (Object.keys(fields).some(k => k.includes('+duplicate-'))) fail('duplicate BibTeX field');
    for (const field of ['title', 'journal', 'year', 'url', 'doi', 'support', 'scope']) {
      if (typeof fields[field] !== 'string' || !fields[field].trim()) fail(`missing ${field} field`);
    }
    if (!/^\d{4}$/.test(fields.year)) fail('year must have four digits');
    if (!Array.isArray(fields.author) || !fields.author.length) fail('missing author field');
    const authors = fields.author.map(person => person.name || [person.firstName, person.prefix, person.lastName, person.suffix].filter(Boolean).join(' ')).join(' & ');
    if (!authors.trim()) fail('empty author field');
    papers[id] = {
      authors,
      year: Number(fields.year),
      title: fields.title,
      journal: fields.journal,
      url: fields.url,
      doi: fields.doi,
      support: fields.support,
      scope: fields.scope,
    };
  }
  return papers;
}
