# Copilot / AI Agent Instructions

This repository is a small static login-screen demo using plain HTML/CSS/JS. The guidance below helps AI coding agents be immediately productive when editing or extending this codebase.

## Big picture
- Single-page static UI: the primary files are `file-qfr.html` (HTML), `file-mva.css` (styles), and `file-lvh.js` (JS behavior). There is also `file-ugc.html` containing an audio element.
- No build system, package manager, or server—changes are tested by opening the HTML files in a browser.

## Key components & data flow
- `file-qfr.html`: main markup. The login form has `id="loginForm"`, inputs with `id="username"` and `id="password"`.
- `file-lvh.js`: attaches `submit` handler to `#loginForm`, prevents default submit, reads `#username` and `#password`, and currently shows `alert()` messages. Modify here to implement real authentication flows or to call an API.
- `file-mva.css`: global styles and the `.login-box` UI. Background image is loaded from an external URL; changing layout or theme should be done here.

## Project-specific conventions
- Files are named with `file-*.ext`—preserve existing filenames when making minimal changes unless user requests rename.
- Keep behavior unobtrusive: JavaScript targets elements by `id` and uses a single `submit` handler style rather than frameworks.
- Avoid adding bundlers or package managers unless requested—this repo is intended to work directly in the browser.

## How to test and debug locally
- Open `file-qfr.html` in a browser (double-click or `open file-qfr.html` on macOS). Use DevTools console to view `console.log` output and inspect DOM.
- To quickly test JS changes, edit `file-lvh.js` and refresh the page. For non-blocking debug, prefer `console.log()` over `alert()`.

## Common change patterns (examples)
- Client-side validation: update `file-lvh.js` to validate `username` before success. Pattern: read `document.getElementById('username').value`, validate, then add or update an inline error element inside `.login-box`.
- Replace `alert('Login successful!')` with a redirect, visual success state, or an API call via `fetch()`.
- Audio control: `file-ugc.html` provides an `audio` element with `id="backgroundAudio"` — control via `document.getElementById('backgroundAudio').play()`.

### Included example change
- `file-lvh.js` now contains an example `fetch()`-based login flow that:
	- Appends an inline `#loginMessage` element inside `.login-box` for non-blocking messages.
	- Sends a `POST` to `/api/login` with `{ username, password }` (replace with your backend URL).
	- Uses visual colors for status (white=busy, green=success, red=error) and redirects on success.
	- Keeps UI minimal: disables the submit button while the request runs.

Use this example as a starting point when wiring to a real backend; adjust error handling and redirect targets as needed.

## Simulation mode (local testing)
- For local development without a backend, `file-lvh.js` includes a `SIMULATE_LOGIN` toggle near the top. Set `SIMULATE_LOGIN = true` to enable simulated responses.
- Behavior: simulated login waits ~600ms, then succeeds for any username except the literal `fail` (which simulates a failed login). On success it shows the green message and redirects to `/` after 700ms.
- To adapt: change the simulated logic (for example, check for `username === 'demo' && password === 'demo'`) or replace the toggle with a URL query switch for more flexible testing.

## Simulation mode (local testing)
- The repo supports a simulation mode for development without a backend. Enable by opening `file-qfr.html` with the `simulate` query parameter, for example: `file-qfr.html?simulate=1` or `file-qfr.html?simulate=true`.
- Default behavior: simulation is OFF unless `?simulate` is present. When enabled, the script waits ~600ms then succeeds for any username except the literal `fail`, which simulates a failure. On success it redirects to `/` after 700ms.
- To adapt: change the simulated logic in `file-lvh.js` (look for `SIMULATE_LOGIN`), or modify detection to use a different query name.

## Integration points & external dependencies
- Assets: the demo includes **fonts, sprites, backgrounds, and audio** in the `assets/` folder so the static demo is self-contained; verify licensing before changing or redistributing assets.
- There are no declared package dependencies. If introducing libraries, include a short note in the PR explaining why.

## PR / Code style expectations
- Keep PRs small and focused (one behavior or UI change per PR).
- Use plain DOM APIs and minimal footprints; document any cross-file changes in the PR description.

## Files to inspect for context
- `file-qfr.html` — structure and form markup
- `file-lvh.js` — form submit handling (primary behavioral file)
- `file-mva.css` — layout, colors, background image
- `file-ugc.html` — audio element example

---
If you'd like this file expanded (for example, adding test instructions, a dev server, or a migration path to a bundler), tell me which direction and I'll update it.
