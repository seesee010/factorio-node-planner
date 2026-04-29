---
description: Validate development environment completeness
allowed-tools: Bash, Read, Glob
argument-hint: "[directory]"
---

Validate the development environment for ${ARGUMENTS:-.} (default: project root).

Steps:
1. Detect the project type by reading manifest files — do NOT assume a stack:
   - `package.json` → Node; read `engines` field for required version
   - `pyproject.toml` / `setup.py` → Python; read `python_requires`
   - `Gemfile` → Ruby; read `.ruby-version` if present
   - `go.mod` → Go; read `go` directive
   - `Cargo.toml` → Rust; read `rust-edition`
   - `docker-compose.yml` / `Dockerfile` → containerized
   - `.nvmrc`, `.node-version`, `.python-version` → version pin files

2. For each detected runtime, check the installed version:
   - Run `node --version`, `python --version`, `ruby --version`, `go version`, `rustc --version`, `docker --version` as appropriate
   - Compare against the required version from the manifest
   - Flag MISMATCH if major version differs, WARN if minor version differs

3. Check for required tooling:
   - Package manager (`npm`/`yarn`/`pnpm`/`pip`/`bundle`/`cargo`) — is it installed?
   - If the lockfile exists but `node_modules`/`vendor`/`.venv` does not: print the install command

4. Check environment variables:
   - Look for `.env.example` or `.env.sample`
   - Compare keys against `.env` — list any keys in example but missing from `.env`
   - Never print the values of any env vars — only the key names

5. Run the project's health check if one exists:
   - Try `npm run check`, `npm run verify`, `make check` — use whichever exists

Output:
```
[OK]      Node 20.11.0 — matches required >=20
[MISMATCH] Python 3.9.7 — project requires >=3.11
[MISSING] .env key: DATABASE_URL — present in .env.example, not in .env
[MISSING] node_modules — run `npm install`
[OK]      Docker 24.0.5 — available
```

End with: `Environment ready` or `X issues found — fix the above before running the project`
