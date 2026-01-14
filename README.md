# Weather App (OSS)

A simple, client-side weather app that fetches current conditions from OpenWeather API. No backend required — just HTML, CSS, and JavaScript inside `docs/`.

## Overview

This project is a static site located under `docs/`:
- `docs/index.html`: UI markup and inputs
- `docs/css/style.css`: Styling and themes
- `docs/js/index.js`: Client-side logic using `fetch` to call OpenWeather; sunrise/sunset ring and wind compass visuals; offline banner

Search for a city and the app shows:
- City and country
- Temperature in C with a smooth count-up animation
- Weather description
- Dynamic background by condition (clear/clouds/rain/drizzle/thunderstorm/snow/fog/wind)
- Dark/light theme toggle (auto by local time, manual toggle saved in `localStorage`)

## Quick Start

- Clone the repo:
```powershell
git clone https://github.com/shivam123-dev/weather-app-oss.git
cd weather-app-oss
```
- Set your OpenWeather API key in `docs/js/index.js`:
```js
const API = {
  baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
  key: 'YOUR_OPENWEATHER_API_KEY'
};
```
- Run locally:
  - Simplest: double-click `docs/index.html` to open in your browser.
  - Optional local server:
    - Python: `python -m http.server` then open `http://localhost:8000/docs/`
    - Node: `npx serve docs`

### Security Notes (API Keys)
- Do not commit real API keys. Use a local-only change and avoid pushing it.
- For public deployments, avoid exposing keys in client-side code. Use a lightweight backend proxy to keep the key server-side.

## Accessibility

The UI aims for keyboard and screen-reader friendly defaults.
- Controls:
  - `Theme Toggle` button (`id="themeToggle"`): focusable; `aria-label="Toggle theme"`; press Space/Enter to toggle. Icon updates (sun/moon) and `title` reflects mode.
  - `City` input (`id="searchCity"`): focusable text field; pressing Enter submits the form.
  - `Search` submit (`id="submit"`): focusable; has a clear focus indicator via `:focus-visible` box-shadow.
- Sections:
  - `Sunrise / Sunset` and `Wind Direction` cards are grouped with `aria-label`s for context.
  - Decorative compass dial/arrow labels are marked `aria-hidden="true"` to avoid noise.
- Focus order:
  1. Theme toggle 
  2. City input 
  3. Search button 
  4. Cards and content
- Color and contrast:
  - Two themes (`theme--light`/`theme--dark`) with variables tuned for readable contrast. Backgrounds adjust by weather but maintain legibility.
- Offline mode:
  - When offline, a banner appears and the last known weather is shown from `localStorage`.

If you find gaps or have suggestions (labels, roles, order), please open an issue.

## Screenshots

Visuals of the UI in both themes and varied conditions.

> Note: Image files are referenced below. If they do not yet appear, see `docs/screenshots/README.md` for how to capture and add them.

- Light theme homepage
  
  ![Light theme](docs/screenshots/light.png)
- Dark theme homepage
  
  ![Dark theme](docs/screenshots/dark.png)
- Weather backgrounds
  
  ![Rain background](docs/screenshots/rain.png)
  
  ![Clear sky background](docs/screenshots/clear.png)

## Run Locally (details)
No build step is required. You can open the site directly by double-clicking `docs/index.html`. A local server is optional but helps with some browser policies.

## How It Works

`docs/js/index.js` calls the OpenWeather endpoint:
```
GET https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric
```
The response populates elements `#city`, `#temp`, and `#weather-text`. Sunrise/sunset times and wind visuals use data from the response with sensible fallbacks.

## Troubleshooting
- Empty results: ensure your API key is valid and not rate-limited.
- Network errors: check connectivity and that the request URL matches the documented endpoint.
- Content not updating: verify element IDs in `index.html` match those used in `index.js`.

## Roadmap
- Installable PWA (service worker + manifest)
- Temperature unit toggle (C/F)
- Keyboard shortcut for theme toggle
- Favorites/recent searches (with privacy-first storage)
- i18n for labels and date/time formats
- Additional accessibility refinements (labels, focus management)

## Contributing
Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before opening issues or pull requests.

## Security
Report vulnerabilities per [SECURITY.md](SECURITY.md).

## License
MIT License. See [LICENSE](LICENSE).


## Deploying Safely

Avoid exposing API keys in client-side code when deploying publicly. Use a small backend proxy so the key lives on the server.

Example (Node/Express):
```js
// server.js
import express from 'express';
import fetch from 'node-fetch';
const app = express();

app.get('/api/weather', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing city query param ?q=' });
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  const resp = await fetch(url);
  const text = await resp.text();
  res.status(resp.status).type('json').send(text);
});

app.listen(process.env.PORT || 3000);
```

Client usage:
```js
// docs/js/index.js (replace fetch to OpenWeather with your proxy)
const response = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`);
```

Environment and git hygiene:
- Store secrets in `.env` (e.g., `OPENWEATHER_API_KEY=...`).
- Add `.env` to `.gitignore` to avoid committing secrets.

```gitignore
# Secrets
.env
```
