# TutorialPath

A tutorial track: progress bar, then chapters with chamfered number markers.

- Props: `project` (themes it), `steps` (`[{ title, summary?, minutes?, level?, state: 'done' | 'current' | 'todo' }]`), `progress` (default on).
- Exactly one `current` step; it gets the "Continue" button.
