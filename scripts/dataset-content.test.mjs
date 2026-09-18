import test from 'node:test';
import assert from 'node:assert/strict';
import yaml from 'js-yaml';
import {parseDataset,parseGuidance,readDatasetIndex} from './dataset-content.mjs';

const identity={
 id:'example',name:'From the index',aliases:['Familiar name'],
 metadataFile:'datasets/example.yaml',guidanceFile:'guidance/datasets/example.md',
};
const dataset={
 version:'v1',summary:'Example',provider:'Provider',verified_on:'2026-09-17',source_scope:'Sources checked',kind:'observation',
 method:{family:'Observed',description:'Example',reference_dataset:'Example',training_period:'Not applicable'},
 coverage:{domain:'CONUS',grid:'Regular',timestep:'Daily',historical:'2000-2020',future:'Not applicable',calendar:'Gregorian',grid_spacing:{value:0.0625,unit:'degrees'},scenarios:['Historical'],variables:[{name:'pr',unit:'mm',description:'Precipitation'}]},
 ensemble:{driving_models:'Not applicable',model_count:null,members:'Not applicable',member_counts:[]},
 access:{landing_page:'https://example.org',data:'https://example.org/data',format:'NetCDF',license:'Example',license_url:null,subsetting:'None',cost:'None'},
 references:[],metadata_sources:[{url:'https://example.org',locator:'Landing page'}],relevant_rows:[],generation:[],
 dates:{created:null,released:null,publication:null,notes:'Unknown'},existing_uses:[],funding:[],associated_resources:[],
};
const guidance=`---\ntitle: Guidance\nsummary: Scope\nreview:\n  status: draft\n  updated: '2026-09-17'\n  contributors:\n    - An expert\nevidence: []\n---\n\n## Evaluation\n\nLiteral \\sum_i, __emphasis__, "quotes", # and |.\n`;

test('YAML metadata and Markdown guidance remain separate and gain index identity',()=>{
 const product=parseDataset(yaml.dump(dataset),'datasets/example.yaml',identity);
 const document=parseGuidance(guidance,'guidance/datasets/example.md');
 assert.equal(product.value.coverage.grid_spacing.value,0.0625);
 assert.equal(product.value.ensemble.model_count,null);
 assert.equal(product.value.id,'example');
 assert.equal(product.value.name,'From the index');
 assert.equal(product.value.guidance,'product-guidance/example.md');
 assert.match(document.body,/Literal \\sum_i/);
});

test('INDEX.md links both files and supplies names, IDs, aliases, and ordering',()=>{
 const raw='# Index\n\n## Datasets\n\n- __Second__ ([Guidance](guidance/datasets/two.md), [Metadata](datasets/two.yaml))\n  - Alias: Other name\n- __First__ ([Guidance](guidance/datasets/one.md), [Metadata](datasets/one.yaml))\n\n## Guidance boxes\n';
 const entries=readDatasetIndex(raw);
 assert.deepEqual(entries.map(r=>r.id),['two','one']);
 assert.equal(entries[0].name,'Second');
 assert.deepEqual(entries[0].aliases,['Other name']);
});

test('duplicate IDs, mismatched pairs, unsafe paths, and missing sections fail',()=>{
 assert.throws(()=>readDatasetIndex('## Datasets\n\n- __A__ ([Guidance](guidance/datasets/a.md), [Metadata](datasets/a.yaml))\n- __B__ ([Guidance](guidance/datasets/a.md), [Metadata](datasets/a.yaml))'),/duplicate dataset ID/);
 assert.throws(()=>readDatasetIndex('## Datasets\n\n- __A__ ([Guidance](guidance/datasets/a.md), [Metadata](datasets/b.yaml))'),/matching filename stems/);
 assert.throws(()=>readDatasetIndex('## Datasets\n\n- __A__ ([Guidance](..\/a.md), [Metadata](datasets/a.yaml))'),/invalid dataset/);
 assert.throws(()=>readDatasetIndex('## Missing\n'),/expected one/);
});

test('YAML syntax, duplicate fields, source identities, and invalid types fail clearly',()=>{
 assert.throws(()=>parseDataset('version: one\nversion: two','bad.yaml',identity),/bad.yaml:.*duplicated mapping key/i);
 assert.throws(()=>parseDataset('version:\n bad','bad.yaml',identity),/bad.yaml/);
 assert.throws(()=>parseDataset(yaml.dump({...dataset,name:'Duplicate'}),'bad.yaml',identity),/defined by INDEX.md/);
 const invalid=structuredClone(dataset);invalid.ensemble.model_count='many';
 assert.throws(()=>parseDataset(yaml.dump(invalid),'bad.yaml',identity),/model_count/);
});

test('guidance front matter and regional overrides are validated',()=>{
 const regional=guidance.replace('evidence: []','evidence: []\nregions:\n  northwest: guidance/datasets/regional/example.northwest.md');
 assert.equal(parseGuidance(regional,'example.md').value.regions.northwest,'product-guidance/example.northwest.md');
 assert.throws(()=>parseGuidance(guidance.replace('evidence: []','evidence: []\nregions:\n  northwest: ../private.md'),'bad.md'),/invalid regional/);
 assert.throws(()=>parseGuidance('No front matter','bad.md'),/front matter/);
});
