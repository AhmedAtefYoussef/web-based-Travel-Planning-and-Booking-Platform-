// PreToolUse hook for Bash/PowerShell: blocks shell commands that touch env files or credential handouts.
// Defence in depth only: settings.json deny rules, .gitignore and never committing secrets are the real controls.
// Fails closed. A command that mentions a protected path is allowed only if it is ONE git metadata call
// (ls-files, check-ignore, status) with no line breaks, quotes, globs or shell metacharacters. Exit 2 blocks.
import { readFileSync } from 'node:fs';

const block = (reason) => {
  console.error(`Blocked by .claude/hooks/guard-bash.mjs: ${reason}`);
  process.exit(2);
};

let command = '';
try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  command = String(input.tool_input?.command ?? '');
} catch {
  block('unreadable hook input (fail closed).');
}
if (!command) process.exit(0);

try {
  // .env files other than .env.example ("process.env" in scripts is not a file and stays allowed).
  const envFile = /(?<!process)\.env(?!\.example\b)(?![\w])|(?<!process)\.env\.(?!example\b)[\w.-]+/i;
  // Glob forms that could expand to .env (.e*, .en?, .e[n]v).
  const envGlob = /\.e[nv]{0,2}[*?[]/i;
  const handouts = /team[-_]?db[-_]?access|team-db-\*|team\*db/i;
  // Windows 8.3 short names (TEAM-D~1, ENV~1) can alias protected paths.
  const shortName = /[\w-]{1,8}~\d/;
  if (![envFile, envGlob, handouts, shortName].some((re) => re.test(command))) process.exit(0);

  const disallowed = /[\n\r\u0085\u2028\u2029;&|<>`$(){}*?[\]'"\\]/;
  const simpleGitMetadata = /^[ \t]*git[ \t]+(-C[ \t]+\S+[ \t]+)?(ls-files|check-ignore|status)([ \t]+\S+)*[ \t]*$/i;
  if (!disallowed.test(command) && simpleGitMetadata.test(command)) process.exit(0);
} catch {
  block('guard error (fail closed).');
}
block(
  'the command touches an env file or the credential handouts folder. These hold secrets; never read, print or copy them. ' +
    'To audit tracking, run a single git ls-files / check-ignore / status call.',
);
