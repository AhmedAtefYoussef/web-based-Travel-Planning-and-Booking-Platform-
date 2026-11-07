// PreToolUse guard for Bash, PowerShell, Read, Edit and Write. Exit 2 blocks the call and shows the reason to Claude.
// Defence in depth only: .gitignore, settings.json deny rules, CODEOWNERS and branch protection are the real controls.
// Blocks: secrets (.env files, team-db-access/), writes outside the project or into .git and the guard's own config,
// pushes to develop/main, force pushes, skipped hooks, merge-driver changes, and edits to the official requirement sources.
// Fails closed on unreadable input or any internal error.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';

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

// .env files except .env.example; "process.env" in code is not a file.
const ENV_FILE = /(?<![\w.])(?<!process)\.env(?!\.example\b)(\.[\w.-]+)?(?![\w])/i;
const ENV_NAME = /^\.env(?!\.example$)(\.[\w.-]+)?$/i;
const HANDOUTS = /team[-_]?db[-_]?access/i;
const SHORT_NAME = /~\d/; // Windows 8.3 aliases (TEAM-D~1, ENV~1)

try {
  const tool = String(input.tool_name ?? '');
  const ti = input.tool_input ?? {};
  const root = canonical(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());

  if (['Read', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    checkFile(String(ti.file_path ?? ti.notebook_path ?? ''), tool !== 'Read', root);
  } else if (tool === 'Bash' || tool === 'PowerShell') {
    checkCommand(String(ti.command ?? ''));
  }
} catch {
  block('guard error (fail closed).');
}
process.exit(0);

/** Absolute, symlink-resolved path (resolving the nearest existing ancestor), without trailing dots/spaces. */
function canonical(p) {
  let abs = path.resolve(p);
  const rest = [];
  while (!existsSync(abs)) {
    const parent = path.dirname(abs);
    if (parent === abs) break;
    rest.unshift(path.basename(abs));
    abs = parent;
  }
  try {
    abs = realpathSync.native(abs);
  } catch {
    /* keep the resolved path */
  }
  return path.join(abs, ...rest).replace(/[. ]+$/, '');
}

function checkFile(raw, isWrite, root) {
  if (!raw) return;
  const p = canonical(raw);
  const parts = p.split(/[\\/]+/).map((c) => c.replace(/[. ]+$/, ''));
  // Skip the drive ("C:"); any other ":" is an NTFS alternate data stream.
  for (const c of parts.slice(1)) {
    if (c.includes(':')) block('alternate data stream paths are not allowed.');
    if (SHORT_NAME.test(c)) block('Windows short (8.3) path names are not allowed; use the full name.');
    if (ENV_NAME.test(c) || HANDOUTS.test(c)) {
      block('env files and team-db-access/ hold secrets; never read or write them. Ask the user to change .env themselves.');
    }
  }
  if (!isWrite) return;

  const rel = path.relative(root, p);
  const inside = rel && !rel.startsWith('..') && !path.isAbsolute(rel);
  // Outside the project only the OS temp dir and Claude's per-project memory/transcripts are writable;
  // never ~/.claude/settings*.json or ~/.claude/hooks/, so the guard cannot be switched off from outside.
  const allowedOutside = [tmpdir(), path.join(homedir(), '.claude', 'projects')].map(canonical);
  if (!inside && rel !== '') {
    if (!allowedOutside.some((d) => p === d || p.startsWith(d + path.sep))) {
      block('writes outside the project are not allowed (except the OS temp dir and ~/.claude/projects).');
    }
    return;
  }
  const r = rel.split(path.sep).join('/');
  if (r.split('/').some((c) => c.toLowerCase() === '.git')) block('do not write into .git internals.');
  if (/^\.claude\/(settings[^/]*\.json|hooks\/)/i.test(r)) {
    block('the guard and project settings are changed by a person, not by the agent. Ask the user.');
  }
  if (/^docs\/requirements\/(reqs\.json|project-description\.md|[^/]+\.xlsx)$/i.test(r)) {
    block('reqs.json, the workbooks and project-description.md are official copies; do not edit them.');
  }
}

function checkDirectoryChanges(forms) {
  const root = canonical(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  const allowed = [root, path.join(root, 'backend'), path.join(root, 'frontend')];
  const CD_CMD = /(^|[\s;&|(])(cd|pushd|Push-Location|Set-Location|sl|chdir)(?=\s|$|[;&|)])([ \t]+(-\w+[ \t]+)*("[^"]*"|'[^']*'|[^\s;&|)]+))?/gi;
  for (const f of forms) {
    for (const m of f.matchAll(CD_CMD)) {
      const target = (m[5] ?? '').replace(/^["']|["']$/g, '');
      if (!target) block('a bare cd changes to the home folder; cd only to the project root, backend/ or frontend/.');
      if (/[$*?[\]`~%{}]/.test(target)) block('cd targets may not contain variables, globs, ~ or substitutions.');
      const dest = canonical(path.resolve(root, target.replace(/\\+/g, '/')));
      const ok = dest === root || allowed.slice(1).some((a) => dest === a || dest.startsWith(a + path.sep));
      if (!ok) block('cd only to the project root, backend/ or frontend/ (and folders inside those two).');
    }
  }
}

function checkCommand(cmd) {
  if (!cmd) return;
  // Quoting and escape tricks ('.e'nv, .e""nv, t^eam) are removed before matching.
  const unquoted = cmd.replace(/['"`\\^]/g, '');
  const mentionsSecret = [cmd, unquoted].some(
    (c) =>
      ENV_FILE.test(c) ||
      HANDOUTS.test(c) ||
      /\.e[nv]{0,2}[*?[]/i.test(c) || // globs that expand to .env
      /team[-_]?\*|team[-_]?db[-_]?\*/i.test(c) ||
      /[\w-]{1,8}~\d/.test(c), // 8.3 short names
  );
  if (mentionsSecret) {
    const disallowed = /[\n\r\u0085\u2028\u2029;&|<>`$(){}*?[\]'"\\^]/;
    const gitMeta = /^[ \t]*git[ \t]+(ls-files|check-ignore|status)([ \t]+[\w./-]+)*[ \t]*$/i;
    if (disallowed.test(cmd) || !gitMeta.test(cmd)) {
      block('the command touches an env file or team-db-access/. Use a single git ls-files/check-ignore/status call to audit tracking.');
    }
  }

  // Protected files must not be changed through the shell either (sibling of the Edit/Write checks).
  // Backslashes become "/" (not deleted) so Windows paths and escapes match the same pattern.
  const slashed = cmd.replace(/['"`^]/g, '').replace(/\\+/g, '/');
  const PROTECTED = /\.claude\/+(settings[^\s/]*\.json|hooks)|\.claude\/+\*|docs\/+requirements\/+(reqs\.json|project-description\.md|[^\s/]+\.xlsx|\*)|(^|[\s/=])\.git(\/|\*|\s|$)/i;
  const WRITES = /(^|[^<>&|0-9])>{1,2}(?!&)|\b(tee|rm|del|erase|mv|move|cp|copy|ren|rename|sed\s+-[a-z]*i|perl\s+-[a-z]*i|truncate|chmod|attrib|ln|install|rsync|Set-Content|Add-Content|Out-File|Remove-Item|Move-Item|Copy-Item|New-Item|Rename-Item|python3?|node|npx|ruby|powershell|pwsh|checkout|restore|apply|reset|stash|clean|worktree)\b/i;
  // Check every normalised form: the raw command, backslashes removed (how bash reads `.cl\aude`) and
  // backslashes as "/" (Windows paths). A match in any form counts.
  const forms = [cmd, unquoted, slashed];
  const any = (re) => forms.some((f) => re.test(f));
  // Protected file names alone also count, so relative paths from inside a folder are caught.
  const PROTECTED_NAMES = /(^|[^\w.-])(guard\.mjs|session-start\.mjs|settings(\.local)?\.json|reqs\.json|project-description\.md)(?![\w.-])|\.xlsx(?![\w.-])/i;
  const syntaxCheckOnly = /^[ \t]*node[ \t]+--check[ \t]+[\w./\\-]+[ \t]*$/i.test(cmd);
  if ((any(PROTECTED) || any(PROTECTED_NAMES)) && any(WRITES) && !syntaxCheckOnly) {
    block('the command may change the guard, project settings, .git internals or the official requirement files; a person changes those.');
  }
  // Working from inside the protected folders would hide relative paths; changing directory and writing
  // in the same command is refused outright.
  const CD = /(^|[\s;&|(])(cd|pushd|Push-Location|Set-Location|sl|chdir)(\s|$)/i;
  // The shell's working directory persists between calls. Fail closed: every directory change must land
  // on the project root, backend/ or frontend/ (or a folder inside those two), written without variables,
  // globs, ~ or substitutions. Anything else (a bare cd included) is blocked.
  checkDirectoryChanges(forms);
  // A directory change plus any write is refused unless the WHOLE command is one of these exact forms
  // (one plain cd into backend/ or frontend/, then one npm/npx jest call, nothing after it).
  const CD_ALLOWED = /^[ \t]*cd[ \t]+(backend|frontend)\/?[ \t]*&&[ \t]*(npm[ \t]+(ci|test|run[ \t]+[\w:-]+|audit)|npx[ \t]+jest)([ \t]+[\w./:=@-]+|[ \t]+"[\w ./:=@\\()|-]+")*[ \t]*$/i;
  if (any(CD) && any(WRITES) && !CD_ALLOWED.test(cmd)) {
    block('changing directory and writing in one command is not allowed; run from the project root or use `cd backend && npm ...`.');
  }
  // Git config injected through the environment (GIT_CONFIG_*, GIT_CONFIG_PARAMETERS) can set hooksPath.
  if (any(/\bGIT_CONFIG(_[A-Z_]+|_PARAMETERS)?\b|\bGIT_DIR\b|\bGIT_WORK_TREE\b/i)) {
    block('do not set git configuration or repository location through environment variables.');
  }

  // Tokens of the unquoted form, so quoting cannot hide a flag or ref ("develop", 'm'ain, --"force").
  const tokens = unquoted.split(/[\s;&|()]+/).filter(Boolean);
  const GIT_GLOBAL_WITH_VALUE = /^(-C|-c|--git-dir|--work-tree|--namespace|--exec-path|--super-prefix|--config-env|--attr-source|--list-cmds)$/;
  const KNOWN_GIT_FLAGS = /^(--version|--help|-v|-h|-p|--paginate|-P|--no-pager|--bare|--no-replace-objects|--no-lazy-fetch|--no-optional-locks|--no-advice|--literal-pathspecs|--glob-pathspecs|--noglob-pathspecs|--icase-pathspecs|--git-dir|--work-tree|--namespace|--exec-path|--attr-source|--config-env|--super-prefix|--list-cmds)$/;
  const gitAt = tokens.flatMap((t, i) => (/^git(\.exe)?$/i.test(path.basename(t.replace(/\\/g, '/'))) ? [i] : []));
  for (const i of gitAt) {
    // Skip git's global options (and their values) to find the subcommand. Config overrides of hooks,
    // merge drivers or includes are blocked; an unknown option before the subcommand fails closed.
    let j = i + 1;
    while (j < tokens.length && tokens[j].startsWith('-')) {
      const opt = tokens[j];
      const takesValue = GIT_GLOBAL_WITH_VALUE.test(opt);
      const value = takesValue ? tokens[j + 1] : opt.includes('=') ? opt.split('=').slice(1).join('=') : '';
      if ((opt === '-c' || /^--config-env/.test(opt)) && /^(core\.hookspath|core\.fsmonitor|merge\.|include)/i.test(value ?? '')) {
        block('do not override git hook paths, merge drivers or config includes.');
      }
      if (!takesValue && !KNOWN_GIT_FLAGS.test(opt.split('=')[0])) {
        block(`unrecognised git option "${opt}" before the subcommand (fail closed).`);
      }
      j += takesValue ? 2 : 1;
    }
    // Run the push/commit checks whatever position the subcommand ends up in.
    const rest = tokens.slice(i + 1);
    const known = ['push', 'commit', 'merge', 'rebase', 'am', 'config'];
    const sub = known.includes(tokens[j]) ? tokens[j] : (['push', 'commit'].find((s) => rest.includes(s)) ?? tokens[j]);
    const args = rest;
    if (sub === 'push') {
      for (const a of args) {
        if (/^--force/i.test(a) || /^-[a-z]*f[a-z]*$/i.test(a) || /^\+/.test(a)) block('force pushes are not allowed.');
        if (/^((refs\/heads\/)?|[^:]*:(refs\/heads\/)?)(develop|main)$/i.test(a)) {
          block('never push to develop or main; push your feature/fix branch and open a PR.');
        }
      }
    }
    if (sub === 'commit' || sub === 'merge' || sub === 'push' || sub === 'rebase' || sub === 'am') {
      for (const a of args) {
        // For commit, -n (alone or in a cluster like -nm) is --no-verify; for merge it is --no-stat.
        if (/^--no-verify$/i.test(a) || (sub === 'commit' && /^-[a-z]*n[a-z]*$/i.test(a))) {
          block('skipping hooks (--no-verify / -n) is not allowed; fix the failing check instead.');
        }
      }
    }
    if (sub === 'config' && args.some((a) => /^merge\./i.test(a) || /^core\.hookspath$/i.test(a))) {
      block('do not change git merge drivers or hook paths.');
    }
  }
  if (/\s--no-verify\b/i.test(cmd)) block('--no-verify skips the checks; fix the failing check instead.');
  if (/\.git[\\/]+(info[\\/]+attributes|hooks|config)\b|merge=union/i.test(cmd)) {
    block('do not change git attributes, hooks or config (merge=union corrupts AI_PROMPTS.txt).');
  }
}
