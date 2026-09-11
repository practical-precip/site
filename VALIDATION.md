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
