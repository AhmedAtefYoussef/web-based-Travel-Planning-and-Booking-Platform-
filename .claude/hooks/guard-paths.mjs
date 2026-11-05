// PreToolUse hook for Edit/Write: blocks writes to secrets, the lockfile and the requirements source.
// Exit code 2 blocks the tool call; stderr is shown to Claude as the reason.
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (!target) process.exit(0);
const rel = relative(process.env.CLAUDE_PROJECT_DIR || process.cwd(), resolve(target)).split('\\').join('/');
const name = rel.split('/').pop();

const block = (reason) => {
  console.error(`Blocked by .claude/hooks/guard-paths.mjs: ${reason} (${rel})`);
  process.exit(2);
};
if (/^\.env(\..*)?$/.test(name) && name !== '.env.example') block('env files hold secrets; edit them by hand');
if (rel === 'team-db-access' || rel.startsWith('team-db-access/')) block('team-db-access holds credentials');
if (rel === 'backend/package-lock.json') block('change dependencies with npm, not by editing the lockfile');
if (rel === 'docs/requirements/reqs.json' && process.env.ALLOW_REQS_EDIT !== '1') {
  block('reqs.json is the requirements source; set ALLOW_REQS_EDIT=1 to change it deliberately');
}
process.exit(0);
