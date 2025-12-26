# osrsloginscreen


[![GitHub Actions](https://github.com/jonnyt123/osrsloginscreen/actions/workflows/build-theme.yml/badge.svg)](https://github.com/jonnyt123/osrsloginscreen/actions/workflows/build-theme.yml)
[![Project Board](https://img.shields.io/badge/Project-Board-blue)](https://github.com/users/jonnyt123/projects/1)

## Old School Login Screen — Static Demo

Small static login-screen demo (HTML/CSS/JS) intended to run directly in the browser.

Quick start
- Open the main UI in your browser: `file-qfr.html` (double-click or from macOS Terminal: `open file-qfr.html`).
- Edit `file-lvh.js` and refresh the page to test behavior changes.

Files
- `file-qfr.html` — main markup (form with `id="loginForm"`, inputs `id="username"` / `id="password`).
- `file-mva.css` — styling and background image (external asset URL; verify licensing before swapping).
- `file-lvh.js` — form submit handling and example login flows (see Simulation section).
- `file-ugc.html` — audio element example (`id="backgroundAudio").

Simulation mode (local testing)
- The demo supports a simulation toggle via URL query. Open the page with `?simulate=1` or `?simulate=true` to enable simulated responses (no backend required).
- Behavior: simulated login waits ~600ms then succeeds for any username except the literal `fail` (which simulates failure). On success the script shows a visual success message and redirects to `/` after ~700ms.

Example fetch / backend wiring
- `file-lvh.js` contains a sample `fetch()` POST to `/api/login`. Replace that URL with your backend endpoint. The example sends JSON `{ username, password }` and expects an HTTP 200 for success.

Editing & debugging tips
- Prefer non-blocking messages: edit or use the inline `#loginMessage` element (already appended by the example) instead of `alert()`.
- Use `console.log()` and DevTools for inspection; open DevTools Console to view errors.
- To test audio, add a valid audio file path in `file-ugc.html` and control playback via `document.getElementById('backgroundAudio').play()`.

Project conventions
- Filenames intentionally start with `file-` (e.g., `file-qfr.html`). Preserve these names for minimal edits.
- Keep changes small and focused — one UI or behavior change per PR.
- Avoid introducing bundlers or package managers unless requested; this project is meant to run without a build step.

Contributing / PR notes
- Document behavior changes in the PR description (why a change is required and how to test it locally).
- If adding external libraries, add a short justification and usage example to the PR.

Pull request checklist
- [ ] Describe the change and why it is needed in the PR summary.
- [ ] Include steps to test locally in the PR body.
- [ ] Confirm any added assets have a compatible license and note them in the PR.
- [ ] Ensure CI workflow passes (where applicable).

If you'd like, I can:
- Add a short test harness that simulates backend responses programmatically.
- Expand the README with quick Terminal commands for macOS and Linux.
- Add a development checklist for PR reviewers.

Build & run the React theme
- Build the React app inside `osrs-web-greeter-theme-main`, copy its `build/` output into `theme-build/`, and serve it locally:

```bash
# install theme deps (run once)
npm run theme:install

# build the theme and copy build output to ./theme-build
npm run theme:build

# Serve the built theme on port 8001
npm run theme:serve
# then open http://localhost:8001 in your browser
```

Theme install/env flags
- `INSTALL_PREFIX` (default: `/usr/local/share/web-greeter/themes/osrs`): where the built assets are installed by `build.sh`.
- `SKIP_INSTALL=1`: run the build and rewrite paths, but leave artifacts in `./build` without installing.
- `USE_SUDO=0`: run the install step without sudo (useful if `INSTALL_PREFIX` is already writable).

- To run the React app in development mode (hot-reload), run inside the theme directory:

```bash
cd osrs-web-greeter-theme-main
npm start
# opens at http://localhost:3000
```

Ported UI features into static demo
- The following React components have been ported into the static demo (`file-qfr.html` + `file-lvh.js`):
  - Runes animation (canvas): ported from `LoginScreenRunes.tsx` and now loads sprites from `assets/sprites/` (assets copied into the repo for a self-contained demo).
  - Progress bar: ported from `ProgressBar.tsx`; visible during login and simulated flows as an inline progress UI.
  - Session selector: ported from `SessionSelect.tsx` as a small button that cycles sessions.

Notes:
- These features run without building the React app; the assets used by the static demo have been copied into `assets/` so the demo is self-contained and portable.

Local server & terminal commands
Use any of these to run or open the demo locally. Commands assume you're in the repository root (`/Users/jonny/Downloads/osrsloginscreen`).

- Open directly (macOS):

```bash
open file-qfr.html
```

- Open directly (Linux):

```bash
xdg-open file-qfr.html
```

- Start a simple HTTP server (Python 3) and open in browser:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/file-qfr.html in your browser
```

- Start a quick PHP server (if PHP is installed):

```bash
php -S localhost:8000
# then open http://localhost:8000/file-qfr.html
```

- Test simulation mode via URL (no backend):

```bash
# Direct file open with simulate flag (macOS)
open "file-qfr.html?simulate=1"

# With a local server, open:
http://localhost:8000/file-qfr.html?simulate=1
```

Notes
- Prefer the HTTP server approach if you plan to use `fetch()` (served pages avoid CORS/`file://` limitations).
- Use DevTools Console to view `console.log()` output and network requests when debugging.

Run script
- A convenience script `run.sh` is provided to start a local server and open the demo in your browser.

```bash
chmod +x run.sh
./run.sh           # serve and open http://localhost:8000/file-qfr.html
./run.sh --simulate  # open with ?simulate=1 to enable simulated responses
```

NPM alternative
- A minimal `package.json` is included to provide an npm-based alternative using `http-server` via `npx`.
- To use the npm script (no global install required):

```bash
# from repository root
npm run start
# then open http://localhost:8000/file-qfr.html

# to enable simulation (opens browser automatically using run.sh):
npm run start:simulate
```

If you'd prefer a global install:

```bash
npm install -g http-server
http-server -p 8000
# open http://localhost:8000/file-qfr.html
```

Windows / PowerShell
- A PowerShell helper `run.ps1` is provided for Windows. Run from PowerShell:

```powershell
./run.ps1             # serve at http://localhost:8000/file-qfr.html
./run.ps1 -Simulate   # serve and open with ?simulate=1
./run.ps1 -Port 9000  # custom port
```

`run.ps1` follows the same server-fallback logic as the shell script and offers to install `http-server` via `npm` if `npx`/`python` are not available.
