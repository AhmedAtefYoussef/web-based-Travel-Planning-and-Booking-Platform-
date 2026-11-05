// PreToolUse hook for Edit/Write: blocks writes to secrets, the lockfile and the requirements source.
// Exit code 2 blocks the tool call; stderr is shown to Claude as the reason.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (!target) process.exit(0);

// Resolve symlinks (on the file, or its parent when the file does not exist yet) so a link
// cannot point a harmless-looking path at a protected one.
// realpathSync.native also expands Windows 8.3 short names (TEAM-D~1).
const real = (p) => {
  const abs = resolve(p);
  if (existsSync(abs)) return realpathSync.native(abs);
  const parent = dirname(abs);
  return existsSync(parent) ? resolve(realpathSync.native(parent), basename(abs)) : abs;
};
const block = (reason, shown) => {
  console.error(`Blocked by .claude/hooks/guard-paths.mjs: ${reason} (${shown})`);
  process.exit(2);
};
const root = real(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const raw = relative(root, real(target)).split('\\').join('/');
// Alternate data streams (file.txt:stream) and other colon tricks are never legitimate here.
if (raw.split('/').some((c) => c.includes(':'))) block('colon in a path component', raw);
// Windows ignores trailing dots/spaces and case; macOS ignores case. Normalise every component.
const fold = process.platform === 'win32' || process.platform === 'darwin' ? (s) => s.toLowerCase() : (s) => s;
const parts = raw.split('/').map((c) => fold(c.replace(/[. ]+$/, '')));
const rel = parts.join('/');
const name = parts[parts.length - 1];

if (/^\.env/i.test(name) && name !== '.env.example') block('env files hold secrets; edit them by hand', rel);
if (parts.some((c) => /^team-db-access$/i.test(c) || /^team-d~\d+$/i.test(c))) block('team-db-access holds credentials', rel);
if (rel === 'backend/package-lock.json') block('change dependencies with npm, not by editing the lockfile', rel);
if (rel === 'docs/requirements/reqs.json' && process.env.ALLOW_REQS_EDIT !== '1') {
  block('reqs.json is the requirements source; set ALLOW_REQS_EDIT=1 to change it deliberately', rel);
}
process.exit(0);
