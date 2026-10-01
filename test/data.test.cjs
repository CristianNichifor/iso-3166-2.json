const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');
const { compile } = require('../compile.js');

test('published data has named countries and matching subdivision prefixes', () => {
  const data = JSON.parse(readFileSync(join(__dirname, '../iso-3166-2.json'), 'utf8'));
  assert.ok(Object.keys(data).length > 200, 'country coverage unexpectedly collapsed');
  for (const [country, value] of Object.entries(data)) {
    assert.match(country, /^[A-Z]{2}$/);
    assert.ok(value.name.trim());
    assert.equal(typeof value.divisions, 'object');
    for (const [code, name] of Object.entries(value.divisions)) {
      assert.ok(code.startsWith(country + '-'), code);
      assert.ok(name.trim(), code);
    }
  }
});

test('quoted names and both subdivision columns are preserved', () => {
  const result = compile('RO,,,Romania\n,RO-AB,,"Alba, example"\n,,RO-CJ,Cluj');
  assert.deepEqual(result, { RO: { name: 'Romania', divisions: { 'RO-AB': 'Alba, example', 'RO-CJ': 'Cluj' } } });
});

test('misassigned and duplicate codes fail rather than overwrite data', () => {
  assert.throws(() => compile('RO,,,Romania\n,US-CA,,California'), /country/);
  assert.throws(() => compile('RO,,,Romania\n,RO-AB,,Alba\n,RO-AB,,Other'), /duplicate/);
  assert.throws(() => compile('RO,,,Romania\nRO,,,Other'), /duplicate/);
  assert.throws(() => compile(',RO-AB,,Alba'), /country/);
});

test('identical names repeated in either subdivision column are harmless', () => {
  const source = 'RO,,,Romania\n,RO-AB,,Alba\n,,RO-AB,Alba\n,RO-AB,,Alba';
  assert.deepEqual(compile(source), { RO: { name: 'Romania', divisions: { 'RO-AB': 'Alba' } } });
});

test('historical conflicts require the exact reviewed ordered rows', () => {
  const rows = [['', '', 'GN-KD', 'Koundara'], ['', '', 'GN-KD', 'Kindia']];
  const exceptions = { 'GN-KD': rows };
  const source = 'GN,,,Guinea\n,,GN-KD,Koundara\n,,GN-KD,Kindia';
  assert.throws(() => compile(source), /conflicting duplicate subdivision code: GN-KD/);
  assert.equal(compile(source, exceptions).GN.divisions['GN-KD'], 'Kindia');
  for (const changed of [
    'GN,,,Guinea\n,,GN-KD,Kindia\n,,GN-KD,Koundara',
    'GN,,,Guinea\n,,GN-KD,Koundara\n,,GN-KD,Changed',
    'GN,,,Guinea\n,GN-KD,,Koundara\n,,GN-KD,Kindia',
    source + '\n,,GN-KD,Kindia',
    source + '\n,,GN-KD,Koundara',
  ]) {
    assert.throws(() => compile(changed, exceptions), /conflicting duplicate subdivision code: GN-KD/);
  }
  for (const sourceWithoutConflict of [
    'GN,,,Guinea',
    'GN,,,Guinea\n,,GN-KD,Koundara',
    'GN,,,Guinea\n,,GN-KD,Koundara\n,,GN-KD,Koundara',
  ]) {
    assert.throws(() => compile(sourceWithoutConflict, exceptions), /unused duplicate exception: GN-KD/);
  }
});

test('the reviewed historical source reproduces published JSON byte for byte', () => {
  const exceptions = require('../data/duplicate-exceptions.json');
  const source = readFileSync(join(__dirname, '../data/eQuest.csv'), 'utf8');
  const published = readFileSync(join(__dirname, '../iso-3166-2.json'), 'utf8');
  assert.equal(JSON.stringify(compile(source, exceptions), null, '  '), published);
  // Every exception is necessary, rather than a blanket exemption for a code.
  for (const code of Object.keys(exceptions)) {
    const reduced = { ...exceptions };
    delete reduced[code];
    assert.throws(() => compile(source, reduced), new RegExp('conflicting duplicate subdivision code: ' + code));
  }
});

test('CLI check detects drift without writing and failed builds preserve existing output', () => {
  // A disposable copy keeps the real published data read-only throughout the test.
  const fixture = mkdtempSync(join(__dirname, '.fixture-'));
  try {
    mkdirSync(join(fixture, 'data'));
    copyFileSync(join(__dirname, '../compile.js'), join(fixture, 'compile.js'));
    writeFileSync(join(fixture, 'data/duplicate-exceptions.json'), '{}');
    writeFileSync(join(fixture, 'data/eQuest.csv'), 'RO,,,Romania\n,RO-AB,,Alba');
    const output = join(fixture, 'iso-3166-2.json');
    writeFileSync(output, 'stale output');
    const run = (...args) => spawnSync(process.execPath, [join(fixture, 'compile.js'), ...args], { encoding: 'utf8', cwd: fixture });
    let result = run('--check');
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /generated data differs/);
    assert.equal(readFileSync(output, 'utf8'), 'stale output');

    result = run();
    assert.equal(result.status, 0, result.stderr);
    const generated = readFileSync(output, 'utf8');
    assert.deepEqual(JSON.parse(generated), { RO: { name: 'Romania', divisions: { 'RO-AB': 'Alba' } } });
    result = run('--check');
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /matches/);

    writeFileSync(join(fixture, 'data/eQuest.csv'), 'RO,,,Romania\n,RO-AB,,Alba\n,RO-AB,,Changed');
    result = run();
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /conflicting duplicate subdivision code: RO-AB/);
    assert.equal(readFileSync(output, 'utf8'), generated);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
