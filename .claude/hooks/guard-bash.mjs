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
  // Agents must not change the identity team mode derives roles from. Fail closed: anything that is not
  // a single plain read is blocked. (Server-side CODEOWNERS + branch protection remain the real control.)
  const meta = /[\n\r\u0085\u2028\u2029;&|<>`$(){}'"\\#]/;
  if (/CLAUDE_TEAM_MEMBER/i.test(command)) {
    const plainRead = /^[ \t]*(echo[ \t]+\$CLAUDE_TEAM_MEMBER|echo[ \t]+%CLAUDE_TEAM_MEMBER%|\$env:CLAUDE_TEAM_MEMBER|printenv[ \t]+CLAUDE_TEAM_MEMBER)[ \t]*$/i;
    if (!plainRead.test(command)) block('only the person sets CLAUDE_TEAM_MEMBER (docs/team/claude-code-onboarding.md); agents may only read it.');
  }
  if (/\bgit\b/i.test(command) && /\bconfig\b/i.test(command) && /user\./i.test(command)) {
    const plainGitRead = /^[ \t]*git[ \t]+config[ \t]+(--get[ \t]+|--get-all[ \t]+)?user\.(name|email)[ \t]*$/i;
    if (meta.test(command) || !plainGitRead.test(command)) block('changing git user.name/email is not allowed (team-mode identity); only a plain read is.');
  }
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
