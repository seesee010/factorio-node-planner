---
description: Audit dependencies for vulnerabilities, outdated versions, and unused packages
---

Audit project dependencies for vulnerabilities, outdated versions, and unused packages.

Steps:
1. Detect the package manager by looking for: `package.json`, `requirements.txt`, `pyproject.toml`, `Gemfile`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle`, `composer.json`
2. For each detected ecosystem, run the appropriate audit command:
   - npm/yarn/pnpm: run audit and check for vulnerabilities
   - pip: list outdated packages
   - bundler: bundle audit check
   - cargo: cargo audit
3. Read the manifest and identify:
   - **Vulnerable** — packages with known CVEs
   - **Outdated** — packages behind the latest stable (major behind = HIGH, minor = MEDIUM)
   - **Unused** — packages in the manifest but not imported anywhere in source files
   - **Duplicate purpose** — multiple packages doing the same job

Output grouped by severity:
```
CRITICAL | package@version | CVE-XXXX-XXXX | upgrade to X.Y.Z
HIGH     | package@version | 2 major versions behind | latest: X.Y.Z
MEDIUM   | package@version | unused — not imported in any source file
LOW      | lodash + underscore | duplicate libraries — consider removing one
```

End with: `X vulnerable, Y outdated, Z unused — N actions recommended`
