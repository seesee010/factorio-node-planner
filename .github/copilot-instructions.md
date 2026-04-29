# GitHub Copilot Instructions

## Project Context

<!-- TODO: Describe the project so Copilot has context -->

## Preferred Patterns

- Prefer explicit types over `any` / inferred where ambiguity is possible
- Use `async/await` over raw Promises
- Prefer named exports over default exports
- Use early returns to reduce nesting
- Keep functions under ~40 lines

## Avoid

- `console.log` in production code (use a proper logger)
- Mutating function arguments
- Deeply nested callbacks
- `var` — use `const` / `let`
- Broad `catch (e) {}` without handling

## Testing

- Write tests alongside new code
- Use descriptive test names: `it("returns 404 when user is not found")`
- Mock only at system boundaries (HTTP, DB, file system)

## Comments

- Only comment the WHY, not the WHAT
- Remove commented-out code before committing
