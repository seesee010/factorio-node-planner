---
description: Generate or update README and API documentation from the codebase
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
argument-hint: "[file-or-directory]"
---

Generate or update documentation for $ARGUMENTS (default: the entire project).

Steps:
1. Read what already exists:
   - `README.md` (or `README.rst`, `README.txt`)
   - Any files in `docs/`
   - `CONTRIBUTING.md`, `CHANGELOG.md` if present

2. Scan the project to understand its shape:
   - Read `package.json` / `pyproject.toml` / `Cargo.toml` etc. for name, description, scripts, dependencies
   - Run `git log --oneline -20` to understand recent activity
   - Find all public API surface: exported functions, public classes, route definitions, CLI entry points

3. Determine what to generate:
   - If README.md is **missing or under 50 lines**: generate a full README
   - If README.md exists: update only the sections that are stale or missing
   - If $ARGUMENTS points to a specific file: generate/update the doc block for every exported symbol in that file

4. README sections to include (skip those that don't apply):
   - **Project name and one-line description**
   - **Installation** — exact commands, not prose
   - **Quick start** — minimum to get something running (5 commands or fewer)
   - **Configuration** — every env var with type, default, and purpose; derived from `.env.example` if present
   - **API / CLI reference** — one entry per public endpoint or command, with signature and example
   - **Development** — how to run tests, linter, build
   - **Contributing** — if CONTRIBUTING.md exists, link it; otherwise add a 3-line summary
   - **License** — derived from LICENSE file or package manifest

5. Style rules:
   - Use code blocks with language tags for all commands
   - Every command in Installation/Quick start must be copy-pasteable and correct
   - Use the actual project name — not "this project"
   - No TODO placeholders — if information is genuinely unknown, omit the section

Write output directly to README.md (or the target file). Print a summary of what was added, updated, or left unchanged.
