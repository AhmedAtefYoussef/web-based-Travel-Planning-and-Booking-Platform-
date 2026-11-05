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
const real = (p) => {
  const abs = resolve(p);
  if (existsSync(abs)) return realpathSync(abs);
  const parent = dirname(abs);
  return existsSync(parent) ? resolve(realpathSync(parent), basename(abs)) : abs;
};
const root = real(process.env.CLAUDE_PROJECT_DIR || process.cwd());
// Windows and macOS file systems are case-insensitive: compare in lower case there.
const fold = process.platform === 'win32' || process.platform === 'darwin' ? (s) => s.toLowerCase() : (s) => s;
const rel = fold(relative(root, real(target)).split('\\').join('/'));
const name = rel.split('/').pop();

const block = (reason) => {
  console.error(`Blocked by .claude/hooks/guard-paths.mjs: ${reason} (${rel})`);
  process.exit(2);
};
if (/^\.env/i.test(name) && name !== '.env.example') block('env files hold secrets; edit them by hand');
if (rel === 'team-db-access' || rel.startsWith('team-db-access/')) block('team-db-access holds credentials');
if (rel === 'backend/package-lock.json') block('change dependencies with npm, not by editing the lockfile');
if (rel === 'docs/requirements/reqs.json' && process.env.ALLOW_REQS_EDIT !== '1') {
  block('reqs.json is the requirements source; set ALLOW_REQS_EDIT=1 to change it deliberately');
}
process.exit(0);
