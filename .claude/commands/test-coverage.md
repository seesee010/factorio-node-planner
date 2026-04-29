---
description: Find changed source files with missing or thin test coverage
allowed-tools: Bash, Read, Glob, Grep
argument-hint: "[file-or-directory]"
---

Analyze test coverage for $ARGUMENTS (default: all files changed vs main).

Steps:
1. Run `git diff main...HEAD --name-only` to get changed files (skip if $ARGUMENTS is set)
2. For each source file, check if a test file exists (look for `*.test.*`, `*.spec.*`, `__tests__/` equivalents)
3. If `npm test -- --coverage` is available, run it and parse the output for uncovered lines
4. Read each changed source file and identify functions/branches with no apparent test

Output:
- List of changed files **with no test file at all** — highest priority
- List of functions/branches likely not tested — based on reading the source
- For each gap: suggest 2-3 specific test cases (happy path, error case, edge case)

Format:
```
[MISSING] src/utils/auth.ts — no test file found
  → suggest: test valid token, test expired token, test malformed token

[THIN]    src/api/users.ts:45 createUser() — no error path test
  → suggest: test DB connection failure, test duplicate email
```
