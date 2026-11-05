import sys, re, subprocess, fnmatch, pathlib
# Usage: python .swarm/bin/check.py <id> <worktree> <base> <swarm_dir> [result_word_cap]
tid, wt, base, swarm = sys.argv[1:5]
cap = int(sys.argv[5]) if len(sys.argv) > 5 else 150
card = pathlib.Path(f'{swarm}/tasks/{tid}.md').read_text(encoding='utf-8')
out = pathlib.Path(f'{swarm}/out/{tid}.md'); errs = []
m = re.search(r'^OWNS:(.*)$', card, re.M)
owns = [o.strip() for o in (m.group(1).split(',') if m else []) if o.strip()]
owned = lambda p: any(fnmatch.fnmatch(p, o) for o in owns)

if not out.exists(): errs.append('no result file')
else:
  r = out.read_text(encoding='utf-8')
  errs += ['missing ' + f for f in ['STATUS:', 'CTX:', 'GOAL CHECK:', 'CHANGED:', 'EVIDENCE:'] if f not in r]
  if len(r.split()) > cap: errs.append('result too long')
  # The result must have been produced against the current context.md version.
  ctx_file = pathlib.Path(f'{swarm}/context.md')
  cur = ctx_file.read_text(encoding='utf-8').splitlines()[0].strip() if ctx_file.exists() else ''
  got = re.search(r'CTX:\s*(v\d+)', r)
  if cur and got and got.group(1) != cur: errs.append(f'stale CTX {got.group(1)} (context.md is {cur})')

g = lambda *a: subprocess.run(['git', '-C', wt, *a], capture_output=True, text=True).stdout
if g('status', '--porcelain').strip(): errs.append('uncommitted changes')
bad = [c for c in g('diff', '--name-only', f'{base}...HEAD').split() if not owned(c)]
if bad: errs.append('out of scope: ' + ' '.join(bad))
# Ignored files inside OWNS were never committed (the uploads/ bug class).
ignored = [l[3:] for l in g('status', '--porcelain', '--ignored', '--untracked-files=all').splitlines() if l.startswith('!! ')]
hidden = [p for p in ignored if owned(p) and not re.search(r'(^|/)(node_modules|dist|coverage)/', p)]
if hidden: errs.append('ignored but owned (not committed): ' + ' '.join(hidden[:10]))
print('OK' if not errs else 'FAIL\n' + '\n'.join(errs))
