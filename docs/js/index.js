const API = {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    key: 'c4422cf35f4cbed9fd9c8471c0432992'
};

// WARNING: Hardcoding API keys in client-side code is insecure.
// This key will be visible to anyone who loads your site.
// For a public deployment, use a backend proxy instead.
const GEMINI_API_KEY = 'AIzaSyDSEQsmzemj8uunBkjGIn2ae5My8syJoZc';
// Disable Gemini on GitHub Pages domains to avoid CORS/referrer issues
const GEMINI_ENABLED = !String(location.hostname).endsWith('github.io') && !!(GEMINI_API_KEY || '').trim();

const STORAGE_KEYS = {
    themePreference: 'weatherApp.themePreference', // 'light' | 'dark' | 'auto'
    lastWeather: 'weatherApp.lastWeather',
};

const searchBtn = document.getElementById('submit');
const searchCity = document.getElementById('searchCity');
const searchForm = document.querySelector('form');
const offlineBanner = document.getElementById('offlineBanner');


const themeToggleBtn = document.getElementById('themeToggle');

const WEATHER_BG_CLASSES = [
    'weather--clear',
    'weather--clouds',
    'weather--rain',
    'weather--drizzle',
    'weather--thunderstorm',
    'weather--snow',
    'weather--fog',
    'weather--wind'
];

const THEME_CLASSES = ['theme--light', 'theme--dark'];

initTheme();
initOfflineMode();

if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const cityName = (searchCity.value || '').trim();
        if (!cityName) {
            alert('Please enter a city name.');
            return;
        }

        try {
            if (!navigator.onLine) {
                showOfflineBanner(true);
                const cached = getLastWeather();
                if (cached) {
                    showReport(cached);
                    return;
                }
            }

            const url = `${API.baseUrl}?q=${encodeURIComponent(cityName)}&appid=${API.key}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                // OpenWeather sends { cod, message } on errors
                alert(data.message || 'Failed to fetch weather.');
                return;
            }

            showReport(data);
        } catch (err) {
            alert('Network error. Please try again.');
            console.error(err);
        }
    });
}

async function showReport(weatherData) {
    try { cacheLastWeather(weatherData); } catch {}
    const cityElement = document.getElementById('city');
    cityElement.innerText = `${weatherData.name}, ${weatherData.sys?.country ?? ''}`.trim();

    // Use the 'temp' element id (ensure index.html matches)
    const tempElement = document.getElementById('temp');
    const t = weatherData.main?.temp;
    if (t != null) {
        animateTemperature(tempElement, Math.round(t));
    } else {
        tempElement.innerHTML = '—';
    }

    const weatherTextElement = document.getElementById('weather-text');
    const weatherMain = weatherData.weather?.[0]?.main ?? '—';
    const weatherDesc = weatherData.weather?.[0]?.description ?? '';
    weatherTextElement.innerHTML = weatherMain;

    const conditionGroup = getConditionGroup(weatherData);
    setWeatherBackground(conditionGroup);

    const quoteElement = document.getElementById('quote');
    if (quoteElement) {
        quoteElement.textContent = 'Generating quote…';

        const fallbackQuote = generateWeatherQuote({
            city: weatherData.name ?? 'your city',
            country: weatherData.sys?.country ?? '',
            conditionGroup,
            weatherMain,
            weatherDesc,
            tempC: weatherData.main?.temp,
            humidity: weatherData.main?.humidity,
            windMs: weatherData.wind?.speed
        });

        try {
            const geminiKey = GEMINI_ENABLED ? (GEMINI_API_KEY || '').trim() : '';
            if (!geminiKey) {
                quoteElement.textContent = fallbackQuote;
                return;
            }

            const aiQuote = await generateGeminiQuote({
                apiKey: geminiKey,
                city: weatherData.name ?? 'your city',
                country: weatherData.sys?.country ?? '',
                conditionGroup,
                weatherMain,
                weatherDesc,
                tempC: weatherData.main?.temp,
                humidity: weatherData.main?.humidity,
                windMs: weatherData.wind?.speed
            });

            quoteElement.textContent = aiQuote || fallbackQuote;
        } catch (e) {
            console.warn('Gemini quote failed; using fallback quote.', e);
            quoteElement.textContent = fallbackQuote;
        }
    }

    // Visualizations
    renderSunTimes(weatherData);
    renderWind(weatherData);
}

function initTheme() {
    // Default behavior: auto switch based on local time.
    const preference = getThemePreference();
    applyThemePreference(preference);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = getThemePreference();
            // Simplest UX: toggle between light and dark; if auto, treat it as toggle to dark.
            const next = current === 'dark' ? 'light' : 'dark';
            setThemePreference(next);
            applyThemePreference(next);
        });
    }

    // Re-evaluate auto theme periodically.
    window.setInterval(() => {
        if (getThemePreference() === 'auto') {
            applyThemePreference('auto');
        }
    }, 60 * 1000);
}

function applyThemePreference(preference) {
    const resolved = (preference === 'auto') ? resolveAutoTheme() : preference;
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.add(resolved === 'dark' ? 'theme--dark' : 'theme--light');
    updateThemeToggleIcon(preference, resolved);
}

function resolveAutoTheme() {
    // System-time based (simple): dark from 6pm–6am.
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'dark' : 'light';
}

function updateThemeToggleIcon(preference, resolved) {
    if (!themeToggleBtn) return;
    // Show the *action* icon: if currently dark, show sun to switch to light.
    const isDarkNow = resolved === 'dark';
    themeToggleBtn.textContent = isDarkNow ? '☀️' : '🌙';
    const titleSuffix = preference === 'auto' ? ' (auto)' : '';
    themeToggleBtn.title = `Toggle theme${titleSuffix}`;
}

function getThemePreference() {
    const value = (localStorage.getItem(STORAGE_KEYS.themePreference) || 'auto').toLowerCase();
    if (value === 'light' || value === 'dark' || value === 'auto') return value;
    return 'auto';
}

function setThemePreference(value) {
    localStorage.setItem(STORAGE_KEYS.themePreference, value);
}

function setWeatherBackground(conditionGroup) {
    const body = document.body;
    body.classList.remove(...WEATHER_BG_CLASSES);

    const classNameByGroup = {
        clear: 'weather--clear',
        clouds: 'weather--clouds',
        rain: 'weather--rain',
        drizzle: 'weather--drizzle',
        thunderstorm: 'weather--thunderstorm',
        snow: 'weather--snow',
        fog: 'weather--fog',
        wind: 'weather--wind'
    };

    const className = classNameByGroup[conditionGroup];
    if (className) body.classList.add(className);
}

function getConditionGroup(weatherData) {
    const main = (weatherData.weather?.[0]?.main ?? '').toLowerCase();
    const id = weatherData.weather?.[0]?.id;
    const windMs = weatherData.wind?.speed;

    // OpenWeather condition IDs: https://openweathermap.org/weather-conditions
    if (typeof id === 'number') {
        if (id >= 200 && id < 300) return 'thunderstorm';
        if (id >= 300 && id < 400) return 'drizzle';
        if (id >= 500 && id < 600) return 'rain';
        if (id >= 600 && id < 700) return 'snow';
        if (id >= 700 && id < 800) return 'fog';
        if (id === 800) return 'clear';
        if (id > 800 && id < 900) return 'clouds';
    }

    if (main.includes('thunder')) return 'thunderstorm';
    if (main.includes('drizzle')) return 'drizzle';
    if (main.includes('rain')) return 'rain';
    if (main.includes('snow')) return 'snow';
    if (main.includes('mist') || main.includes('fog') || main.includes('haze') || main.includes('smoke') || main.includes('dust') || main.includes('sand') || main.includes('ash') || main.includes('squall') || main.includes('tornado')) return 'fog';
    if (main.includes('cloud')) return 'clouds';
    if (main.includes('clear')) return 'clear';

    // Fallback: if it's quite windy, use wind theme.
    if (typeof windMs === 'number' && windMs >= 10) return 'wind';
    return 'clear';
}

function generateWeatherQuote({ city, conditionGroup, weatherMain, weatherDesc, tempC, humidity, windMs }) {
    const adviceByGroup = {
        rain: [
            'Carry an umbrella and take extra care on slippery paths.',
            'A light raincoat helps—watch your step on slick roads.',
            'Give yourself extra time—roads can be slick.'
        ],
        drizzle: [
            'A compact umbrella is enough—watch for damp sidewalks.',
            'Light layers work well—keep your shoes dry.'
        ],
        thunderstorm: [
            'Stay indoors if you can—avoid open areas and tall objects.',
            'Pause outdoor plans—safety first when storms roll in.'
        ],
        snow: [
            'Warm layers help—watch for icy patches and take it slow.',
            'Steady steps today—ice can hide in plain sight.'
        ],
        clouds: [
            'A calm day—take a steady pace and enjoy a quiet walk.',
            'Good focus weather—wrap up tasks, then take a short stroll.'
        ],
        fog: [
            'Drive carefully—visibility can change quickly.',
            'Slow down and stay visible—lights and reflective gear help.'
        ],
        wind: [
            'Hold onto hats—secure loose items before stepping out.',
            'A windproof layer helps—keep your grip and your balance.'
        ],
        clear: [
            'Take a breath outside—pace yourself and stay hydrated.',
            'Fresh air is calling—carry water and take breaks.'
        ]
    };

    const closers = [
        'Make it a good day.',
        'Take it easy out there.',
        'Keep it simple and steady.'
    ];

    const seedKey = `${city}|${conditionGroup}|${new Date().toDateString()}`;
    const rng = seededRng(seedKey);
    const advice = pick(adviceByGroup[conditionGroup] || adviceByGroup.clear, rng);
    const closer = pick(closers, rng);

    // Output only the quote line (tip + closer), no city/metrics/weather labels.
    // Example desired: “Drive carefully—visibility can change quickly. Make it a good day.”
    return `${advice} ${closer}`;
}

function pick(list, rng) {
    if (!Array.isArray(list) || list.length === 0) return '';
    const idx = Math.floor(rng() * list.length);
    return list[Math.min(idx, list.length - 1)];
}

function seededRng(seedText) {
    // Mulberry32 PRNG with a simple string hash seed.
    let seed = 0;
    for (let i = 0; i < seedText.length; i++) {
        seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

async function generateGeminiQuote({ apiKey, city, conditionGroup, weatherMain, weatherDesc, tempC, humidity, windMs }) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const tempRounded = (typeof tempC === 'number') ? Math.round(tempC) : null;
    const windRounded = (typeof windMs === 'number') ? Math.round(windMs) : null;
    const humidityRounded = (typeof humidity === 'number') ? Math.round(humidity) : null;

    const prompt = [
        'Write ONE short, quote-like message in TWO sentences:',
        'Sentence 1: a practical tip containing exactly one em dash (—).',
        'Sentence 2: a short closer like “Make it a good day.”',
        'Tone: calm, helpful, not descriptive or report-like.',
        'Hard rules:',
        '- Do NOT mention the city name.',
        '- Do NOT mention temperature, wind, humidity, numbers, or units.',
        '- Do NOT say the weather condition (no words like rain/fog/cloud/snow/sunny).',
        '- No emojis. No hashtags. No lists.',
        '- Output ONLY the two-sentence quote.',
        '',
        'Use these signals only to decide the advice (don’t repeat them):',
        `City: ${city}`,
        `Condition: ${weatherMain}${weatherDesc ? ` (${weatherDesc})` : ''}`,
        `Condition group: ${conditionGroup}`,
        `TempC: ${tempRounded ?? 'unknown'}`,
        `Wind m/s: ${windRounded ?? 'unknown'}`,
        `Humidity %: ${humidityRounded ?? 'unknown'}`
    ].join('\n');

    const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 60 }
        })
    });

    const data = await resp.json();
    if (!resp.ok) {
        const message = data?.error?.message || 'Gemini request failed.';
        throw new Error(message);
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
    const forbidden = buildForbiddenQuoteTerms({ city, weatherMain, weatherDesc });
    return sanitizeTipAndCloser(text, forbidden);
}

function buildForbiddenQuoteTerms({ city, weatherMain, weatherDesc }) {
    const terms = [
        city,
        weatherMain,
        weatherDesc,
        // common weather words we don't want echoed verbatim
        'rain', 'raining', 'drizzle', 'storm', 'thunder', 'snow', 'cloud', 'cloudy', 'clear', 'sunny',
        'fog', 'mist', 'haze',
        // metrics / units
        '°', 'deg', 'c', 'f', 'km/h', 'kph', 'mph', 'm/s', '%', 'humidity', 'wind', 'temperature', 'temp'
    ]
        .filter(Boolean)
        .map(s => String(s).toLowerCase().trim())
        .filter(s => s.length > 0);
    return Array.from(new Set(terms));
}

function sanitizeTipAndCloser(text, forbiddenTerms) {
    if (!text) return '';
    const cleaned = String(text)
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^["'`]+/, '')
        .replace(/["'`]+$/, '')
        .trim();

    // Must be two sentences. Keep first two only.
    const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
    const two = sentences.slice(0, 2).join(' ').trim();

    // Must contain exactly one em dash.
    const emDashCount = (two.match(/—/g) || []).length;
    if (emDashCount !== 1) return '';

    // Reject numbers/units/metrics, city name, and explicit weather words.
    if (/[0-9]/.test(two)) return '';
    const lower = two.toLowerCase();
    for (const term of forbiddenTerms) {
        if (!term) continue;
        // avoid over-blocking single-letter tokens like "c"
        if (term.length <= 1) continue;
        if (lower.includes(term)) return '';
    }

    return two;
}

/**
 * Animate temperature count-up using CSS animation of a custom property.
 * CSS animates --temp from 0 to --temp-target; JS reads it each frame to render text.
 */
function animateTemperature(el, target) {
    try {
        // Set target and trigger animation class
        el.style.setProperty('--temp-target', target);
        el.classList.add('temp--animating');

        let last = NaN;
        let rafId = 0;
        const update = () => {
            const v = parseFloat(getComputedStyle(el).getPropertyValue('--temp'));
            if (!Number.isNaN(v)) {
                const n = Math.round(v);
                if (n !== last) {
                    last = n;
                    el.innerHTML = `${n} &deg;C`;
                }
            }
            rafId = requestAnimationFrame(update);
        };
        update();

        const finish = () => {
            cancelAnimationFrame(rafId);
            el.classList.remove('temp--animating');
            el.innerHTML = `${Math.round(target)} &deg;C`;
        };

        // End when CSS animation completes (preferred)
        el.addEventListener('animationend', finish, { once: true });
        // Fallback safety: finish after ~2s even if event not fired
        setTimeout(() => {
            // If still animating, finish gracefully
            if (el.classList.contains('temp--animating')) finish();
        }, 2000);
    } catch (e) {
        // Absolute fallback: set directly
        el.innerHTML = `${Math.round(target)} &deg;C`;
    }
}

// -------------------- Offline Mode --------------------
function initOfflineMode(){
    const handler = () => showOfflineBanner(!navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    handler();

    // On load, if offline, try to show cached data
    if (!navigator.onLine) {
        const cached = getLastWeather();
        if (cached) showReport(cached);
    }
}

function showOfflineBanner(show){
    if (!offlineBanner) return;
    offlineBanner.hidden = !show;
}

function cacheLastWeather(data){
    localStorage.setItem(STORAGE_KEYS.lastWeather, JSON.stringify(data));
}

function getLastWeather(){
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.lastWeather);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// (Recent & Favorite features removed per request)

// -------------------- Sunrise / Sunset --------------------
function renderSunTimes(weatherData){
    let sunrise = weatherData?.sys?.sunrise; // unix UTC seconds
    let sunset = weatherData?.sys?.sunset;   // unix UTC seconds
    const tzOffset = weatherData?.timezone ?? 0; // seconds offset from UTC
    const labelEl = document.getElementById('sunTimesLabel');
    const remEl = document.getElementById('sunRemaining');
    const ring = document.querySelector('.ring-progress');
    const circumference = 2 * Math.PI * 54; // r=54

    if (!(ring && labelEl && remEl)) return;

    // Fallback: if sunrise/sunset missing, query sunrise-sunset.org via coords
    const tryFallback = async () => {
        const lat = weatherData?.coord?.lat;
        const lon = weatherData?.coord?.lon;
        if (typeof lat !== 'number' || typeof lon !== 'number') return false;
        try {
            const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
            const resp = await fetch(url);
            const data = await resp.json();
            const srIso = data?.results?.sunrise;
            const ssIso = data?.results?.sunset;
            if (srIso && ssIso) {
                sunrise = Math.floor(new Date(srIso).getTime() / 1000); // UTC seconds
                sunset = Math.floor(new Date(ssIso).getTime() / 1000);  // UTC seconds
                return true;
            }
        } catch {}
        return false;
    };

    const proceed = async () => {
        if (!(typeof sunrise === 'number' && typeof sunset === 'number')) {
            const ok = await tryFallback();
            if (!ok) {
                // Could not resolve; show placeholders
                labelEl.textContent = `--:-- / --:--`;
                remEl.textContent = `Time remaining: --`;
                return;
            }
        }

    const fmt = (secUtc) => {
        const ms = (secUtc + tzOffset) * 1000;
        const d = new Date(ms);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    labelEl.textContent = `${fmt(sunrise)} / ${fmt(sunset)}`;

    const nowUtcSec = Math.floor(Date.now() / 1000);
    const nowLocSec = nowUtcSec; // we add tzOffset below when comparing

    const start = sunrise + 0; // local compared via offset
    const end = sunset + 0;
    const nowAdj = nowLocSec + tzOffset;

    let frac = 0;
    let remainingSec = 0;
    if (nowAdj <= start) {
        frac = 0;
        remainingSec = start - nowAdj;
    } else if (nowAdj >= end) {
        frac = 0;
        remainingSec = (start + 24 * 3600) - nowAdj; // until next sunrise roughly
    } else {
        frac = (nowAdj - start) / (end - start);
        remainingSec = end - nowAdj;
    }

    frac = Math.max(0, Math.min(1, frac));
    const offset = circumference * (1 - frac);
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${offset}`;

    const hrs = Math.floor(remainingSec / 3600);
    const mins = Math.floor((remainingSec % 3600) / 60);
    remEl.textContent = `Time remaining: ${hrs}h ${mins}m`;
    };

    proceed();
}

// -------------------- Wind Compass --------------------
function renderWind(weatherData){
    let deg = weatherData?.wind?.deg;
    let speed = weatherData?.wind?.speed;
    const arrow = document.getElementById('compassArrow');
    const speedEl = document.getElementById('windSpeed');
    const degEl = document.getElementById('windDeg');
    const updateLabels = () => {
        if (speedEl) speedEl.textContent = (typeof speed === 'number') ? `${Math.round(speed)} m/s` : '-- m/s';
        if (degEl) degEl.textContent = (typeof deg === 'number') ? `${Math.round(deg)}°` : '--°';
    };

    updateLabels();

    if (!(typeof deg === 'number')) {
        // Fallback: fetch forecast and use nearest wind direction
        const city = weatherData?.name;
        if (city) {
            (async () => {
                try {
                    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API.key}&units=metric`;
                    const resp = await fetch(url);
                    const data = await resp.json();
                    const item = Array.isArray(data?.list) ? data.list[0] : null;
                    const w = item?.wind;
                    if (w) {
                        if (typeof w.speed === 'number' && typeof speed !== 'number') speed = w.speed;
                        if (typeof w.deg === 'number') deg = w.deg;
                        updateLabels();
                        if (arrow && typeof deg === 'number') {
                            arrow.style.transition = 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)';
                            arrow.style.transform = `translateX(-50%) rotate(${deg}deg)`;
                        }
                    }
                } catch {}
            })();
        }
    }

    if (!arrow || typeof deg !== 'number') return;
    arrow.style.transition = 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)';
    arrow.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

// (Charts removed per request)
