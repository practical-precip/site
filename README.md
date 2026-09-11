# Precip: precipitation downscaling field guide

A technical cheatsheet organized by application needs and downscaled product properties. The main page has a 5-by-6 matrix. Each cell opens a summary and links to a section of an application guide with evaluation checks, literature, and an illustrative figure.

[Hosted site](https://cameronbracken.github.io/pcef_workshop_site_mockup/) (public, no sign-in required).

## Run locally for development

Requirements: Node.js 22.13 or newer and npm. Pixi is only needed to regenerate figures. Existing figures are included, so ordinary content and layout edits need only Node.js.

From the workshop directory:

```sh
cd pcef_workshop_site_mockup
npm ci
npm run dev
```

If your terminal is already in this repository, omit `cd pcef_workshop_site_mockup`. All commands below run from the directory containing `package.json`.

Open the local URL printed by the server, normally `http://localhost:3000`. Leave the terminal running while developing. Save a file to update the preview, and use `Ctrl+C` to stop the server. Restart the server after changing environment variables or if page metadata does not refresh.

Run `npm ci` on first setup and after pulling dependency changes. The site uses React, TypeScript, Next.js, and Tailwind CSS. It needs no API key, database, or sign-in. GitHub Pages serves the exported HTML, JavaScript, and assets.

To export static files for a local web server:

```sh
npm run build
python3 -m http.server 3000 --directory out
```

Stop the development server first if it occupies the same port. Use `npm run dev` for the normal edit-and-preview workflow.

## Where content lives

| File | What to edit |
| --- | --- |
| [app/data.ts](app/data.ts) | Application rows, product-property columns, priority labels, cell summaries, evaluation checks, and linked source IDs |
| [app/sources.ts](app/sources.ts) | Reference metadata, source links, supporting findings, and limits |
| [app/figure-notes.ts](app/figure-notes.ts) | Figure headings, captions, and accessible descriptions |
| [app/guidance/[topic]/page.tsx](app/guidance/%5Btopic%5D/page.tsx) | Shared template for all application guides |
| [app/ui/matrix.tsx](app/ui/matrix.tsx) | Matrix, application filter, popups, header, and footer |
| [app/reading-room/page.tsx](app/reading-room/page.tsx) | Reading room layout |
| [app/about/page.tsx](app/about/page.tsx) | Scope, evidence status, and explanation of the matrix |
| [app/globals.css](app/globals.css) | Colors, typography, layout, and responsive styles |
| [app/layout.tsx](app/layout.tsx) | Site title, description, and social metadata |

Content in the TypeScript data files is plain text. Markdown in those strings is not rendered as formatted prose. Use JSX in the page template, or extend the data structure and its renderer, when adding formatted sections.

## Edit an existing guidance cell

Find the application in the `topics` array in `app/data.ts`. Its `cells` array follows this exact column order:

1. Spatial resolution (`spatial`)
2. Temporal resolution (`temporal`)
3. GCM ensemble size (`models`)
4. Internal variability (`members`)
5. Geographic domain (`domain`)
6. Temporal coverage (`coverage`)

Each `c(...)` call supplies four values:

```ts
c(
  "essential",
  "Match the duration",
  "Daily data cannot directly supply hourly extremes.",
  "Check accumulation windows and timestamp conventions.",
)
```

The arguments are the priority, short title, summary, and practical evaluation check. Editing them updates both the popup and its section on the application page.

Available priorities are `essential`, `context`, and `lower`. They describe the priority of an evaluation check, not whether a product passes it.

The topic's `intro` introduces the application, `metrics` lists suggested diagnostics, and `sourceIds` selects supporting literature. References currently attach to the whole application guide, not individual cells. For longer application-specific explanations, add fields to the `Topic` or `Cell` type and render them in the shared guidance template.

Keep IDs stable because they form links such as:

```text
/guidance/annual-maximum#temporal
```

## Add supporting literature

1. Add a uniquely named entry to `sources` in `app/sources.ts`. Copy an existing entry as a template.
2. Supply `authors`, `year`, `title`, `journal`, `url`, `doi`, `support`, and `scope`. Store the DOI as an identifier such as `10.5194/esd-11-491-2020`, without the `https://doi.org/` prefix.
3. Add the entry's key to the relevant topic's `sourceIds` array in `app/data.ts`.
4. Check the application page and reading room. The reading room lists every source automatically, with links to applications that cite it.

Use `support` for the finding relevant to the guidance and `scope` for its limits. Verify the source link and claim. A misspelled source ID can break rendering, so copy the key exactly.

## Add an application row or product-property column

To add an application, copy a complete topic in `app/data.ts` and give it a unique URL-safe `id`. Fill in its title, short label, use, introduction, metrics, source IDs, and one cell for every column in the same order.

Also add:

- A matching entry in `app/figure-notes.ts`, keyed by the new topic ID, with `title`, `alt`, and `caption`.
- `public/figures/<topic-id>.png` and `.pdf`, plus the code and data needed to regenerate them.

The matrix, filter, application route, and navigation links use the topic list automatically. The guide template expects a figure-note entry and PNG for every topic. The route checker also expects its PDF.

To add a column, add its `id`, `title`, `subtitle`, and `definition` to `columns`, then insert a corresponding cell at the same position in every topic. Reordering columns requires reordering every topic's cells. Check table readability at desktop and mobile widths.

After changing the matrix dimensions, update the hardcoded 30-button assertion and summary in `scripts/check_routes.mjs` (the export checker derives its expected count from the data), and revise any prose that states the number of applications or cells.

## Add or regenerate figures

The current figures are deterministic synthetic examples, not observations or product benchmarks. Their generation code is [scripts/make_figures.py](scripts/make_figures.py).

```sh
pixi install
pixi run figures
```

The task writes PNG and PDF files, `examples.json`, and a downloadable copy of the plotting script into `public/figures/`. Edit the source script under `scripts/`, not its generated copy under `public/figures/`. Include generated outputs when saving a figure change, and update the caption and alt text in `app/figure-notes.ts`.

The template currently links every figure to the shared example data and script. If adding empirical figures or separate datasets, update those links and the synthetic-example labels in the template to match the actual provenance. Record product versions, inputs, methods, and reuse permissions where applicable.

Inspect each rendered figure for readable labels, units, clipping, and agreement with its caption. The existing plotting environment is locked for macOS ARM, Linux, and Windows; only macOS execution has been checked. The social card at `public/og.png` is AI-generated and is separate from the scientific figures.

## Check changes

For content or code changes:

```sh
npx tsc --noEmit
npm run build
```

With the development server running, use a second terminal to check routes and assets:

```sh
node --experimental-strip-types scripts/check_routes.mjs
```

This checks matrix button count, section anchors, application metadata, figure downloads, and the unknown-topic 404. It does not click popups or test browser interaction. In the browser, check the application filter, popup open/close behavior, keyboard navigation, detail links, and layout at a narrow width.

The checker defaults to `http://localhost:3000`. For a different local address:

```sh
env PRECIP_SITE_URL=http://localhost:3001 node --experimental-strip-types scripts/check_routes.mjs
```

`app/site-paths.ts` defines the published URL and prefixes plain asset URLs with `NEXT_PUBLIC_BASE_PATH`. The Pages build sets that prefix automatically. If changing the published address, update the Next.js base path, metadata URL, and checker expectations together.

For changes to the plotting script:

```sh
pixi run ruff check scripts/make_figures.py
pixi run ruff format scripts/make_figures.py
pixi run figures
```

For the GitHub Pages export, run `npm run build:pages` followed by `npm run check:export`. The export checker validates links and assets under the repository URL prefix.

## Publish updates to GitHub Pages

GitHub Pages serves the committed `docs/` directory on `main`. Build and check it before publishing:

```sh
npm run build:pages
npm run check:export
git add app public scripts docs README.md package.json package-lock.json next.config.ts
git commit -S -m "Update workshop guidance"
git push origin main
```

The Pages build uses `/pcef_workshop_site_mockup` as the URL prefix and adds `.nojekyll` so GitHub serves the exported assets unchanged. `npm run dev` serves the same site locally at the root path. Never hand-edit `docs/`; regenerate it from source. Pushing rebuilt files on `main` triggers GitHub's Pages deployment.

This repository contains a fresh source snapshot and no history or configuration from the earlier private hosting service. Local edits do not change the public site until rebuilt and pushed.

Keep guidance marked provisional until it has supporting evidence and review. Product-specific recommendations should identify the product version, region, evaluation period, metric, and uncertainty.

## Configure regions and regional guidance

Edit `app/regions.ts` to change region names, order, state membership, map abbreviations, or label positions. Both the map and dropdown are generated from this list. IDs are stable content and URL keys. State membership uses two-digit FIPS codes from `app/us-states.json`. The default map covers the 50 states and DC. See [MAP-SOURCES.md](MAP-SOURCES.md) for geography and licensing.

Each cell accepts an optional fifth argument to `c(...)`:

```ts
c(
  "context",
  "Catchment spatial support",
  "General summary for all regions.",
  "General evaluation check.",
  {
    northwest: {
      title: "Evaluate terrain and basin totals",
      check: "Compare coastal, mountain, and inland catchments separately.",
    },
  },
)
```

A regional entry can override `title`, `summary`, `check`, and `priority` independently. Omitted fields inherit the general entry. Omit `regions` entirely for general guidance. Selecting a region updates matrix boxes, summaries, and application guidance. Boxes without an entry remain visible and are labeled as general guidance. The application dropdown works alongside the region selector.

The selection is stored in `?region=northwest` and carried through internal links, including section anchors. Unknown region IDs display general guidance. Reset removes the region parameter. Regions can be selected using the mouse, dropdown, or Tab followed by Enter or Space on the map.

The seeded regional checks are provisional examples for four regions in the annual precipitation spatial-resolution cell. Add reviewed regional evidence before treating them as regional recommendations.

Run the regional data checks with `node --experimental-strip-types scripts/check_regions.mjs`. The browser check in `scripts/check_regions_browser.mjs` requires Playwright, a local browser installation, and a running site. Set `PLAYWRIGHT_MODULE` to the Playwright module path if it is not installed in the project, and `PRECIP_SITE_URL` to the local site URL, including the repository prefix when checking the Pages export.

## Development transcript

The [September 11 session transcript](notes/2026-09-11-session-transcript.md) records the conversation and implementation steps for regional filtering, wording revisions, and the repository rename and publication.
