# GEMINI.md

Instructions for Google Gemini CLI when working in this repository.

## Repository Purpose

<!-- TODO: Short description of what this repo does -->

## Getting Started

```bash
# Install dependencies
npm install

# Run the project
npm run dev

# Run tests
npm test
```

## Code Style

- Follow existing patterns in the codebase
- Use the language/framework already present in each directory
- Run linting before finishing: `npm run lint`
- Run tests before finishing: `npm test`

## Boundaries

- Do NOT modify lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Do NOT commit `.env` files or secrets
- Do NOT delete or overwrite migration files
- Do NOT break existing tests — fix them if needed

## How to Implement Changes

1. Read existing code before writing new code
2. Match the style and patterns already in the file
3. Write or update tests for any changed logic
4. Ensure `npm run lint` and `npm test` pass

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- Reference related issues with `Closes #123`

## Security

- Never log sensitive data (passwords, tokens, PII)
- Validate all user input at system boundaries
- Use parameterized queries — no string interpolation in SQL
