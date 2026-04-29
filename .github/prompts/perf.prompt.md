---
description: Analyze performance bottlenecks in changed or specified code
---

Analyze performance bottlenecks in changed files (or a specified file/function).

Steps:
1. Get target files from `git diff main...HEAD --name-only`, or use the specified path. Skip tests, config, and docs.
2. For each file, identify these patterns:

   **Algorithmic:**
   - Nested loops — O(n²) or worse
   - Repeated identical function calls inside a loop without caching the result
   - Linear search where a map/set lookup would be O(1)

   **I/O and network:**
   - Database queries inside a loop (N+1 pattern)
   - Missing pagination on queries that could return unbounded rows
   - Synchronous calls blocking the event loop where async is available
   - Missing connection pooling or repeated connection setup

   **Memory:**
   - Loading entire large files into memory when streaming is possible
   - Unbounded list accumulation in loops
   - Caches without expiry that grow without limit

   **Rendering (frontend only):**
   - State mutations triggering full re-renders of large component trees
   - Missing memoization on expensive computed values
   - Heavy imports not lazily loaded

3. For each finding:
   ```
   [SEVERITY] file:line — pattern — explanation — suggested fix
   ```
   Severity: HIGH (user-perceptible), MEDIUM (perceptible at scale), LOW (micro-optimization)

4. Only flag patterns where the impact is plausible — skip trivial bounded datasets.

End with the top 3 changes most likely to improve real-world performance.
