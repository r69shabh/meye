# Meye — Personal Productivity: To-do, Calendar, Notes

> A fast, offline-first personal productivity PWA: natural-language capture for **to-dos, calendar events, notes, and workout routines**, with voice input, reminders, stats/heatmap, and optional GitHub Gist + Google Calendar sync.
>
> Live: **https://meyee.vercel.app** · Repo: **https://github.com/r69shabh/meye**

![JS](https://img.shields.io/badge/stack-vanilla%20JS%20%2B%20Vite-black) ![PWA](https://img.shields.io/badge/PWA-offline%20ready-blue) ![Tests](https://img.shields.io/badge/tests-vitest%20%2B%20playwright-green) [![Playwright](https://github.com/r69shabh/meye/actions/workflows/playwright.yml/badge.svg)](https://github.com/r69shabh/meye/actions/workflows/playwright.yml)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Natural-Language Examples](#natural-language-examples)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Data Model & Storage](#data-model--storage)
- [API / Serverless Backend](#api--serverless-backend)
- [PWA / Offline](#pwa--offline)
- [Native Packaging](#native-packaging-capacitor--tauri-notes)
- [Testing & QA](#testing--qa)
- [Releases & Packages](#releases--packages)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Licenses & Attribution](#licenses--attribution)
- [Privacy & Terms](#privacy--terms)

---

## Features

**Capture**

- One-tap bottom input pill → composer sheet with `Auto / Note / To-do / Event / Routine` chips
- Natural-language parser (`SmartParser` in `main.js`): dates, times, ranges, repeats, locations/platforms, sets x reps
- Voice input with interim results + editable review step (`VoiceRecorder`)
- Multilingual speech recognition setting (`meyePrefsV2.speechLang`)

**Organize**

- Date strip + card feed grouped by day; expandable cards, sub-items, tags, meta (time, location, sets)
- Routines with exercise auto-split: `leg day: squats 3x12 lunges 3x15` → two sub-items
- Exercise artwork thumbnails matched locally via `exerciseMatch.js` + `@bryllim/workout-guide` catalog (302 exercises in `public/workouts/`)
- Reminders / notifications (`NotificationEngine` + `NotificationManager`), configurable sound + banner style + default lead time

**Track**

- Stats + heatmap (`StatsManager`, `HeatmapView`), onboarding tour (`TourManager`), settings with appearance/accent

**Sync (optional)**

- GitHub Gist backup/sync via OAuth → serverless token exchange (`api/github-auth.js`)
- Google Calendar fetch + push (handles deletions and multi-day events)
- JSON export/import; auto-backup toggle

**Platform**

- Installable PWA (`public/manifest.json` + `public/sw.js`), mobile-first CSS, Capacitor deps for Android speech/secure-storage/OAuth, Electron deep-link intercept stub

---

## Quick Start

**Prerequisites:** Node 18+ (required for `vite`, `vitest`, `playwright`). No `vite.config.*` is checked in — Vite defaults are used (`index.html` at root, dev on `http://localhost:5173`).

```sh
git clone https://github.com/r69shabh/meye
cd meye
npm install          # also provides @bryllim/workout-guide assets
npm run predev       # copy/downscale workout artwork to public/workouts (macOS sips to 160px, else raw copy)
npm run dev          # -> http://localhost:5173
```

**Build / preview:**

```sh
npm run prebuild     # same artwork copy step
npm run build        # -> dist/
npm run preview
```

Deploy `dist/` anywhere static, **plus** deploy `api/github-auth.js` as a serverless function (Vercel layout is assumed) for GitHub OAuth to work. The frontend hard-codes `https://meyee.vercel.app/api/github-auth` as the OAuth endpoint (see Configuration).

---

## Usage

1. Tap **What's on your mind...** → composer opens.
2. Type or dictate via microphone. Pick a type chip or leave on **Auto**.
3. Press **Add**. The card appears on the right date with time/location/tags parsed out.
4. Open a card to expand: check sub-items, edit, reschedule, delete.
5. Open Settings to link GitHub / Google Calendar, change appearance, speech language, reminder defaults, export backup.
6. Open the heatmap icon for activity history.

Happy-path E2E is covered in `tests/meye.spec.ts`.

---

## Natural-Language Examples

Parsed by `SmartParser.parse()` (see `tests/unit/nlp.test.js` + `test_nlp.cjs`):

| You type / say | Result |
|---|---|
| `remind me to buy grocery at 8pm` | todo `Buy grocery` at 20:00 today |
| `um so like remind me to call mom tomorrow at 5pm` | filler-tolerant todo `Call mom` tomorrow at 17:00 |
| `yoga class tomorrow at 6` | explicit date/time wins → **todo**, not routine, at 18:00 |
| `take meds at 8 every day` | routine `Take meds` daily at 20:00 |
| `wake up at 7` | morning cue → 07:00 (not 19:00) |
| `gym` / `idea for a new app` | routine `Gym` / note `Idea for a new app` |
| `every day leg day: squats 3x12 lunges 3x15` | routine with `Squats 3x12`, `Lunges 3x15` |
| `push day: bench press 4x8 incline press 3x10 tricep dips 12` | 3 sub-items, modifier-aware split |
| `add milk to grocery list` | `add...` → todo |
| `meeting with Ana tomorrow from 2 to 3pm on zoom` | calendar event with range + platform |
| `push ups 3x12` | exercise match + thumbnail `/workouts/push-up/frame-1.png` |

Exercise matching (`exerciseMatch.js`) is alias/plural/unit tolerant: `Squats→squat`, `Burpees→burpee`, `Curls→bicep-curl`, `Situps→decline-sit-up`, `Plank 60 sec→plank`; returns `null` for non-exercises (`Walk the dog`, `Meditate`).

## Configuration

**GitHub OAuth (required for Gist sync):**

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Set env on your serverless host: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
3. The frontend posts `{ code }` to `https://meyee.vercel.app/api/github-auth` (`SyncManager.exchangeCodeForToken` in `main.js`). For a fork/self-host, update:
   - `main.js` → `SyncManager.exchangeCodeForToken` fetch URL
   - `PlatformBridge.js` → `Platform.Auth.authorizeGitHub` `authUrl`
   - `api/github-auth.js` → production redirect `https://meyee.vercel.app/?code=...`

**Google Calendar (required for calendar sync):**

- Web flow uses Google Identity Services (`accounts.google.com/gsi/client` in `index.html`). The Google Client ID is resolved in `PlatformBridge.js` (`Platform.Auth.authorizeGoogle`) — set your own client ID + authorized redirect (`https://meyee.vercel.app/` in the macOS stub) before release.
- Scopes cover calendar read/write used by `SyncManager.fetchGoogleEvents` / `pushToGoogleCalendar`.

> Do not ship client secrets in the frontend or packaged app — keep them in serverless env only (per `APP_BUILD.md`).

---

## Project Structure

```
.
├── index.html              # App shell, composer/settings/heatmap overlays, GSI + iconify + FA
├── main.js                 # ~3600 lines: parser, views, sync, settings, stats
├── exerciseMatch.js        # Pure exercise matcher vs @bryllim/workout-guide manifest
├── PlatformBridge.js       # Capacitor/Electron/web bridge: speech, OAuth, secure storage
├── style.css               # ~2600 lines mobile-first styles
├── api/
│   └── github-auth.js      # Vercel serverless: OAuth redirect + code-to-token exchange (gist scope)
├── public/
│   ├── manifest.json       # PWA manifest (name meyee, standalone, black theme)
│   ├── sw.js               # Service worker (meye-cache-v7, network-first + offline fallback)
│   ├── icon.png
│   └── workouts/           # 302 exercise folders, frame-*.png (generated via scripts/)
├── scripts/
│   └── copy-workouts.mjs   # Copies artwork from node_modules/@bryllim to public/workouts
├── tests/
│   ├── meye.spec.ts        # Playwright E2E (composer, settings, artwork, speech-lang)
│   └── unit/
│       ├── nlp.test.js     # SmartParser cases (extracted from main.js at test time)
│       └── exerciseMatch.test.js
├── qa/
│   ├── Test_Cases.md       # Smoke/sanity/functional/regression matrix
│   ├── Bug_Reports.md      # Jira-style examples (BUG-101/102)
│   ├── Meye_API.postman_collection.json
│   ├── mock_database_tests.sql
│   ├── selenium_example.py
│   └── mobile/appium.spec.js
├── test_nlp.cjs            # Node scratch harness for SmartParser
├── playwright.config.ts    # E2E: tests/*.spec.ts, chromium+firefox+webkit, dev on :5173
├── vitest.config.js        # Unit: tests/unit/**/*.test.js
├── wdio.conf.js            # Mobile: WebdriverIO + Appium (Chrome on Android emulator)
├── .github/workflows/playwright.yml
├── APP_BUILD.md            # Native-packaging notes (Tauri/Capacitor plan + release checklist)
├── privacy.html terms.html licenses.html
└── package.json            # Package name `meyee`, private, v0.1.0
```

Key modules in `main.js`: `CustomDialog, OverlayManager, NotificationManager, TourManager, SmartParser, Composer, ScheduleSheet, NotificationEngine, SyncManager, SettingsView, StatsManager, HeatmapView, VoiceRecorder, ExpandedCardView` + helpers (`formatDateKey`, `renderCardFeed`, `createCardFromParsed`).

---

## Data Model & Storage

Local-first in `localStorage` (no backend DB):

| Key | Contents |
|---|---|
| `meyeCards` | Cards `{ id, type: note\|todo\|calendar\|routine, content, date, reminderTime/eventTime, subItems[{text,meta,done}], tags, location, platform, ... }` |
| `meyePrefsV2` | Settings `{ appearance, accentColor, calSync, defaultReminder, notifSound, bannerStyle, speechLang, autoBackup, ghToken }` |
| `meyeStatsNew` | Completion stats by activity/day |
| `meyeSyncState` / `meyeGCalToken` | Gist id / tokens (via `Platform.Storage` → secure storage on native, `localStorage` on web) |
| `meyeTourComplete`, `meyeDummyCleared2` | Onboarding flags |

Gist sync payload (`SyncManager.syncToGitHub`): `{ allCards, stats, prefs }`. Backup via `SyncManager.exportJSON / importJSON` + fixtures in `qa/`.

---

## API / Serverless Backend

`POST /api/github-auth` with `{ "code" }` → exchanges code at `https://github.com/login/oauth/access_token` using `GITHUB_CLIENT_ID/SECRET`, returns `{ access_token, ... }`.

`GET /api/github-auth`:

- `?code=...&state=electron:PORT` → `302 http://127.0.0.1:PORT/callback-data?code=...`
- `?code=...&state=android` → `302 meye://oauth-callback?code=...`
- `?code=...` (web) → `302 https://meyee.vercel.app/?code=...`
- no `code` → `302 https://github.com/login/oauth/authorize?client_id=...&scope=gist&state=...`

CORS `*` + `OPTIONS 200`. Other methods → `405`. Missing credentials → `500`, missing code on POST → `400`. Postman collection: `qa/Meye_API.postman_collection.json` (set `{{api_url}}`).

---

## PWA / Offline

- `public/manifest.json`: `short_name meyee`, `display standalone`, icons 192/512 (+maskable).
- `public/sw.js`: `meye-cache-v7`, caches `/` on install, deletes old caches on activate, network-first with cache fallback, `SKIP_WAITING` + `FORCE_RELOAD` update flow, notification-click handling.
- Offline smoke case: create task offline → persists in `localStorage` (`qa/Test_Cases.md` RT_01).

---

## Native Packaging (Capacitor / Tauri notes)

`package.json` includes `@capacitor/{android,browser,cli,core,device,dialog,preferences}`, `@capacitor-community/speech-recognition`, `@byteowls/capacitor-oauth2`, `capacitor-secure-storage-plugin` — consumed by `PlatformBridge.js` (`Platform.OS`: `web | android | macos(Electron UA)`, `Platform.Speech/Auth/Storage`).

`APP_BUILD.md` describes the intended Tauri 2 wrapper (`com.meyee.productivity`, `src-tauri/` — **not currently checked in**) with `desktop:dev/build` + `android:init/dev/build` scripts (**not yet in `package.json` scripts**). Before release you must still:

1. Add Android mic/notification permissions; add macOS mic usage description.
2. Register native OAuth redirect URLs (GitHub + Google) — current flow assumes web redirects + `/api/github-auth`.
3. Bridge reminders to OS-scheduled notifications if they must fire when closed.
4. Sign + notarize (macOS) / sign AAB with release key (Android). Never bundle client secrets.

## Testing & QA

```sh
npm test            # vitest run -> tests/unit/**/*.test.js
npm run test:e2e    # playwright test -> chromium, firefox, webkit (starts npm run dev on :5173)
npm run test:mobile # wdio + appium -> qa/mobile/*.js (needs emulator on :4723, app path in wdio.conf.js)
node test_nlp.cjs   # quick SmartParser smoke without a runner
```

CI: `.github/workflows/playwright.yml` runs Playwright on push/PR to `main|master` (node lts, `npm ci`, browsers with deps, 30-day report artifact).

Manual matrices + bug templates: `qa/Test_Cases.md`, `qa/Bug_Reports.md`. API contract tests: import `qa/Meye_API.postman_collection.json` into Postman.

---

## Releases & Packages

> Status (2026-09-15): this repo has **no GitHub Releases and no git tags yet** (`GET /repos/r69shabh/meye/releases` returns `[]`, `git tag --list` empty). The npm package name is `meyee@0.1.0` with `"private": true` — it is **not published** to npm.

**How to cut the first release:**

```sh
# 1. Version + changelog
npm version 0.1.0   # or major/minor/patch as appropriate
# 2. Tag + push
git push origin main --tags
# 3. GitHub -> Releases -> Draft new release from tag v0.1.0
#    - Web build: attach dist/ zip (npm run build)
#    - Android: attach signed AAB/APK once capacitor/android release is configured
#    - macOS: attach signed + notarized .dmg/.app once Tauri/Electron release is configured
```

Suggested versioning: semver tags `vX.Y.Z`; bump the PWA cache (`meye-cache-v7` in `public/sw.js`) per release so clients pick up the new shell. To publish to npm later, remove `"private": true` and add `files`, `exports`, and provenance.

---

## Roadmap

- [ ] Screenshots + `docs/` tour in README
- [ ] `vite.config.ts` + `vercel.json` checked in (explicit build/output + `api/` routing)
- [ ] First signed tag + GitHub Release with `dist/` + native artifacts
- [ ] Native OAuth deep-links end-to-end (Android `meye://`, macOS loopback)
- [ ] OS-scheduled notifications bridge
- [ ] Import validation + conflict UI for Gist sync
- [ ] i18n for speechLang + UI strings

---

## Contributing

PRs welcome. E2E runs in CI; please add/extend:

- Unit: `tests/unit/*.test.js` for parser/matcher changes
- E2E: `tests/meye.spec.ts` for UI flows
- QA: rows in `qa/Test_Cases.md` for manual coverage

```sh
npm install
npm test
npm run test:e2e
```

---

## Licenses & Attribution

- App code: no `LICENSE` file in repo — add one if you want open-source terms (e.g. MIT). Until then, all rights reserved by the repo owner.
- Exercise images/text: **Bryl Lim / Workout Guide** — [github.com/bryllim/workout-guide](https://github.com/bryllim/workout-guide), **CC BY-SA 4.0** ([creativecommons.org/licenses/by-sa/4.0](https://creativecommons.org/licenses/by-sa/4.0/)). Full attribution in-app: `licenses.html`.
- `@bryllim/workout-guide` package code: MIT. **Capacitor**: MIT. See `licenses.html`, `package-lock.json`.

---

## Privacy & Terms

In-app policies: `privacy.html`, `terms.html` (also linked from Settings → Privacy / Terms). Data stays in `localStorage` on-device unless you enable GitHub Gist or Google Calendar sync, which transmit `{ allCards, stats, prefs }` / event data to those providers.
