# Contributing

Thank you for your interest in contributing! This repository is set up to provide a clear and effective workflow for contributions.

## Development Setup

### Prerequisites
- Node.js 20+ (check with `node --version`)
- npm (comes with Node.js)

### Installation
```bash
npm install
```

### Linting & Formatting

Before committing, run:

```bash
# Check for lint issues
npm run lint

# Automatically fix lint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check

# Run all checks
npm run lint && npm run format:check && npm test
```

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Always required
- **Line length:** Max 100 characters
- **Trailing commas:** ES5 (no trailing commas in objects/arrays)

ESLint config: `eslint.config.cjs`
Prettier config: `.prettierrc.json`

## How to Contribute

1. **Discuss**: Open an issue using one of the templates to propose bugs, features, or tasks.
2. **Fork & Branch**: Fork the repo and create a branch: `feature/your-change` or `fix/your-bug`.
3. **Develop**: Implement changes with clear commit messages.
4. **Tests**: Include or update tests when applicable.
5. **Lint & Format**: Run `npm run lint:fix && npm run format:check` before committing.
6. **PR**: Open a pull request using the provided template.

## Commit Messages

- Use concise, descriptive messages (e.g., `fix: handle API error`, `feat: add hourly forecast card`).
- Reference related issues: `Fixes #123` or `Refs #456`.

## Pull Request Checklist

- [ ] Follows the PR template
- [ ] Includes tests or rationale
- [ ] Updates documentation if needed
- [ ] Passes CI checks (`npm run lint && npm run format:check && npm test`)

## Code of Conduct

By participating, you agree to abide by our `CODE_OF_CONDUCT.md`.
