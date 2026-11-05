// PreCompact hook: the model must write the handoff itself; this only reminds it.
console.log(
  [
    'Before compacting: update .swarm/HANDOFF.md (done, in flight, decisions + where recorded, next 3 actions, open questions)',
    'and .swarm/state.md. Keep the current unit goal, OWNS, failing test names and new decisions in the compact summary.',
  ].join('\n'),
);
