import test from 'node:test';
import assert from 'node:assert/strict';
import { readBibliography } from './bibliography.mjs';
const entry = String.raw`@article{example,
 author = {Doe, Jane and Smith, John},
 title = {Rainfall in {CMIP6}},
 journal = {Climate}, year = 2024,
 doi = {10.1234/example}, url = {https://example.org/paper},
 support = {Supports the \"{o}verview.}, scope = {A single region.}
}`;
test('BibTeX authors, protected capitals and LaTeX accents become site text', () => {
 const p = readBibliography(entry).example;
 assert.equal(p.authors, 'Jane Doe & John Smith');
 assert.equal(p.title, 'Rainfall in CMIP6');
 assert.equal(p.support.normalize('NFC'), 'Supports the överview.');
 assert.equal(p.year, 2024);
});
test('literal abbreviated names and string macros are accepted', () => {
 const p = readBibliography('@string{venue = "Climate"}\n' + entry.replace('Doe, Jane and Smith, John', '{Doe et al.}').replace('{Climate}', 'venue')).example;
 assert.equal(p.authors, 'Doe et al.');
 assert.equal(p.journal, 'Climate');
});
test('duplicates, malformed entries and missing guidance annotations fail clearly', () => {
 assert.throws(() => readBibliography(entry + '\n' + entry), /references.bib.*duplicate citation key/);
 assert.throws(() => readBibliography(entry.replace('year = 2024,', 'year = 2024, year = 2025,')), /duplicate BibTeX field/);
 assert.throws(() => readBibliography(entry.slice(0,-8)), /references.bib/);
 assert.throws(() => readBibliography(entry.replace('scope = {A single region.}', 'note = {A single region.}')), /missing scope field/);
 assert.throws(() => readBibliography('% no entries'), /no bibliography entries/);
});
