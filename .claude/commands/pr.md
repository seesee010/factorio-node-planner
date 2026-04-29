---
description: Create a pull request with auto-generated description from git diff
allowed-tools: Bash
argument-hint: "[base-branch]"
---

Create a pull request for the current branch against ${ARGUMENTS:-main}.

Steps:
1. Run `git diff ${ARGUMENTS:-main}...HEAD --stat` to see what changed
2. Run `git log ${ARGUMENTS:-main}...HEAD --pretty=format:"%s"` to get commit messages
3. Run `git status --short` to check for uncommitted changes — warn the user if any exist
4. Detect the PR tool: try `gh pr create --help > /dev/null 2>&1` to check if gh CLI is available

If gh CLI is available:
- Compose a PR title: one sentence, imperative mood, under 72 characters, derived from the commit messages
- Compose a PR body with these sections:
  - **Summary** — what changed and why (2-5 bullets)
  - **Changes** — file-level breakdown derived from the diff stat
  - **Test plan** — list of things to verify manually or automated tests that cover this
  - **Breaking changes** — any changes to public API, env vars, or config (or "None")
- Run: `gh pr create --title "<title>" --body "<body>" --base ${ARGUMENTS:-main}`
- Output the PR URL

If gh CLI is not available:
- Output the full PR title and body in a ready-to-paste format
- Remind the user to run `gh auth login` or use the web UI

Do not include file diffs in the PR body — only human-readable summaries.
