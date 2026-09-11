# GitHub Pages preparation

Checked on 2026-09-11:

- `npm run build:pages`: Next.js compiled, type checked, and exported all application routes.
- `npm run check:export`: passed for 30 cells, all application anchors, 214 local links/assets, social metadata, and the 404 page.
- Export checks confirmed that served text assets contain no private hosting domain or project identifiers.
- Independent source review found no concrete migration issue in links, assets, metadata, or static route configuration.
- `npm install`: zero known vulnerabilities reported.
- Local Next.js development server: route checks passed for 22 routes/assets, 30 controls, all guidance anchors, metadata, downloads, and unknown-topic 404.
- Authored-source whitespace checks passed. Generated upstream JavaScript contains whitespace diagnostics and was retained as built.

The repository is a fresh snapshot. Previous hosting configuration, Git history, and local deployment receipts were not copied.

Browser interaction and visual regression testing have not been performed for this export. The scientific guidance remains provisional and the figures remain synthetic illustrations.

## Regional guidance update, September 11, 2026

- Production Pages build and TypeScript compilation passed.
- Export checks passed: 30 matrix cells, application section anchors, 219 local links/assets, metadata, and 404 page.
- ESLint passed with one existing warning for the unoptimized illustrative figure `<img>`.
- `scripts/check_regions.mjs` passed: region IDs and state membership, valid geometry for 50 states plus DC, partial regional overrides, priority overrides, empty and missing entries, general fallback, and invalid selection handling.
- `scripts/check_regions_browser.mjs` passed against the Pages export at its repository prefix: dropdown/map synchronization, Enter and Space selection, regional popup and detail text, URL propagation and reload, combined application/region filters, reset, unknown region fallback, and no JavaScript errors.
- Desktop (1440 pixels) and mobile (390 pixels) screenshots were inspected. The page has no horizontal overflow on mobile; the matrix retains its intended horizontal scrolling.
- Browser checks used a temporary Chromium headless shell with Playwright after the in-app browser plugin and an older cached browser could not start. `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE` allow these local paths to be configured. Browser binaries were not added to the project.
- Regional content remains provisional. Four regional examples are supplied for annual precipitation spatial resolution. Remaining cells inherit general guidance.
- Local changes only. No commit, push, or deployment was performed.

## Repository name correction, September 11, 2026

Renamed the project to `pcef_workshop_site_mockup`. Updated package metadata, documentation, the Pages build prefix, published metadata origin, and route/browser checks. Regenerated `docs/` from source. Build, export validation, regional data tests, and browser checks passed with the corrected prefix. ESLint reports no errors and the existing figure image warning. The previous repository name is absent from source and the generated export.
