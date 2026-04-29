---
description: Generate or update README and API documentation from the codebase
---

Generate or update project documentation (README and API docs).

Steps:
1. Read existing docs: `README.md`, `docs/` directory, `CONTRIBUTING.md`, `CHANGELOG.md`
2. Scan the project: read the package manifest for name/description/scripts, run `git log --oneline -20`, find all exported functions, public classes, route definitions, and CLI entry points
3. Determine what to generate:
   - Missing or thin README (under 50 lines) → generate a full README
   - Existing README → update only stale or missing sections
   - Specific file → generate/update doc blocks for every exported symbol

4. README sections to include (skip those that don't apply):
   - Project name and one-line description
   - **Installation** — exact commands only
   - **Quick start** — minimum to get running (5 commands or fewer)
   - **Configuration** — every env var with type, default, and purpose (from `.env.example`)
   - **API / CLI reference** — one entry per endpoint/command with signature and example
   - **Development** — how to run tests, linter, build
   - **Contributing** — link to CONTRIBUTING.md or a 3-line summary
   - **License** — derived from LICENSE file or manifest

5. Style rules:
   - Code blocks with language tags for all commands
   - Every command must be copy-pasteable and correct
   - Use the actual project name — not "this project"
   - No TODO placeholders — omit sections where information is unknown

Write changes directly to `README.md`. Print a summary of what was added, updated, or left unchanged.
