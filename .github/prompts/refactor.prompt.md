---
description: Structured refactoring with code smell detection
---

Refactor the specified code.

Steps:
1. Read the target file(s) fully before starting
2. Check git diff vs main to understand recent changes
3. Identify code smells in this priority order:
   - **Duplication** — repeated logic that should be extracted into a shared function
   - **Long functions** — any function over 40 lines; split by single responsibility
   - **Deep nesting** — more than 3 levels of indentation; flatten with early returns or extraction
   - **Primitive obsession** — strings/numbers used where a typed object or enum belongs
   - **Dead code** — unreachable branches, unused parameters, variables assigned but never read
   - **Misleading names** — variables or functions whose name does not match their behavior
4. For each smell: explain the problem, show before/after, apply the change
5. Verify no behavior was altered — all existing signatures and return shapes preserved

Constraints:
- Do NOT change behavior. Refactoring only — no new features, no bug fixes bundled in.
- Do NOT change tests unless renaming a function that tests reference.
- If a refactor requires changes in more than 3 files, stop and list them for user approval first.

Output a summary: smells found/fixed, files changed, anything skipped and why.
