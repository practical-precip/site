import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMarkdown} from './markdown-content.mjs';
const parse = (text, shape) => parseMarkdown('# Example\n\n' + text, shape, 'example.md');

test('underscore labels preserve punctuation, prose and equations', () => {
 const parsed = parse('- __Name:__ rain | snow; mixed\n- __Count:__ 2\n\n## Guidance\n\nFree __prose__ and $x^2$.\n', {name:'string',count:'number'});
 assert.deepEqual(parsed.value, {name:'rain | snow; mixed',count:2});
 assert.equal(parsed.body, '\nFree __prose__ and $x^2$.\n');
});
test('soft-wrapped values and Windows line endings work', () => {
 const parsed = parse('- __Name:__ A long description\r\n  continued here.\r\n\r\n## Guidance\r\n\r\nAdvice.\r\n', {name:'string'});
 assert.equal(parsed.value.name, 'A long description continued here.');
 assert.equal(parsed.body, '\nAdvice.\n');
});
test('nested lists keep string codes, semicolons, nulls and numbers distinct', () => {
 const parsed = parse('1. __Id:__ west\n   - __States:__\n     - 06\n     - 53\n   - __Label:__\n     - 170\n     - 105\n   - __Notes:__\n     - Keep this; together\n   - __Count:__ (not recorded)\n', [{id:'string',states:['string'],label:['number'],notes:['string'],count:'number'}]);
 assert.deepEqual(parsed.value, [{id:'west',states:['06','53'],label:[170,105],notes:['Keep this; together'],count:null}]);
});
test('objects support nested labeled fields as well as section headings', () => {
 const shape={coverage:{timestep:'string',scenarios:['string']},funding:[{agency:'string'}]};
 const nested=parse('- __Coverage:__\n  - __Timestep:__ Daily\n  - __Scenarios:__\n    - SSP2-4.5\n- __Funding:__ No entries.\n',shape);
 const headings=parse('## Coverage\n\n- __Timestep:__ Daily\n\n### Scenarios\n\n- SSP2-4.5\n\n## Funding\n\nNo entries.\n',shape);
 assert.deepEqual(nested.value,headings.value);
});
test('duplicate fields, unknown sections and wrong formatting have clear errors', () => {
 assert.throws(()=>parse('- __Name:__ A\n- __Name:__ B\n',{name:'string'}),/example.md: Duplicate field/);
 assert.throws(()=>parse('## Typo\n\nNo entries.\n',{}),/example.md: Unknown section/);
 assert.throws(()=>parse('- **Name:** A\n',{name:'string'}),/double underscores/);
 assert.throws(()=>parse('| Field | Value |\n| --- | --- |\n| Name | rain |\n',{name:'string'}),/instead of metadata tables/);
});
test('indentation errors cannot silently absorb or discard fields', () => {
 assert.throws(()=>parse('- __Name:__ a\n  - __Unit:__ mm\n',{name:'string'}),/check list indentation/);
 assert.throws(()=>parse('- __Name:__ a\n  __Unit:__ mm\n',{name:'string'}),/additional field with a bullet/);
 assert.throws(()=>parse('1. __Name:__ a\n- __Unit:__ mm\n',[{name:'string',unit:'string'}]),/numbered entries/);
 assert.throws(()=>parse('- __Scenarios:__ SSP2-4.5; SSP5-8.5\n',{scenarios:['string']}),/requires an indented list/);
});
test('empty markers cannot coexist with values and reserved names are rejected', () => {
 assert.throws(()=>parse('No entries.\n\n- A\n',['string']),/Replace No entries/);
 assert.throws(()=>parse('- A\n\nNo entries.\n',['string']),/cannot be combined/);
 assert.throws(()=>parse('- __Constructor:__ unsafe\n',{}),/Reserved field/);
});
