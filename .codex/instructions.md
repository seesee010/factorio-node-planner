# Codex Instructions

Project-specific instructions for OpenAI Codex CLI.

## Repository Purpose

<!-- TODO: Short description of what this repo does -->

## Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint & format
npm run lint
npm run format
```

## Code Style

- Read existing code before writing new code — match the style in the file
- Match existing naming conventions, file structure, and patterns
- Do not add features beyond what was asked
- Do not add comments that describe WHAT the code does — only WHY if non-obvious
- Never use `any` type in TypeScript unless absolutely unavoidable

## Code Quality

- Keep functions small and single-purpose
- Use early returns to reduce nesting depth
- Prefer immutability (`const`, spread, map/filter) over mutation
- Validate inputs only at system boundaries (API endpoints, user input)
- Do not add error handling for impossible scenarios

## Boundaries

- Do NOT modify lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Do NOT commit `.env` files or secrets
- Do NOT delete or overwrite migration files
- Do NOT break existing tests — fix them if needed

## How to Implement Changes

1. Read existing code before writing new code
2. Match the style and patterns already in the file
3. Write or update tests for any changed logic
4. Ensure `npm run lint` and `npm test` pass before finishing

## Security

- Never log sensitive data (passwords, tokens, PII)
- Never hardcode credentials, tokens, or API keys
- Validate all user input at system boundaries
- Use parameterized queries — no string interpolation in SQL

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- Reference related issues with `Closes #123`
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`
