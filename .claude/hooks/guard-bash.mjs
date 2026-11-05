// PreToolUse hook for Bash/PowerShell: blocks shell commands that touch env files or credential handouts.
// git metadata commands (ls-files, check-ignore, status) stay allowed so tracking can be audited
// without reading contents. Exit code 2 blocks the call; stderr is the reason shown to Claude.
import { readFileSync } from 'node:fs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const command = String(input.tool_input?.command ?? '');
if (!command) process.exit(0);

// Mentions of a .env file other than .env.example (any case, any directory).
const envFile = /(^|[\s"'`=/\\:])\.env(?!\.example\b)(\.[\w.-]*)?(?=$|[\s"'`;|&)<>])/i;
const handouts = /team-db-access/i;
if (!envFile.test(command) && !handouts.test(command)) process.exit(0);

// Every part of the command that mentions a protected path must be a read-only git metadata subcommand.
const segments = command.split(/&&|\|\||;|\|/).map((s) => s.trim()).filter(Boolean);
const safe = segments
  .filter((s) => envFile.test(s) || handouts.test(s))
  .every((s) => /^git\s+(-C\s+\S+\s+)?(ls-files|check-ignore|status)\b/i.test(s));
if (safe) process.exit(0);

console.error(
  'Blocked by .claude/hooks/guard-bash.mjs: the command touches a .env file or team-db-access/. ' +
    'These hold secrets; never read, print or copy them. Use git ls-files / check-ignore to audit tracking.',
);
process.exit(2);
