#!/usr/bin/env node
// Native Godot tests against exported states from the authoritative JS runtime.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureArg = process.argv.find(arg => arg.startsWith('--fixtures='));
const fixture = fixtureArg ? path.resolve(fixtureArg.slice('--fixtures='.length)) : path.join(root, 'godot/tests/fixtures/rules-oracle.json.gz');
const runtime = process.env.XDG_DATA_HOME || path.resolve(root, '../.godot-runtime');
fs.mkdirSync(path.join(runtime, 'config'), {recursive: true});
const env = {...process.env, XDG_DATA_HOME: runtime, XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME || path.join(runtime, 'config')};
const godot = process.env.GODOT_BIN || 'godot';
const outcomes = [];
if (!fs.existsSync(fixture)) throw Error('Missing rules oracle fixtures. Run the content exporter first, or pass --fixtures=/path/to/fixtures.json.');
for (const [test, args] of [['rules_oracle_test.gd', ['--', '--fixtures=' + fixture]], ['rules_gameplay_test.gd', []]]) {
  const result = spawnSync(godot, ['--headless', '--path', path.join(root, 'godot'), '--script', 'res://tests/' + test, ...args], {env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  const match = (result.stdout || '').match(/Native (?:rules oracle|gameplay rules): (\d+) checks, (\d+) failures/);
  outcomes.push({test, checks: match ? Number(match[1]) : 0, failures: match ? Number(match[2]) : 1});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const fixtureBytes = fs.readFileSync(fixture);
const fixtures = JSON.parse((fixture.endsWith('.gz') ? gunzipSync(fixtureBytes) : fixtureBytes).toString('utf8'));
const report = {engine: 'Godot 4.6.3', fixture: path.relative(root, fixture), levels: fixtures.length, firstActions: fixtures.reduce((n,f)=>n+f.actions.length,0), certifiedRouteActions: fixtures.reduce((n,f)=>n+(f.route||[]).length,0), certifiedGoalsVerified: fixtures.filter(f=>(f.route||[]).length).length, outcomes};
const reportPath = path.join(root, 'godot/tests/fixtures/rules-parity-report.json');
fs.mkdirSync(path.dirname(reportPath), {recursive:true});
fs.writeFileSync(reportPath, JSON.stringify(report,null,2)+'\n');
