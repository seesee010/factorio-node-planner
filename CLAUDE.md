# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

<!-- TODO: Describe your project here -->
<!-- Example: A web application for managing tasks built with Next.js and PostgreSQL -->

**Project Name:** <!-- TODO -->
**Tech Stack:** <!-- TODO: e.g., TypeScript, React, Node.js, PostgreSQL -->
**Purpose:** <!-- TODO -->

## Development Commands

```bash
# Install dependencies
npm install          # or: pnpm install / yarn install / pip install -r requirements.txt

# Start dev server
npm run dev

# Build
npm run build

# Run tests
npm test             # or: pytest / go test ./...

# Lint & format
npm run lint
npm run format
```

<!-- TODO: Replace with your actual commands -->

## Architecture

```
src/
  components/    # UI components
  lib/           # Shared utilities
  app/           # App routes / pages
tests/           # Test files
```

<!-- TODO: Describe your actual folder structure and key modules -->

## Coding Conventions

- Language: <!-- TODO: TypeScript / Python / Go / etc. -->
- Formatter: <!-- TODO: Prettier / Black / gofmt -->
- Linter: <!-- TODO: ESLint / Ruff / golangci-lint -->
- Testing: <!-- TODO: Vitest / Jest / pytest -->
- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)

## Key Constraints & Rules

- Never commit secrets or API keys — use `.env.local` (gitignored)
- All PRs require passing CI before merge
- Write tests for new features
- Keep functions small and focused
- Prefer composition over inheritance

## Environment Variables

```bash
# Copy .env.example to .env.local and fill in values
cp .env.example .env.local
```

Required variables:
```
# TODO: list your required env vars
# DATABASE_URL=
# API_KEY=
# NEXT_PUBLIC_BASE_URL=
```

## External Services & Integrations

<!-- TODO: List any APIs, databases, or third-party services -->

## Testing Strategy

- Unit tests for pure logic
- Integration tests for API routes and DB interactions
- E2E tests for critical user flows
- Run `npm test` before pushing

## Important Notes for Claude

- <!-- TODO: Add any project-specific gotchas -->
- Do NOT modify `*.lock` files manually
- Do NOT commit `.env*` files
- When in doubt about scope, ask before implementing
