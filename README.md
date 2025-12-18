# Weather App OSS

Private repository prepared for open-source compliance for the Weather App project. This repo contains community health files, contribution guidelines, and templates to support a healthy open-source workflow.

- Project homepage: https://github.com/shivam123-dev/weather-app.github.io

## Overview

This repository hosts the open-source governance files for the Weather App and the static site under `docs/`. It is currently private but structured for easy transition to public/open-source.

## What's Included

- `CODE_OF_CONDUCT.md`: Expected standards and reporting process
- `CONTRIBUTING.md`: How to contribute effectively
- `SECURITY.md`: Responsible disclosure guidelines
- `.github/ISSUE_TEMPLATE/`: Issue templates for bugs, features, and tasks
- `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`: Pull request template
- `LICENSE`: MIT License
- `docs/`: Static site (HTML/CSS/JS)

## Local Preview

- Requirements: Node.js 18+ recommended
- Commands:

```pwsh
# Install dev dependencies
npm install
# Serve static site at http://localhost:8080
npm run preview
```

Open `http://localhost:8080/docs/index.html` in your browser.

## Continuous Integration

GitHub Actions runs a basic CI on push/PR:
- Node setup
- ESLint on `docs/js/index.js`

See `.github/workflows/ci.yml`.

## Static Preview (GitHub Pages)

A deploy workflow is set up to publish `docs/` to GitHub Pages (`.github/workflows/deploy-pages.yml`).
- You may need to enable Pages in repository settings.
- For private repositories, visibility may require a paid plan or making the repo public.

## Contributing

Please read `CODE_OF_CONDUCT.md` and `CONTRIBUTING.md` before opening issues or pull requests.

## Code of Conduct

We adopt the Contributor Covenant. See `CODE_OF_CONDUCT.md`.

## Security

Please follow the guidance in `SECURITY.md` for reporting vulnerabilities.

## License

Licensed under the MIT License. See `LICENSE` for details.
