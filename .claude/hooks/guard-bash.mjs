// PreToolUse hook for Bash/PowerShell: blocks shell commands that touch env files or credential handouts.
// Defence in depth only (settings.json deny rules and .gitignore are the main protection); it fails closed.
// A command that mentions a protected path is allowed only if it is ONE git metadata call
// (ls-files, check-ignore, status) with no shell metacharacters. Exit code 2 blocks the call.
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const command = String(input.tool_input?.command ?? '');
if (!command) process.exit(0);

// .env files other than .env.example ("process.env" in scripts is not a file and stays allowed),
// plus glob forms such as .e*, .en?, .e[n]v that could expand to .env.
const envFile = /(?<!process)\.env(?!\.example\b)(?![\w])|(?<!process)\.env\.(?!example\b)[\w.-]+/i;
const envGlob = /\.e[nv]{0,2}[*?[]/i;
const handouts = /team[-_]?db[-_]?access|team-db-\*|team\*db/i;
if (!envFile.test(command) && !envGlob.test(command) && !handouts.test(command)) process.exit(0);

const simpleGitMetadata =
  /^\s*git\s+(-C\s+[^\s;&|<>`$()]+\s+)?(ls-files|check-ignore|status)(\s+[^\s;&|<>`$()\n]+)*\s*$/i;
if (!/[\n;&|<>`$]/.test(command) && simpleGitMetadata.test(command)) process.exit(0);

console.error(
  'Blocked by .claude/hooks/guard-bash.mjs: the command touches an env file or the credential handouts folder. ' +
    'These hold secrets; never read, print or copy them. To audit tracking, run a single git ls-files / check-ignore / status call.',
);
process.exit(2);
