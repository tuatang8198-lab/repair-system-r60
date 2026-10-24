#!/usr/bin/env node
// delegate — vendor-neutral harness for handing tasks to other AI CLIs
// (claude, codex, gemini, qwen, opencode, copilot, ...).
//
// Every run is a fresh process ("new chat"): the brief goes in through a file,
// the answer comes back through a file, and only a short result is printed so
// the calling model's context stays small.
//
//   node scripts/delegate.mjs run <role> [--brief f.md | --prompt "..." | <stdin>]
//                                 [--backend name] [--model m] [--max-chars n] [--timeout s]
//   node scripts/delegate.mjs fork  --brief f.md           (same as: run fork)
//   node scripts/delegate.mjs retro <run-id|last> [--note "what went wrong"]
//   node scripts/delegate.mjs doctor                         which backends are installed
//   node scripts/delegate.mjs ls [n]                         recent runs
//
// Config: .claude/delegate/config.json   Lessons: .claude/delegate/lessons.md
// Runs:   .claude/handoff/<run-id>/{brief,prompt,result}.md + meta.json

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONF_DIR = path.join(ROOT, '.claude', 'delegate');
const HANDOFF_DIR = path.join(ROOT, '.claude', 'handoff');
const LESSONS = path.join(CONF_DIR, 'lessons.md');
const RUNS_LOG = path.join(CONF_DIR, 'runs.jsonl');
const IS_WIN = process.platform === 'win32';

// Output that means "this backend can't serve us right now, try the next one".
const UNAVAILABLE = /rate.?limit|quota|429|too many requests|unauthori[sz]ed|not logged in|please log ?in|authenticat|credit balance|usage limit|resource.?exhausted/i;

function die(msg) {
  console.error(`delegate: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function loadConfig() {
  const file = path.join(CONF_DIR, 'config.json');
  if (!fs.existsSync(file)) die(`missing ${path.relative(ROOT, file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function onPath(bin) {
  const r = spawnSync(IS_WIN ? 'where' : 'which', [bin], { encoding: 'utf8', shell: IS_WIN });
  return r.status === 0;
}

function readStdin() {
  if (process.stdin.isTTY) return '';
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function slug(s) {
  return (s.match(/[a-z0-9]+/gi) || ['task']).slice(0, 5).join('-').toLowerCase().slice(0, 40);
}

function newRunId(role, text) {
  const ts = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  return `${ts}-${role}-${slug(text)}`;
}

// cmd.exe needs quoting once a shell is involved (npm installs CLIs as .cmd shims).
function quoteWin(arg) {
  if (arg === '') return '""';
  if (!/[\s"&|<>^()%!]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '""')}"`;
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function buildArgs(backend, { model, write, promptFile, promptText }) {
  const vars = { model, promptFile, prompt: promptText };
  const args = [];
  for (const a of backend.args || []) args.push(fill(a, vars));
  if (model && backend.modelArgs) for (const a of backend.modelArgs) args.push(fill(a, vars));
  for (const a of (write ? backend.writeArgs : backend.readArgs) || []) args.push(fill(a, vars));
  for (const a of backend.tailArgs || []) args.push(fill(a, vars));
  return args;
}

function runProcess(bin, args, { input, cwd, timeoutSec }) {
  return new Promise((resolve) => {
    const child = IS_WIN
      ? spawn([bin, ...args].map(quoteWin).join(' '), { cwd, shell: true })
      : spawn(bin, args, { cwd });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutSec * 1000);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (e) => { stderr += String(e); });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code: timedOut ? 124 : code, stdout, stderr, timedOut });
    });
    if (input != null) child.stdin.end(input);
    else child.stdin.end();
  });
}

function lessonsFor(role, limit) {
  if (!fs.existsSync(LESSONS)) return '';
  const lines = fs.readFileSync(LESSONS, 'utf8').split('\n')
    .filter((l) => l.startsWith('- ') && (l.includes(`[${role}`) || l.includes('[all')));
  return lines.slice(-limit).join('\n');
}

function composePrompt(conf, role, brief) {
  const r = conf.roles[role];
  const lessons = lessonsFor(role, conf.lessonsInPrompt ?? 15);
  return [
    `# Role: ${role}`,
    r.instructions,
    lessons && `## Lessons from earlier runs (follow them)\n${lessons}`,
    `## Brief\n${brief.trim()}`,
    `## Output contract\n${conf.outputContract}`,
  ].filter(Boolean).join('\n\n') + '\n';
}

function logRun(meta) {
  fs.mkdirSync(CONF_DIR, { recursive: true });
  fs.appendFileSync(RUNS_LOG, JSON.stringify(meta) + '\n');
}

async function cmdRun(conf, role, opts) {
  const r = conf.roles[role];
  if (!r) die(`unknown role "${role}" (have: ${Object.keys(conf.roles).join(', ')})`);

  let brief = '';
  if (opts.brief) brief = fs.readFileSync(path.resolve(opts.brief), 'utf8');
  else if (typeof opts.prompt === 'string') brief = opts.prompt;
  else brief = readStdin();
  if (!brief.trim()) die('empty brief: pass --brief <file>, --prompt "...", or pipe it on stdin');

  const runId = newRunId(role, brief.split('\n').find((l) => l.trim()) || role);
  const dir = path.join(HANDOFF_DIR, runId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  const prompt = composePrompt(conf, role, brief);
  const promptFile = path.join(dir, 'prompt.md');
  fs.writeFileSync(promptFile, prompt);

  let chain = r.chain;
  if (opts.backend) chain = [{ backend: opts.backend, model: opts.model }];
  else if (opts.model) chain = chain.map((c) => ({ ...c, model: opts.model }));

  const attempts = [];
  let result = null;
  for (const step of chain) {
    const backend = conf.backends[step.backend];
    if (!backend) { attempts.push({ backend: step.backend, skipped: 'not in config' }); continue; }
    if (!onPath(backend.bin)) { attempts.push({ backend: step.backend, skipped: 'not installed' }); continue; }

    const viaStdin = backend.stdin !== false;
    const promptText = viaStdin ? '' : fill(conf.filePrompt, { promptFile });
    const args = buildArgs(backend, { model: step.model, write: r.write, promptFile, promptText });
    const t0 = Date.now();
    const res = await runProcess(backend.bin, args, {
      input: viaStdin ? prompt : null,
      cwd: ROOT,
      timeoutSec: Number(opts.timeout || r.timeoutSec || conf.timeoutSec || 900),
    });
    const secs = Math.round((Date.now() - t0) / 1000);
    const text = res.stdout.trim();
    const unavailable = UNAVAILABLE.test(res.stderr + (res.code ? text : ''));
    const attempt = { backend: step.backend, model: step.model || null, code: res.code, secs };
    attempts.push(attempt);
    if (res.code === 0 && text && !(unavailable && text.length < 300)) {
      result = { ...attempt, text };
      break;
    }
    attempt.error = (res.timedOut ? 'timeout' : unavailable ? 'unavailable' : 'failed')
      + ': ' + (res.stderr || text).trim().split('\n').slice(-3).join(' | ').slice(0, 300);
  }

  const meta = {
    id: runId, role, at: new Date().toISOString(),
    ok: !!result, backend: result?.backend ?? null, model: result?.model ?? null,
    secs: result?.secs ?? null, attempts,
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
  logRun(meta);

  const rel = path.relative(ROOT, dir).split(path.sep).join('/');
  if (result) fs.writeFileSync(path.join(dir, 'result.md'), result.text + '\n');
  if (opts.quiet) return result;
  if (!result) {
    console.log(`RUN ${runId} FAILED — no backend in the "${role}" chain answered.`);
    for (const a of attempts) console.log(`  - ${a.backend}: ${a.skipped || a.error || 'failed'}`);
    console.log(`Run \`node scripts/delegate.mjs doctor\` to see which CLIs are installed/logged in.`);
    process.exitCode = 1;
    return null;
  }

  const max = Number(opts['max-chars'] || conf.maxPrintChars || 4000);
  const shown = result.text.length > max
    ? result.text.slice(-max) + `\n\n[…truncated; full result in ${rel}/result.md]`
    : result.text;
  console.log(`RUN ${runId} ok via ${result.backend}${result.model ? `/${result.model}` : ''} in ${result.secs}s (handoff: ${rel}/)`);
  console.log(shown);
  return result;
}

function findRun(id) {
  if (id === 'last' || !id) {
    if (!fs.existsSync(RUNS_LOG)) die('no runs yet');
    const lines = fs.readFileSync(RUNS_LOG, 'utf8').trim().split('\n');
    const last = [...lines].reverse().map((l) => JSON.parse(l)).find((m) => m.role !== 'retro');
    if (!last) die('no runs yet');
    id = last.id;
  }
  const dir = path.join(HANDOFF_DIR, id);
  if (!fs.existsSync(dir)) die(`no handoff dir for ${id}`);
  return { id, dir };
}

async function cmdRetro(conf, opts) {
  const { id, dir } = findRun(opts._[1]);
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '(none)');
  const meta = JSON.parse(read('meta.json'));
  const brief = [
    `Review this delegated run and extract lessons so the next run goes better.`,
    `Run id: ${id}  role: ${meta.role}  ok: ${meta.ok}  backend: ${meta.backend}`,
    `Attempts: ${JSON.stringify(meta.attempts)}`,
    opts.note ? `Feedback from the caller: ${opts.note}` : '',
    `### Brief that was sent\n${read('brief.md')}`,
    `### Result that came back\n${read('result.md').slice(0, 12000)}`,
    `### Existing lessons (do not repeat these)\n${fs.existsSync(LESSONS) ? fs.readFileSync(LESSONS, 'utf8').slice(-4000) : '(none)'}`,
    `Reply with 0-3 NEW lessons only, one per line, exactly in this form:`,
    `- [${meta.role}] <lesson about how to brief or do this kind of task>`,
    `- [${meta.role}/${meta.backend}] <lesson specific to that backend>`,
    `- [all] <lesson for every role>`,
    `Reply "NONE" if there is nothing new worth keeping.`,
  ].filter(Boolean).join('\n\n');

  const retroRole = conf.roles.retro ? 'retro' : 'advisor';
  const res = await cmdRun(conf, retroRole, { prompt: brief, quiet: true });
  if (!res) { console.log(`RETRO ${id} FAILED — no ${retroRole} backend answered.`); process.exitCode = 1; return; }

  const newLessons = res.text.split('\n').filter((l) => /^- \[(all|[\w/.-]+)\]/.test(l.trim())).map((l) => l.trim());
  if (!newLessons.length) { console.log(`RETRO ${id}: nothing new.`); return; }
  if (!fs.existsSync(LESSONS)) fs.writeFileSync(LESSONS, '# Delegate lessons\n\n');
  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(LESSONS, newLessons.map((l) => `${l} (${date}, ${id})`).join('\n') + '\n');
  console.log(`RETRO ${id}: added ${newLessons.length} lesson(s) to .claude/delegate/lessons.md`);
  console.log(newLessons.join('\n'));
}

function cmdDoctor(conf) {
  for (const [name, b] of Object.entries(conf.backends)) {
    console.log(`${onPath(b.bin) ? 'OK  ' : '--  '} ${name.padEnd(9)} bin=${b.bin}${b.login ? `   login: ${b.login}` : ''}`);
  }
  console.log('\nRole chains (first installed+working backend wins):');
  for (const [role, r] of Object.entries(conf.roles)) {
    console.log(`  ${role.padEnd(10)} ${r.chain.map((c) => c.backend + (c.model ? `/${c.model}` : '')).join(' → ')}`);
  }
}

function cmdLs(n) {
  if (!fs.existsSync(RUNS_LOG)) return console.log('no runs yet');
  const lines = fs.readFileSync(RUNS_LOG, 'utf8').trim().split('\n').slice(-(Number(n) || 10));
  for (const l of lines) {
    const m = JSON.parse(l);
    console.log(`${m.ok ? 'ok  ' : 'FAIL'} ${m.id}  ${m.backend || '-'}${m.secs != null ? ` ${m.secs}s` : ''}`);
  }
}

const opts = parseArgs(process.argv.slice(2));
const conf = loadConfig();
switch (opts._[0]) {
  case 'run': await cmdRun(conf, opts._[1], opts); break;
  case 'fork': await cmdRun(conf, 'fork', opts); break;
  case 'retro': await cmdRetro(conf, opts); break;
  case 'doctor': cmdDoctor(conf); break;
  case 'ls': cmdLs(opts._[1]); break;
  default:
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 20).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
}
