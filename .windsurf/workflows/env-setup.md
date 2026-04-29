---
description: Validate development environment completeness
---

Validate the development environment completeness for this project.

Steps:
1. Detect the project type by reading manifest files — do not assume a stack:
   - `package.json` → Node; read `engines` for required version
   - `pyproject.toml` / `setup.py` → Python; read `python_requires`
   - `Gemfile` → Ruby; read `.ruby-version`
   - `go.mod` → Go; read `go` directive
   - `Cargo.toml` → Rust
   - `docker-compose.yml` / `Dockerfile` → containerized
   - `.nvmrc`, `.node-version`, `.python-version` → version pin files
2. For each detected runtime, check the installed version against what the manifest requires. Flag MISMATCH for major version differences, WARN for minor.
3. Check that the package manager is installed and dependencies exist (`node_modules` / `vendor` / `.venv`). If lockfile exists but deps folder doesn't: print the install command.
4. Compare `.env.example` against `.env` — list any keys missing from `.env` (never print values, only key names).
5. Run the project's health check if one exists (`npm run check`, `make check`, etc.).

Output:
```
[OK]      Node 20.11.0 — matches required >=20
[MISMATCH] Python 3.9.7 — project requires >=3.11
[MISSING] .env key: DATABASE_URL — present in .env.example, not in .env
[MISSING] node_modules — run `npm install`
[OK]      Docker 24.0.5 — available
```

End with: `Environment ready` or `X issues found — fix the above before running the project`
