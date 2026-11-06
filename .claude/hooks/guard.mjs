// PreToolUse guard for Bash, PowerShell, Read, Edit and Write. Exit 2 blocks the call and shows the reason to Claude.
// Defence in depth only: .gitignore, settings.json deny rules, CODEOWNERS and branch protection are the real controls.
// Blocks: secrets (.env files, team-db-access/), pushes to develop/main, force pushes, --no-verify, and edits to the
// official requirement sources. Fails closed on unreadable input.
import { readFileSync } from 'node:fs';

const block = (reason) => {
  console.error(`Blocked by .claude/hooks/guard.mjs: ${reason}`);
  process.exit(2);
};

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  block('unreadable hook input (fail closed).');
}
const tool = String(input.tool_name ?? '');
const ti = input.tool_input ?? {};

// .env files except .env.example; "process.env" in code is not a file.
const ENV_FILE = /(?<![\w.])(?<!process)\.env(?!\.example\b)(\.[\w.-]+)?(?![\w])/i;
const HANDOUTS = /team[-_]?db[-_]?access/i;
const READ_ONLY_SOURCES = /docs[\\/]requirements[\\/](reqs\.json|project-description\.md|[^\\/]+\.xlsx)$/i;

if (tool === 'Read' || tool === 'Edit' || tool === 'Write' || tool === 'MultiEdit' || tool === 'NotebookEdit') {
  const p = String(ti.file_path ?? ti.notebook_path ?? '');
  if (ENV_FILE.test(p.split(/[\\/]/).pop() ?? '') || HANDOUTS.test(p)) {
    block('env files and team-db-access/ hold secrets; never read or write them. Ask the user to change .env themselves.');
  }
  if (tool !== 'Read' && READ_ONLY_SOURCES.test(p)) {
    block('reqs.json, the workbook and project-description.md are official copies; do not edit them.');
  }
  process.exit(0);
}

if (tool === 'Bash' || tool === 'PowerShell') {
  const cmd = String(ti.command ?? '');
  if (ENV_FILE.test(cmd) || HANDOUTS.test(cmd) || /\.e[nv]{0,2}[*?[]/i.test(cmd)) {
    // One plain git metadata call only: no line breaks or shell metacharacters, literal spaces/tabs.
    const disallowed = /[\n\r\u0085\u2028\u2029;&|<>`$(){}*?[\]'"\\]/;
    const gitMeta = /^[ \t]*git[ \t]+(ls-files|check-ignore|status)([ \t]+[\w./-]+)*[ \t]*$/i;
    if (disallowed.test(cmd) || !gitMeta.test(cmd)) block('the command touches an env file or team-db-access/. Use a single git ls-files/check-ignore/status call to audit tracking.');
  }
  if (/\bgit\b[^\n]*\bpush\b/i.test(cmd)) {
    if (/\s(--force|-f|--force-with-lease)\b|\s\+\S/i.test(cmd)) block('force pushes are not allowed.');
    if (/\bpush\b[^\n]*\b(origin\s+)?(HEAD:)?(refs\/heads\/)?(develop|main)\b(?![\w/-])/i.test(cmd)) {
      block('never push to develop or main; push your feature/fix branch and open a PR.');
    }
  }
  if (/\s--no-verify\b/i.test(cmd)) block('--no-verify skips the checks; fix the failing check instead.');
  if (/\bgit\b[^\n]*\bconfig\b[^\n]*\bmerge\.\w+|\.git[\\/]info[\\/]attributes|merge=union/i.test(cmd)) {
    block('do not change git merge configuration (merge=union corrupts AI_PROMPTS.txt).');
  }
}
process.exit(0);
