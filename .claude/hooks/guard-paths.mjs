// PreToolUse hook for Edit/Write: blocks writes to secrets, the lockfile and the requirements source.
// Defence in depth only (settings.json deny rules and .gitignore are the real controls). Fails closed.
// Exit code 2 blocks the tool call; stderr is shown to Claude as the reason.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { loadTeam, matches, ownsPath, who } from './lib/who.mjs';

// Team mode (spec §13): paths only the Leader may edit. Members get exit 2 here.
const LEADER_ONLY = [
  '.swarm/state.md', '.swarm/context.md', '.swarm/ledger.md', '.swarm/metrics.md', '.swarm/api.md', '.swarm/jira-plan.md',
  '.swarm/HANDOFF.md', '.swarm/config.md', '.swarm/rules.md', '.swarm/tasks/**', '.swarm/out/**', '.swarm/bin/**', '.swarm/archive/**',
  'backend/src/app.module.ts', 'backend/src/common/contracts/**', '.github/**', 'docs/requirements/**', '.claude/**',
];
// Always fine for members: their own handoff file is added at runtime.
const MEMBER_SHARED = ['AI_PROMPTS.txt', '.swarm/tmp/**'];

const block = (reason, shown) => {
  console.error(`Blocked by .claude/hooks/guard-paths.mjs: ${reason} (${shown})`);
  process.exit(2);
};

let target;
try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
} catch {
  block('unreadable hook input (fail closed)', '?');
}
if (!target) process.exit(0);

// realpathSync.native also expands Windows 8.3 short names (TEAM-D~1); fall back to the JS version.
const canon = (p) => {
  try {
    return realpathSync.native(p);
  } catch {
    return realpathSync(p);
  }
};
// Resolve the nearest existing ancestor and append the rest, so a symlink anywhere above a new file is followed.
const real = (p) => {
  let abs = resolve(p);
  const rest = [];
  while (!existsSync(abs)) {
    const parent = dirname(abs);
    if (parent === abs) return resolve(p);
    rest.unshift(basename(abs));
    abs = parent;
  }
  return resolve(canon(abs), ...rest);
};

try {
  const root = real(process.env.CLAUDE_PROJECT_DIR || process.cwd());
  const raw = relative(root, real(target)).split('\\').join('/');
  // Alternate data streams (file.txt:stream) and other colon tricks are never legitimate here.
  if (raw.split('/').some((c) => c.includes(':'))) block('colon in a path component', raw);
  // Windows ignores trailing dots/spaces and case; macOS ignores case. Normalise every component.
  const fold = process.platform === 'win32' || process.platform === 'darwin' ? (s) => s.toLowerCase() : (s) => s;
  const parts = raw.split('/').map((c) => fold(c.replace(/[. ]+$/, '')));
  const rel = parts.join('/');
  if (parts.some((c) => /^\.env/i.test(c) && c !== '.env.example')) block('env files hold secrets; edit them by hand', rel);
  if (parts.some((c) => /^team-db-access$/i.test(c) || /~\d/.test(c))) block('team-db-access holds credentials', rel);
  if (rel === 'backend/package-lock.json') block('change dependencies with npm, not by editing the lockfile', rel);
  if (rel === 'docs/requirements/reqs.json' && process.env.ALLOW_REQS_EDIT !== '1') {
    block('reqs.json is the requirements source; set ALLOW_REQS_EDIT=1 to change it deliberately', rel);
  }

  const me = who();
  if (me.role !== 'leader') {
    const path = raw.split('/').map((c) => c.replace(/[. ]+$/, '')).join('/');
    const own = me.slug ? [`.swarm/handoff/${me.slug}.md`] : [];
    if (![...own, ...MEMBER_SHARED].some((g) => matches(path, g))) {
      if (LEADER_ONLY.some((g) => matches(path, g))) {
        block(
          `Leader-only path for team members (CLAUDE.md "## Roles"). Ask the Leader in a PR comment or issue instead${me.hint ? `. ${me.hint}` : ''}`,
          path,
        );
      }
      if (!ownsPath(me, path)) {
        const owner = loadTeam().find((t) => t.owns.some((g) => matches(path, g)) && t.role !== 'leader');
        console.log(
          JSON.stringify({
            systemMessage: `Team mode warning: ${path} is outside ${me.name ?? 'your'} owned paths${owner ? ` (owned by ${owner.name})` : ''}. ` +
              'Coordinate with the owner or the Leader before changing it (docs/team/ownership.md).',
          }),
        );
      }
    }
  }
} catch {
  block('could not resolve the path (fail closed)', target);
}
process.exit(0);
