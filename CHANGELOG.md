# Changelog

## Unreleased

### Added
- Bundle demo assets into `assets/` (fonts, sprites, backgrounds, components, audio) and update static demo to use local asset paths. This makes the demo self-contained and easier to test locally.

How to test locally:
1. Start a local server: `python3 -m http.server 8000`
2. Open `http://localhost:8000/file-qfr.html`
3. Verify runes sprites, backgrounds, music toggle, and `?simulate=1` behave as expected.

Notes:
- Verify asset licensing before publishing or distributing.
