---
description: Code review of current branch vs main (or a specified base branch)
---

Review all changes between the base branch (default: `main`) and HEAD.

Run `git diff main...HEAD` to get the diff. Then for each changed file:

1. **Security** — look for SQL injection, XSS, hardcoded secrets, unvalidated user input, insecure dependencies
2. **Logic** — identify unhandled edge cases, off-by-one errors, incorrect conditionals
3. **Error handling** — missing try/catch at system boundaries (HTTP, DB, file I/O)
4. **Tests** — run `git diff main...HEAD --name-only` and flag any source file that has no corresponding test file
5. **Style** — consistency with surrounding code

Output findings grouped by severity:
- **CRITICAL** — must fix before merge (security issues, data loss risk)
- **WARNING** — should fix (logic errors, missing error handling)
- **SUGGESTION** — optional improvements

Each finding: `file:line — description — how to fix`
