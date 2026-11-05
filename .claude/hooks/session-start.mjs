// SessionStart hook: prints the live state (T1) so a fresh session starts in <= 5 tool calls.
// Output becomes session context; keep it under 80 lines.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const show = (path, maxLines) => {
  if (!existsSync(path)) return `(${path} missing)`;
  const lines = readFileSync(path, 'utf8').trimEnd().split(/\r?\n/);
  return lines.length > maxLines
    ? [...lines.slice(0, maxLines), `… (${lines.length - maxLines} more lines in ${path})`].join('\n')
    : lines.join('\n');
};

const out = [];
out.push('=== .swarm/state.md ===', show('.swarm/state.md', 28));
out.push('=== .swarm/HANDOFF.md ===', show('.swarm/HANDOFF.md', 34));
out.push('=== git ===', `branch: ${sh('git branch --show-current')}`, sh('git status -sb').split('\n').slice(0, 6).join('\n'));
out.push(sh('git log --oneline -5'));
const worktrees = sh('git worktree list').split('\n').filter(Boolean).length;
out.push(`worktrees: ${worktrees}`);

// Warn when state.md is older than the newest commit on develop.
const develop = sh('git log -1 --format=%ct origin/develop') || sh('git log -1 --format=%ct develop');
if (develop && existsSync('.swarm/state.md')) {
  const stateTime = Math.floor(statSync('.swarm/state.md').mtimeMs / 1000);
  if (Number(develop) > stateTime) {
    out.push('WARNING: .swarm/state.md is older than the newest commit on develop; refresh it before planning.');
  }
}
console.log(out.join('\n'));
