# v0.1.1 - Incremental release

Highlights
- Packaging: npm tarball for distribution
- CI/Tooling: ESLint flat config, Lighthouse CI, Jest + jsdom tests
- UI/Features: Responsive UI, dark theme, offline mode, sunrise/sunset ring, wind compass, unit toggle (C/F)
- Reliability: Browser-runtime ESLint fixes and error handling improvements

Changes
- Contributor attribution and changelog update (PR #18 credited to @2024si96557-ship-it)
- Tooling updates (ESLint/Prettier consolidation)

Install via npm (GitHub Release tarball)
```powershell
npm install https://github.com/shivam123-dev/weather-app-oss/releases/download/v0.1.1/weather-app-oss-0.1.1.tgz
```

GitHub Packages (npm.pkg.github.com)
- Package name: `@shivam123-dev/weather-app-oss`
- Configure registry and auth (one-time):
```powershell
npm config set @shivam123-dev:registry https://npm.pkg.github.com
$env:NODE_AUTH_TOKEN = "<YOUR_GITHUB_TOKEN_WITH_write:packages>"
```
- Install (after publish):
```powershell
npm install @shivam123-dev/weather-app-oss
```

Notes
- This package distributes the static site under `docs/` for embedding or reuse.
- Node >= 20 recommended for tooling. No runtime Node dependency for the site itself.
