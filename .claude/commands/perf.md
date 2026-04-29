---
description: Analyze performance bottlenecks in changed or specified code
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[file-or-function]"
---

Analyze performance bottlenecks in $ARGUMENTS (default: all files changed vs main).

Steps:
1. Get the target files:
   - If $ARGUMENTS is set: read those files directly
   - Otherwise: run `git diff main...HEAD --name-only` and filter to source files only (skip tests, config, docs)
2. For each file, read it fully and look for these patterns — flag every instance:

   **Algorithmic:**
   - Nested loops over collections — O(n²) or worse; note the collection sizes if inferable
   - Repeated identical function calls inside a loop (result not cached)
   - Linear search through a list where a map/set lookup would be O(1)

   **I/O and network:**
   - Database queries inside a loop (N+1 pattern)
   - Missing pagination on queries that could return unbounded rows
   - Synchronous calls that block the event loop where async is available
   - Missing connection pooling or repeated connection setup

   **Memory:**
   - Loading entire large files into memory when streaming would work
   - Accumulating results in a list inside a loop without a size bound
   - Missing cache expiry — caches that grow without limit

   **Rendering (frontend only):**
   - State mutations that trigger full re-renders of large component trees
   - Missing memoization on expensive computed values
   - Heavy imports not lazily loaded

3. For each finding:
   ```
   [SEVERITY] file:line — pattern name — explanation — suggested fix
   ```
   Severity: HIGH (likely user-perceptible), MEDIUM (perceptible at scale), LOW (micro-optimization)

4. Do NOT flag patterns on code that handles small, bounded datasets. Only flag where the impact is plausible given the context.

End with a prioritized list of the top 3 changes most likely to improve real-world performance.
