import test from 'node:test';
import assert from 'node:assert/strict';
import { dump } from 'nestedtext';
import { parseDataset, readDatasetIndex } from './dataset-content.mjs';
const identity = {id:'example',name:'From the index',aliases:['Familiar name']};
const dataset = {
  coverage:{'grid spacing':{value:'0.0625',unit:'degrees'}},
  ensemble:{'model count':'',members:'001'},
  dates:{created:'',released:'2024-09-22',publication:''},
  generation:['CMIP6'],
  'expert guidance':{
    title:'Guidance',summary:'Scope',review:{status:'draft',updated:'2026-09-11',contributors:['An expert']},evidence:[],
    text:'\n## Evaluation\n\nLiteral \\sum_i, __emphasis__, "quotes", # and |.\n',
  },
};
const parse = value => parseDataset(dump(value,{indent:'  '}),'datasets/example.nt',identity);
test('NestedText preserves strings and Markdown while schema types numbers and blanks',()=>{
 const r=parse(dataset);
 assert.equal(r.value.coverage.grid_spacing.value,0.0625);
 assert.equal(r.value.ensemble.model_count,null);
 assert.equal(r.value.ensemble.members,'001');
 assert.equal(r.value.dates.created,null);
 assert.equal(r.value.dates.released,'2024-09-22');
 assert.deepEqual(r.value.generation,['CMIP6']);
 assert.equal(r.body,dataset['expert guidance'].text);
 assert.equal(r.value.name,'From the index');
});
test('INDEX.md supplies names, IDs, aliases and ordering using ordinary links',()=>{
 const entries=readDatasetIndex('# Index\n\n## Datasets\n\n- [Second](datasets/two.nt)\n  - Other name\n- [First](datasets/one.nt)\n\n## Guidance boxes\n\n- [A box](guidance/one.md)\n');
 assert.deepEqual(entries.map(r=>r.id),['two','one']);
 assert.equal(entries[0].name,'Second');
 assert.deepEqual(entries[0].aliases,['Other name']);
});
test('duplicate index IDs, unsafe paths and missing sections fail',()=>{
 assert.throws(()=>readDatasetIndex('## Datasets\n\n- [A](datasets/a.nt)\n- [B](datasets/a.nt)'),/duplicate dataset ID/);
 assert.throws(()=>readDatasetIndex('## Datasets\n\n- [A](../a.nt)'),/invalid dataset/);
 assert.throws(()=>readDatasetIndex('## Missing\n'),/expected one/);
});
test('NestedText syntax, duplicate fields and invalid types fail with the filename',()=>{
 assert.throws(()=>parseDataset('x: one\nx: two','bad.nt',identity),/bad.nt:.*Duplicate key/);
 assert.throws(()=>parseDataset('x:\n  y: a\n z: b','bad.nt',identity),/bad.nt:.*indentation/);
 const number=structuredClone(dataset);number.ensemble['model count']='many';assert.throws(()=>parse(number),/expected a number/);
 number.ensemble['model count']='2.5';assert.throws(()=>parse(number),/expected an integer/);
 const list=structuredClone(dataset);list.generation='[]';assert.throws(()=>parse(list),/expected a list/);
 const name=structuredClone(dataset);name.name='Duplicate';assert.throws(()=>parse(name),/defined by INDEX.md/);
 const duplicate=structuredClone(dataset);duplicate.coverage.grid_spacing={value:'1',unit:'degree'};assert.throws(()=>parse(duplicate),/duplicate normalized field/);
});
test('regional paths are converted for the site without permitting traversal or nested overrides',()=>{
 const region=structuredClone(dataset);region['expert guidance'].regions={northwest:'datasets/regional/example.northwest.nt'};
 assert.equal(parse(region).value.expert_guidance.regions.northwest,'product-guidance/example.northwest.md');
 region['expert guidance'].regions.northwest='../private.nt';assert.throws(()=>parse(region),/invalid regional/);
 assert.throws(()=>parseDataset(dump(region['expert guidance']),'regional.nt'),/cannot contain regional overrides/);
});
