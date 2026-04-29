---
description: Audit dependencies for vulnerabilities, outdated versions, and unused packages
allowed-tools: Bash, Read, Glob
argument-hint: "[directory]"
---

Audit dependencies in ${ARGUMENTS:-.} (default: project root).

Steps:
1. Detect the package manager by looking for these files:
   - `package.json` → Node/npm/yarn/pnpm
   - `requirements.txt` or `pyproject.toml` → Python/pip
   - `Gemfile` → Ruby/bundler
   - `go.mod` → Go modules
   - `Cargo.toml` → Rust/cargo
   - `pom.xml` or `build.gradle` → Java/Maven/Gradle
   - `composer.json` → PHP/Composer

2. For each detected ecosystem, run the appropriate audit command:
   - npm: `npm audit --json 2>/dev/null`
   - yarn: `yarn audit --json 2>/dev/null`
   - pnpm: `pnpm audit --json 2>/dev/null`
   - pip: `pip list --outdated 2>/dev/null`
   - bundler: `bundle audit check 2>/dev/null`
   - cargo: `cargo audit 2>/dev/null`

3. Read the manifest file and identify:
   - **Vulnerable** — packages with known CVEs from the audit output
   - **Outdated** — packages where installed version is behind latest stable (major = HIGH, minor = MEDIUM)
   - **Unused** — packages listed in the manifest but not imported anywhere in source files (use Grep to check)
   - **Duplicate purpose** — multiple packages that do the same thing (e.g., two HTTP clients, two test frameworks)

Output grouped by severity:
```
CRITICAL | package@version | CVE-XXXX-XXXX | upgrade to X.Y.Z
HIGH     | package@version | 2 major versions behind | latest: X.Y.Z
MEDIUM   | package@version | unused — not imported in any source file
LOW      | lodash + underscore | duplicate utility libraries — consider removing one
```

End with: `X vulnerable, Y outdated, Z unused — N actions recommended`
