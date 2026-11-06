// SessionStart hook: prints branch state and the user's local handoff so a new session starts oriented.
// Output becomes session context; keep it short.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

const branch = git('branch', '--show-current') || '(detached)';
const slug = (git('config', 'user.name').split(/\s+/)[0] || 'me').toLowerCase();
const behind = git('rev-list', '--count', `HEAD..origin/develop`);
const ahead = git('rev-list', '--count', `origin/develop..HEAD`);
const dirty = git('status', '--porcelain').split('\n').filter(Boolean);

const out = [`=== session: ${slug} on ${branch} (ahead ${ahead || '?'}, behind develop ${behind || '?'}; ${dirty.length} uncommitted) ===`];
if (branch === 'develop' || branch === 'main') {
  out.push(`You are on ${branch}. Create a branch first: git switch -c feature/<ID>-<slug> origin/develop`);
}
const idMatch = branch.match(/(?:feature|fix)\/([A-Z]{2,4}-\d+[a-z]?)/);
if (idMatch) out.push(`Requirement on this branch: ${idMatch[1]}  ->  node .claude/skills/req/req.mjs ${idMatch[1]}`);
const handoff = `.claude/handoff/${slug}.md`;
if (existsSync(handoff)) {
  const lines = readFileSync(handoff, 'utf8').trimEnd().split(/\r?\n/).slice(0, 25);
  out.push(`=== ${handoff} ===`, ...lines);
}
console.log(out.join('\n'));
