---
description: Generate a Keep a Changelog entry from commits since main
---

Generate a changelog entry from `git log main...HEAD --pretty=format:"%s"`.

Group each commit into Keep a Changelog sections:
- **Added** — new features (`feat:` or `add` in message)
- **Changed** — modifications to existing behavior
- **Fixed** — bug fixes (`fix:` in message)
- **Removed** — deleted functionality
- **Security** — security-related fixes

Use today's date. Output the block ready to paste at the top of CHANGELOG.md:

```markdown
## [Unreleased] - YYYY-MM-DD

### Added
- ...

### Fixed
- ...
```

Skip merge commits and chore/ci/docs commits unless relevant to end users.
