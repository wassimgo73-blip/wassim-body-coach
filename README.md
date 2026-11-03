# مدرّب وسيم — Wassim Body Coach

A personal, **Arabic-first (RTL) / French** mobile fitness Progressive Web App:
home workouts for beginners, affordable Algerian meal plans, and weight/waist/photo progress tracking.

**100% free. No accounts, servers, paid APIs, analytics, or third-party requests.** All personal data stays on your device.

## Features

| Screen | What it does |
|---|---|
| **Home** (الرئيسية) | Today's plan (workout / walk / rest), calorie + protein + water targets, latest weight & waist with change, BMI and waist-to-height ratio, active-day streak, weekly session count, water glass tracker. |
| **Workouts** (التمارين) | 3 full-body home sessions per week (A/B/C) plus walking days, no equipment except a backpack and a chair. 16 exercises with step-by-step instructions, muscles worked and an easier variation. Sets/reps progress automatically (weeks 1–2, 3–4, 5+). Guided session mode with set check-off, an automatic rest timer, a hold timer for planks, and a log. |
| **Meals** (الوجبات) | 7-day plan of affordable Algerian food (lentils, loubia, chickpeas, sardines, eggs, chicken, chorba frik, couscous, lben/raïb…), about 2,200 kcal and 125–137 g protein per day, rough cost in DZD, meal check-off for today, a weekly shopping list and nutrition tips. |
| **Progress** (التقدّم) | Log weight and waist with validation. Weekly-average line charts for weight and waist, a sessions-per-week bar chart (hover/tap tooltips), a table view, and an editable history. |
| **Photos** (الصور) | Private progress photos, compressed on the device and stored in **IndexedDB only**. Pose and note, full view, before/after side-by-side comparison, delete. |
| **Settings** (الإعدادات) | Language (AR/FR), profile (age, height, weight, activity, programme start), install button, JSON backup export/import (photos optional), and wipe all data. |

### Honesty notes built into the app
- Fat can't be lost from one spot. Lower-belly fat goes down as **overall** body fat goes down. The app says this plainly.
- The app does **not** estimate body fat from photos. Photos are only for visual comparison.
- Calories and prices are estimates. The app is general guidance, not medical advice.

### How targets are calculated (default profile: male, 24 y, 190 cm, 85 kg, lightly active)
- BMR (Mifflin-St Jeor) ≈ 1,923 kcal → maintenance ×1.375 ≈ 2,644 kcal
- Moderate deficit (15%, at most 500 kcal) → **≈ 2,250 kcal/day**
- Protein 1.6 g/kg → **≈ 136 g/day**. Water ≈ 35 ml/kg → **≈ 3 L/day**
- All of these update when you edit your profile or log a new weight.

## Privacy & data storage
- Measurements, workouts, meals and settings: `localStorage` (key `wbc:v1`).
- Photos: `IndexedDB` database `wbc-photos`, as on-device Blobs. They are **never** uploaded.
- A strict Content-Security-Policy (`default-src 'self'`) blocks the app from loading or sending anything to other origins.
- Backup files can contain your photos. Keep them private and **never commit them to a repository**. `.gitignore` already excludes `wassim-body-coach-*.json` and image files.
- Data is stored per browser and per device. Clearing site data in the browser deletes it, so export a backup regularly.

## Tech
Plain HTML + CSS + vanilla JavaScript ES modules. No framework, no build step, no dependencies.

```
index.html              app shell
css/styles.css          mobile-first, RTL-aware (logical properties), light + dark
js/app.js               router + all screens
js/i18n.js              Arabic / French strings, number & date formatting
js/calc.js              pure calculations (BMI, BMR, targets, weekly stats…)
js/data.js              exercises, schedule, meal plans, shopping list
js/store.js             localStorage + IndexedDB (photos)
js/chart.js             tiny SVG charts
sw.js                   service worker (offline)
manifest.webmanifest    PWA manifest
icons/                  app icons
tests/                  unit + end-to-end tests
```

## Run locally
Any static file server works, for example:
```bash
python3 -m http.server 8080     # or: npm start
# open http://localhost:8080
```
(Service workers need `http://localhost` or HTTPS. Opening `index.html` as a file works without offline support.)

## Tests
```bash
npm test            # unit tests (Node ≥ 18, no install needed)
npm run test:e2e    # end-to-end in Chromium; needs Playwright (npm i -D playwright && npx playwright install chromium)
```
The end-to-end test goes through every screen in both languages. It checks set logging and timers, meal check-off, measurement validation, all three charts and their tooltips, photo upload/compare/delete in IndexedDB, backup export/import, data wipe, the manifest, offline mode through the service worker, **no third-party network requests**, and no console errors.

## Deploy for free on GitHub Pages (only when you decide to)
Nothing has been deployed. When you're ready:

1. Merge the pull request into `main`.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
5. After a minute or two the app is live at `https://<your-username>.github.io/wassim-body-coach/`.
6. Open that link on your phone:
   - **Android (Chrome):** menu ⋮ → *Install app* (or use the button in Settings).
   - **iPhone (Safari):** Share → *Add to Home Screen*.

Notes:
- GitHub Pages is free for **public** repositories. On a free account, Pages for a private repository needs a paid plan, so the repo would have to be public. Only the app code is published: your measurements and photos live on your phone, never in the repo.
- All paths are relative, so the app works under the `/wassim-body-coach/` sub-path without any changes.
- After you update the app, bump `CACHE` in `sw.js` (for example `wbc-v2`) so phones pick up the new version.

## License
MIT. Personal project.
