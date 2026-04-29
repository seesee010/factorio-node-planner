---
description: OWASP Top 10 security audit of changed or specified files
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[file-or-directory]"
---

Run a security audit on $ARGUMENTS (default: all files changed vs main, via `git diff main...HEAD --name-only`).

For each file, scan for:

1. **Injection** — string-concatenated SQL/shell/HTML; flag every instance
2. **Hardcoded secrets** — API keys, passwords, tokens in source code; grep for patterns like `secret`, `password`, `token`, `key` followed by `=`
3. **Broken auth** — missing authentication checks on routes, weak session config
4. **XSS** — unsanitized variables rendered into HTML (`innerHTML`, `dangerouslySetInnerHTML`, template literals in DOM)
5. **Insecure deps** — run `npm audit --audit-level=high` if package.json exists
6. **Access control** — routes or functions missing authorization guards
7. **Sensitive data in logs** — `console.log` / `logger.info` printing passwords, tokens, PII
8. **CSRF** — state-changing endpoints without CSRF protection

Report each finding:
```
SEVERITY | file:line | issue description | recommended fix
```

Severity levels: CRITICAL / HIGH / MEDIUM / LOW
