#!/usr/bin/env node
// Install and log in the AI CLIs that scripts/delegate.mjs hands work to.
//
//   node scripts/delegate-setup.mjs                 show what is installed
//   node scripts/delegate-setup.mjs --install       npm-install every missing CLI
//   node scripts/delegate-setup.mjs --install gemini qwen
//   node scripts/delegate-setup.mjs --login gemini  open that CLI's login flow here
//
// Login is interactive (browser / OAuth), so it has to be done once by a person.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conf = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude', 'delegate', 'config.json'), 'utf8'));
const IS_WIN = process.platform === 'win32';
const args = process.argv.slice(2);
const flag = args.find((a) => a.startsWith('--'));
const names = args.filter((a) => !a.startsWith('--'));
const picked = Object.entries(conf.backends).filter(([n]) => !names.length || names.includes(n));

const onPath = (bin) => spawnSync(IS_WIN ? 'where' : 'which', [bin], { shell: IS_WIN }).status === 0;
const sh = (cmd) => spawnSync(cmd, { stdio: 'inherit', shell: true }).status === 0;

if (flag === '--install') {
  for (const [name, b] of picked) {
    if (onPath(b.bin)) { console.log(`✓ ${name} already installed`); continue; }
    const cmd = typeof b.install === 'string' ? b.install : (b.install[process.platform] || b.install.default);
    console.log(`→ ${name}: ${cmd}`);
    if (!sh(cmd)) console.log(`✗ ${name} failed to install — try the command above by hand`);
  }
} else if (flag === '--login') {
  if (names.length !== 1) { console.error('usage: --login <backend>'); process.exit(2); }
  const b = conf.backends[names[0]];
  if (!b) { console.error(`unknown backend ${names[0]}`); process.exit(2); }
  const cmd = b.login.split('  (')[0];
  console.log(`Running "${cmd}" — finish the login, then exit the CLI. Hint: ${b.login}`);
  sh(cmd);
  process.exit(0);
}

console.log('\nBackend   installed  login');
for (const [name, b] of picked) {
  console.log(`${name.padEnd(9)} ${onPath(b.bin) ? 'yes      ' : 'no       '}  ${b.login}`);
  if (b.models) console.log(`${''.padEnd(21)}models: ${b.models}`);
}
console.log('\nLog in each installed CLI once:  node scripts/delegate-setup.mjs --login <backend>');
console.log('Then check:                      node scripts/delegate.mjs doctor');
