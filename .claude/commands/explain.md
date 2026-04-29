---
description: Explain complex code and generate inline documentation
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "<file-or-function>"
---

Explain the code identified by $ARGUMENTS (a file path, function name, or code snippet description).

Steps:
1. Locate the target using Glob and Grep if $ARGUMENTS is a name rather than a path
2. Read the full file and all files it imports from or is imported by
3. Trace the data flow: what goes in, what transformations happen, what comes out
4. Identify non-obvious decisions: why this algorithm, why this structure, what failure modes exist

Output in three sections:

**What it does (2-3 sentences):**
Plain English summary — no jargon, no implementation detail.

**How it works (step-by-step):**
Walk through the logic in the order it executes. For each significant step: what it does, why it does it, and what would break if it were removed.

**Inline doc block (ready to paste):**
Generate a JSDoc / docstring / language-appropriate comment block for the entry point:
- One-line summary
- @param / @returns / @throws with types
- A short example if the interface is non-obvious

Do not summarize what is already obvious from the code. Focus on the parts that require context or domain knowledge to understand.
