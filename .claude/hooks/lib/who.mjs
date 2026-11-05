// Team identity for the Claude Code hooks and skills (team mode, spec §13).
// Order: CLAUDE_TEAM_MEMBER=<slug>, then `git config user.name` against .claude/team.json names.
// No match → role "member" with no owned paths, plus a one-line setup hint.
// CLI: `node .claude/hooks/lib/who.mjs` prints the identity as JSON (used by the leader-only skills).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function loadTeam() {
  const file = join(root, '.claude', 'team.json');
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  } catch {
    return [];
  }
}

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export function who() {
  const team = loadTeam();
  const envSlug = norm(process.env.CLAUDE_TEAM_MEMBER);
  if (envSlug) {
    const m = team.find((t) => t.slug === envSlug);
    if (m) return { ...m, source: 'CLAUDE_TEAM_MEMBER' };
  }
  let gitName = '';
  try {
    gitName = norm(execFileSync('git', ['config', 'user.name'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    // no git identity
  }
  if (gitName) {
    const m =
      team.find((t) => norm(t.name) === gitName) ??
      team.find((t) => norm(t.name).split(' ')[0] === gitName.split(' ')[0]);
    if (m) return { ...m, source: 'git config user.name' };
  }
  return {
    name: null,
    slug: null,
    githubHandle: null,
    role: 'member',
    owns: [],
    source: 'unknown',
    hint: `Unknown team member${envSlug ? ` "${envSlug}"` : ''}: set CLAUDE_TEAM_MEMBER to your slug from .claude/team.json (see docs/team/claude-code-onboarding.md).`,
  };
}

/** Glob match for repo-relative paths: ** = any depth, * = within one segment, ? = one char. */
export function matches(path, glob) {
  const re = glob
    .split('**')
    .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]'))
    .join('.*');
  return new RegExp(`^${re}$`, 'i').test(path);
}

export const ownsPath = (identity, path) => identity.owns.some((g) => matches(path, g));

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { name, slug, role, owns, source, hint } = who();
  console.log(JSON.stringify({ name, slug, role, source, owns, hint }, null, 2));
}
