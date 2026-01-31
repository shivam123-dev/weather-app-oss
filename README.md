# Weather App (OSS)

![ESLint](https://github.com/shivam123-dev/weather-app-oss/actions/workflows/eslint.yml/badge.svg)
![Lighthouse](https://github.com/shivam123-dev/weather-app-oss/actions/workflows/lighthouse.yml/badge.svg)

A simple, client-side weather app that fetches current conditions from OpenWeather API.

A simple, client-side weather app that fetches current conditions from OpenWeather API. No Node.js or backend required — just HTML, CSS, and JavaScript inside `docs/`.

- Project repository: https://github.com/shivam123-dev/weather-app-oss

## Overview

This project is a static site located under `docs/`:
- `docs/index.html`: UI markup and inputs
- `docs/css/style.css`: Styling
- `docs/js/index.js`: Client-side logic using `fetch` to call OpenWeather

Search for a city, and the app shows:
- City and country
- Temperature in °C
- Weather description
- A dynamic background based on the current condition
- A dark/light theme toggle (auto by time, manual toggle saved in localStorage)

## Requirements

- A modern browser (Chrome, Edge, Firefox, Safari)
- An OpenWeather API key: https://openweathermap.org/api

## Setup

1) Get an API key from OpenWeather.
2) Open `docs/js/index.js` and replace the value of `API.key` with your key.

```javascript
const API = {
	baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
	key: 'YOUR_OPENWEATHER_API_KEY'
};
```

## Run Locally

No build step is required. You can open the site directly:

- Double-click `docs/index.html`

## How It Works

`docs/js/index.js` calls the OpenWeather endpoint:

```
GET https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric
```

The response is parsed and rendered into elements with IDs `city`, `temp`, and `weather-text` in `index.html`.

## Security & Privacy Notes

- This app only sends requests to OpenWeather and does not store personal data.

## Troubleshooting

- Empty results: ensure your API key is valid and not rate-limited.
- Network errors: check internet connectivity and that the request URL matches the documented endpoint.
- Content not updating: verify the element IDs in `index.html` match those used in `index.js`.

## Changelog

See the project changelog at [`CHANGELOG.md`](./CHANGELOG.md).

## Contributing

Please read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening issues or pull requests.

## Security

Report vulnerabilities per [`SECURITY.md`](./SECURITY.md).

## License

Licensed under the MIT License. See [`LICENSE`](./LICENSE).

## 🚀 Deploying to GitHub Pages

This project can be deployed easily using **GitHub Pages**.

### Steps to Deploy

1. Fork or clone this repository.
2. Push the project to your GitHub repository.
3. Go to your repository on GitHub.
4. Click on **Settings**.
5. In the left sidebar, click **Pages**.
6. Under **Source**:
   - Select **Branch**: `main`
   - Select **Folder**: `/docs`
7. Click **Save**.

After a few minutes, your website will be live at:

