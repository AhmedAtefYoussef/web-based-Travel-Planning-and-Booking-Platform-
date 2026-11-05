// SessionStart hook: prints the live state (T1) so a fresh session starts in <= 5 tool calls.
// Team mode (spec §13): the Leader sees state.md + HANDOFF.md; a member sees state.md (read-only),
// their own .swarm/handoff/<slug>.md and their owned paths. Output becomes session context; keep it under 80 lines.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { who } from './lib/who.mjs';

const sh = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
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

const me = who();
const out = [];
if (me.role === 'leader') {
  out.push(`=== team mode: ${me.name} (leader, via ${me.source}) ===`);
  out.push('=== .swarm/state.md ===', show('.swarm/state.md', 28));
  out.push('=== .swarm/HANDOFF.md ===', show('.swarm/HANDOFF.md', 32));
} else {
  if (me.hint) out.push(me.hint);
  out.push(`=== team mode: ${me.name ?? 'unidentified'} (member${me.slug ? `, via ${me.source}` : ''}) ===`);
  out.push('Rules: work only in your owned paths; Leader-only files are read-only for you (CLAUDE.md "## Roles").');
  if (me.owns.length) out.push(`Owned paths: ${me.owns.join(', ')}`);
  out.push('=== .swarm/state.md (read-only) ===', show('.swarm/state.md', 22));
  if (me.slug) {
    const mine = `.swarm/handoff/${me.slug}.md`;
    out.push(`=== ${mine} (yours) ===`, existsSync(mine) ? show(mine, 30) : '(none yet: /handoff creates it at the end of your session)');
  }
}
out.push('=== git ===', `branch: ${sh('branch', '--show-current')}`, sh('status', '-sb').split('\n').slice(0, 6).join('\n'));
out.push(sh('log', '--oneline', '-5'));
out.push(`worktrees: ${sh('worktree', 'list').split('\n').filter(Boolean).length}`);

// Warn when state.md is older than the newest commit on develop.
const develop = sh('log', '-1', '--format=%ct', 'origin/develop') || sh('log', '-1', '--format=%ct', 'develop');
if (develop && existsSync('.swarm/state.md')) {
  const stateTime = Math.floor(statSync('.swarm/state.md').mtimeMs / 1000);
  if (Number(develop) > stateTime) {
    out.push(
      me.role === 'leader'
        ? 'WARNING: .swarm/state.md is older than the newest commit on develop; refresh it before planning.'
        : 'Note: .swarm/state.md may be behind develop; ask the Leader if something looks stale.',
    );
  }
}
console.log(out.join('\n'));
