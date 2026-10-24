# repair-system-r60

Static React (JSX via Babel in the browser) repair-ticket app for a school, backed by Supabase.
Entry: `index.html`; screens in `src/screens-*.jsx`; Supabase config in `src/config.js`; schema in `supabase-setup.sql`.

## DELEGATE FIRST — KEEP THE MAIN CONTEXT SMALL

The main session runs on an ordinary model. BEFORE doing a large or self-contained task yourself, hand it off:

- **UNSURE / HIGH-STAKES DECISION →** `delegate-advisor` subagent (strong model, read-only).
- **MECHANICAL, FULLY SPECIFIED WORK →** `delegate-worker` subagent (role `worker`: Gemini 3.8 Flash / flash-lite; role `worker-pro`: Gemini 4 Argon).
- **A WHOLE SLICE OF YOUR OWN WORK →** `delegate-fork` subagent (a copy of you, with a handoff file).
- **A RUN WENT WRONG →** `node scripts/delegate.mjs retro <run-id> --note "..."` so the lesson sticks.

All of them go through `node scripts/delegate.mjs` (see the `delegate` skill). Each run is a fresh process that
reads its brief from a file and writes its result to `.claude/handoff/<run-id>/` — talk through files, not chat history.
ALWAYS verify a delegated result (diff, run it) before reporting it done. NEVER put secrets in a brief.

Setup on a new machine: `node scripts/delegate-setup.mjs --install`, then `--login <backend>` for each, then `node scripts/delegate.mjs doctor`.
