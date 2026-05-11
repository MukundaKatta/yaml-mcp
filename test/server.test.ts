import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { yamlToJson, jsonToYaml } from '../src/server.js';

test('parses simple key/value', () => {
  const v = yamlToJson('name: Mukunda\nage: 30\n');
  assert.deepEqual(v, { name: 'Mukunda', age: 30 });
});

test('parses lists', () => {
  const v = yamlToJson('- a\n- b\n- c\n');
  assert.deepEqual(v, ['a', 'b', 'c']);
});

test('parses nested structures', () => {
  const v = yamlToJson('a:\n  b:\n    - 1\n    - 2\n');
  assert.deepEqual(v, { a: { b: [1, 2] } });
});

test('multi-document mode returns an array of docs', () => {
  const v = yamlToJson('a: 1\n---\nb: 2\n', { allDocuments: true });
  assert.deepEqual(v, [{ a: 1 }, { b: 2 }]);
});

test('serializes JSON object to YAML', () => {
  const y = jsonToYaml({ name: 'x', tags: ['a', 'b'] });
  assert.match(y, /name: x/);
  assert.match(y, /tags:\n\s*- a/);
});

test('round-trip preserves structure', () => {
  const orig = { a: 1, b: [2, 3], c: { d: 'four' } };
  const y = jsonToYaml(orig);
  const back = yamlToJson(y);
  assert.deepEqual(back, orig);
});

test('throws on malformed YAML', () => {
  // YAML 1.2 is forgiving; use a clearly invalid construct.
  assert.throws(() => yamlToJson('key: value\n  bad indent: 1\nkey2:\n - [unclosed'));
});
