---
name: delegate
description: Hand work to other AI CLIs (codex, gemini, Antigravity agy, qwen, opencode, copilot, claude) through scripts/delegate.mjs so the main context stays small and free tiers do the bulk work. Use when a task is self-contained, when you want a stronger model's opinion, when mechanical work can go to a cheap model, or when the user says delegate / advisor / worker / fork / retro / handoff.
---

# Delegate harness

One vendor-neutral command, `node scripts/delegate.mjs`, runs a task on another
CLI in a **fresh process** and returns only a short result. Briefs and results
are files under `.claude/handoff/<run-id>/`, so nothing piles up in your context.

## Roles

| Role | Model tier | Edits files | Chain (first installed + working wins) | Use for |
|---|---|---|---|---|
| `advisor` | strong | no | codex → claude opus → gemini | plans, design calls, reviews, hard bugs |
| `worker` | small / free | yes | agy Gemini 3.8 Flash → gemini flash → gemini flash-lite → qwen → opencode → copilot → claude haiku | mechanical, fully specified jobs |
| `worker-pro` | strong subordinate | yes | agy Gemini 4 Argon → agy 3.8 Flash high → gemini pro → claude sonnet | harder grunt work across several files |
| `fork` | same as you | yes | claude sonnet → codex → gemini | a whole slice of your own work, with your context |
| `retro` | strong | no | claude opus → codex → gemini | turns a finished run into lessons |

Gemini 4 Argon and 3.8 Flash are reached through the Antigravity CLI (`agy`), not the Gemini chat app, which has no command line; check slugs with `agy models`.
Chains and CLI flags live in `.claude/delegate/config.json`. A backend that is not
installed is skipped; one that hits a rate limit / quota / login error falls through
to the next.

## How

Prefer the relay subagents — they write the brief, run it and trim the answer:
`delegate-advisor`, `delegate-worker`, `delegate-fork`.

Or call it directly:

```bash
node scripts/delegate.mjs run advisor --brief .claude/delegate/briefs/x.md
node scripts/delegate.mjs run worker  --prompt "Rename foo to bar in src/a.js only"
node scripts/delegate.mjs fork        --brief .claude/delegate/briefs/slice.md
node scripts/delegate.mjs run worker --backend gemini --model gemini-2.5-flash --prompt "..."
node scripts/delegate.mjs ls          # recent runs
node scripts/delegate.mjs doctor      # what is installed
```

## Writing the brief (handoff)

The other side starts with **zero context**. Use `.claude/delegate/templates/brief.md`:
goal, context (paths, decisions, what failed), task, scope (may read / may edit /
do not touch), checks. A vague brief is the #1 cause of bad runs.

## Feedback loop

After a run that went wrong (or surprisingly well):

```bash
node scripts/delegate.mjs retro <run-id|last> --note "worker edited files outside scope"
```

The retro model writes 0–3 lessons to `.claude/delegate/lessons.md`. Lessons tagged
with a role (`[worker]`, `[worker/gemini]`, `[all]`) are injected into every future
brief for that role automatically. Prune that file by hand when it gets long.

## Rules

- ALWAYS check the result yourself (diff, tests) before telling the user it is done.
- NEVER put secrets or tokens in a brief — briefs go to third-party services.
- Workers get fully specified tasks only; judgement calls go to `advisor` or stay with you.
- One retry at most per task; after that, do it yourself or ask the user.
