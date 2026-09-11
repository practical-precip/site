# Precipitation downscaling guidance

A configurable guidance matrix and catalog of downscaled precipitation products. The [hosted site](https://cameronbracken.github.io/pcef_workshop_site_mockup/) provides application guidance, regional selection, paper findings, and product metadata. Scientific guidance remains provisional unless explicitly marked as expert reviewed.

## Contribute content

See [CONTRIBUTING.md](CONTRIBUTING.md) for editing a box, adding papers, configuring rows and columns, creating regional guidance, and adding products through a pull request.

| Editable content | Location |
| --- | --- |
| Table dimensions and order | [content/table.yaml](content/table.yaml) |
| Application row metadata | [content/rows/](content/rows/) |
| One Markdown document for each box | [content/cells/](content/cells/) |
| Climate region configuration | [content/regions.yaml](content/regions.yaml) |
| Paper metadata | [content/papers.yaml](content/papers.yaml) |
| Product catalog order | [content/catalog.yaml](content/catalog.yaml) |
| Detailed product metadata | [content/products/](content/products/) |
| Product recommendations and expert prose | [content/product-guidance/](content/product-guidance/) |

Markdown supports prose, lists, tables, images, and LaTeX equations. YAML headers hold review status and structured evidence. Regional files replace a complete box document; otherwise the general document remains visible. Product entries identify the release or publication described and do not imply blanket recommendations.

## Local development

Use Node.js 22.13 or newer. From this directory:

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. The development server watches Markdown, YAML, and public assets, rebuilds valid content, and reloads the preview. Invalid edits produce a terminal error and retain the last valid preview until corrected. TypeScript and style changes use the normal development reload.

## Checks and Pages build

```sh
npm run content:check
npm run test:content
npm run build:pages
npm run check:export
npm run lint
```

`build:pages` compiles the content and creates `docs/` with `/pcef_workshop_site_mockup` as its URL prefix. `npm run build` creates an export at the root URL instead. The JSON under `app/generated/` is ignored and regenerated from content. The checked-in `docs/` is generated too; do not edit it directly.

The existing GitHub Pages configuration publishes `main` at `/docs`. A published update therefore requires a rebuilt `docs/` in the commit. Pull requests run content validation, compiler tests, and a full Pages build. They provide a downloadable build artifact without publishing it. Source-only contributions are welcome; the maintainer prepares the matching export before merging.

With a local development server running, `node --experimental-strip-types scripts/check_routes.mjs` checks routes and assets. Browser checks in `scripts/check_regions_browser.mjs` require Playwright and a browser. Configure `PRECIP_SITE_URL`, `PLAYWRIGHT_MODULE`, and `PLAYWRIGHT_EXECUTABLE` for the environment. See [VALIDATION.md](VALIDATION.md) for observed checks and limitations.

## Figures and provenance

Existing application figures use deterministic synthetic examples. Their source is `scripts/make_figures.py`. To regenerate them with the locked Pixi environment:

```sh
pixi install
pixi run figures
```

Figures, captions, and provenance are configured in the row metadata. New rows do not require figures. Scientific claims belong with paper references and scope, not in an illustrative caption. [MAP-SOURCES.md](MAP-SOURCES.md) documents the state map and license.

## Development transcript

The [September 11 session transcript](notes/2026-09-11-session-transcript.md) records the earlier regional filtering, wording revisions, and repository rename and publication. The later Markdown metadata and product catalog work is described in [CONTRIBUTING.md](CONTRIBUTING.md).

The product catalog includes 12 documented archives and variants. See the
[NCAR source review](notes/2026-09-11-catalog-sources.md) for source revisions,
additional web research, unresolved evaluation labels, and version distinctions.
