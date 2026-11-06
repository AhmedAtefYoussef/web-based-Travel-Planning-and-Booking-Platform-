#!/usr/bin/env node
// Prints one or more requirements verbatim with their Jira key, owner, sprint and traceability row.
// Usage (from the repo root): node .claude/skills/req/req.mjs FLT-22 [HTL-18 ...]
//        node .claude/skills/req/req.mjs --owner ahmed      (all items of one owner)
// Reads docs/requirements/reqs.json, docs/requirements/jira-map.json, docs/requirements/traceability.md.
import { existsSync, readFileSync } from 'node:fs';

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const reqs = JSON.parse(read('docs/requirements/reqs.json') ?? '[]');
const jira = JSON.parse(read('docs/requirements/jira-map.json') ?? '{"items":[]}');
const trace = read('docs/requirements/traceability.md') ?? '';

const args = process.argv.slice(2);
if (!args.length) {
  console.log('Usage: node .claude/skills/req/req.mjs <ID> [ID...] | --owner <slug>');
  process.exit(1);
}

let ids = args.map((a) => a.toUpperCase());
if (args[0] === '--owner') {
  const owner = (args[1] ?? '').toLowerCase();
  const mine = jira.items.filter((i) => i.owner === owner);
  for (const i of mine) console.log(`${i.id.padEnd(9)} ${i.jira.padEnd(9)} ${String(i.sprint).padEnd(4)} ${i.status.padEnd(12)} ${i.title}`);
  process.exit(0);
}

for (const id of ids) {
  const r = reqs.find((x) => x.id.toUpperCase() === id);
  const j = jira.items.find((x) => x.id.toUpperCase() === id || x.jira === id);
  if (!r && !j) {
    console.log(`${id}: not found in reqs.json or jira-map.json\n`);
    continue;
  }
  const key = r?.id ?? id;
  const row = trace.split(/\r?\n/).find((l) => l.startsWith(`| ${key} |`) || l.startsWith(`| ${key} (`));
  console.log(`=== ${r?.id ?? j.id}${j ? ` (${j.jira})` : ''} ===`);
  if (r) {
    console.log(`Sheet: ${r.sheet} · Module: ${r.module} · Actors: ${r.actors} · Complexity: ${r.complexity}`);
    console.log(`Depends on: ${r.dependencies ?? 'none'}`);
    console.log(`Requirement (verbatim):\n  ${r.requirement}`);
  }
  if (j) console.log(`Jira: ${j.jira} · owner ${j.owner ?? 'unassigned'} · sprint ${j.sprint ?? 'none'} · ${j.milestone} · status at snapshot ${jira.snapshot}: ${j.status}`);
  const endpoints = endpointsFor(r?.id ?? id);
  if (endpoints.length) console.log(`Brief endpoints (§8):\n  ${endpoints.join('\n  ')}`);
  const spec = `docs/specs/${r?.id ?? id}.md`;
  console.log(`Spec: ${existsSync(spec) ? spec : `${spec} (not written yet)`}`);
  console.log(`Traceability: ${row ? row.split('|').slice(-4, -1).map((s) => s.trim()).join(' · ') : 'no row yet'}`);
  console.log('');
}

/** Endpoint rows of project-description.md §8 that list this ID. */
function endpointsFor(id) {
  const brief = read('docs/requirements/project-description.md') ?? '';
  const re = /^(GET|POST|PATCH|PUT|DELETE)(\/api\/\S+?)([A-Z]{2,3}-\d+.*)$/;
  return brief
    .split(/\r?\n/)
    .map((l) => l.match(re))
    .filter((m) => m && new RegExp(`\\b${id}\\b`).test(m[3]))
    .map((m) => `${m[1]} ${m[2]}  (${m[3].trim()})`);
}
