---
description: Create a pull request with auto-generated description from git diff
---

Create a pull request for the current branch against the base branch (default: main).

Steps:
1. Run `git diff main...HEAD --stat` to see what changed
2. Run `git log main...HEAD --pretty=format:"%s"` to get commit messages
3. Run `git status --short` — warn if uncommitted changes exist
4. Check if `gh` CLI is available

If gh CLI is available:
- Compose a PR title: imperative mood, under 72 characters, derived from commit messages
- Compose a PR body:
  - **Summary** — what changed and why (2-5 bullets)
  - **Changes** — file-level breakdown from diff stat
  - **Test plan** — what to verify manually or via automated tests
  - **Breaking changes** — API/env/config changes or "None"
- Run `gh pr create` with the composed title and body
- Output the PR URL

If gh CLI is not available:
- Output the full title and body ready to paste into the web UI
- Remind the user to run `gh auth login`

Do not include file diffs in the PR body — human-readable summaries only.
