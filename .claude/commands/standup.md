---
description: Generate a daily standup summary from recent git activity
allowed-tools: Bash
argument-hint: "[hours-back]"
---

Generate a standup summary for the last $ARGUMENTS hours (default: 24).

Run these commands:
- `git log --since="${ARGUMENTS:-24} hours ago" --oneline` — work done
- `git status --short` — in-progress changes
- `gh pr list --author @me --state open 2>/dev/null` — open PRs (if gh CLI available)

Write a concise standup:

**Yesterday / Recent work:**
- [one bullet per logical unit of work, derived from commits]

**Today / In progress:**
- [based on uncommitted changes or open PR status]

**Blockers:**
- [failing tests, unclear requirements, waiting on review — or "None"]

Keep it short. No padding, no filler sentences. Bullets only.
