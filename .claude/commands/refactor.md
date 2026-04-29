---
description: Structured refactoring with code smell detection
allowed-tools: Bash, Read, Grep, Glob, Edit
argument-hint: "<file-or-function>"
---

Refactor the code identified by $ARGUMENTS.

Steps:
1. Read the target file(s) fully — do not start refactoring until you understand the whole file
2. Run `git diff main...HEAD -- "$ARGUMENTS" 2>/dev/null` to see what has already changed
3. Identify code smells in this priority order:
   - **Duplication** — repeated logic that should be extracted into a shared function
   - **Long functions** — any function over 40 lines; split by single responsibility
   - **Deep nesting** — more than 3 levels of indentation; flatten with early returns or extraction
   - **Primitive obsession** — strings/numbers used where a typed object or enum belongs
   - **Dead code** — unreachable branches, unused parameters, variables assigned but never read
   - **Misleading names** — variables or functions whose name does not match their behavior
4. For each smell found: explain the problem, show the before/after, then apply the change
5. After all changes: verify no behavior was altered — check that all existing function signatures and return shapes are preserved

Constraints:
- Do NOT change behavior. Refactoring only — no new features, no bug fixes bundled in.
- Do NOT change tests unless renaming a function that tests reference.
- If a refactor would require changes in more than 3 files, stop and list them for the user to approve first.

Output a summary at the end:
- How many smells found and fixed
- Files changed
- Anything you chose NOT to refactor and why
