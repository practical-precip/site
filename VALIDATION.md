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

## Editable Markdown and product catalog, September 11, 2026

Implemented configurable YAML table/row metadata, 30 general Markdown cell files, four regional Markdown variants, nine bibliography entries, and two product catalog records with separate Markdown guidance. Published findings are distinct from expert interpretation and carry paper keys, locators, and scope. All seeded recommendations remain draft with explicit AI-assisted provenance.

- `npm run content:check`: validates schema, cell mappings, regional references, local images/alt text, equations, citations, and referenced content files.
- `npm run test:content`: 12 tests passed, including reordered dimensions, a new row without a figure, a new column, missing/unknown IDs, invalid priority/review records, malformed equations, unsafe links/HTML, path traversal, and product regional documents.
- `npm run build:pages` and `npm run check:export`: passed for all application and product pages. Export validation checked 30 cells and 316 local links/assets.
- `scripts/check_routes.mjs`: 25 local HTTP routes/assets passed, including all application metadata, section anchors, product routes, and unknown-application 404.
- `scripts/check_regions_browser.mjs`: browser checks passed at the repository URL prefix for regional selection and general fallback, keyboard controls, modal/detail links, reload, application filters, Markdown images, KaTeX equations, paper links, product catalog/details, and mobile overflow. A mobile product screenshot was inspected.
- Live editing was tested with a temporary regional product document and restored afterward. Native file events did not refresh reliably in this workspace, so the development server now polls content/assets and enables Watchpack polling. Automatic update, regional rendering/source links, and restoration to general guidance passed. `scripts/check_content_preview.mjs` preserves this test workflow.
- An independent code review identified ignored product regional overrides and stale content previews. Both were fixed and the reviewer confirmed the revised paths. Browser tests then verified both behaviors.
- ESLint passed with the existing unoptimized application-figure image warning. Markdown images intentionally use static assets with author-supplied paths.
- The PR workflow is configured to validate, test, build, and upload a preview artifact. It has not run on GitHub in this local verification. Existing Pages hosting still requires maintainers to include a regenerated `docs/` before merging source-only contributions.

Initial factual evidence was checked against primary paper abstracts/methods for Lehner et al. (2020), Lange (2019), Bhatia and Ganguly (2019), Jennings et al. (2018), and the VALUE synthesis. Product records cite the original NEX-GDDP-CMIP6 publication and LOCA2 publication/provider release documentation. The catalog identifies version scope rather than asserting that an old paper describes the latest release. LOCA2 reuse terms and file-specific units/calendars remain explicitly unrecorded or require file inspection. No product data were downloaded or benchmarked. Schema validation does not establish scientific correctness or expert endorsement.

## NCAR and web catalog expansion, September 11, 2026

Expanded from two to 12 product records, with 19 bibliography records in total.
Added Alaska GARD-LENS and Northwest WUS-D3 Markdown guidance. The pinned NCAR
README/PDF, provider sources, publication scope, discrepancies, and deferred
candidates are documented in `notes/2026-09-11-catalog-sources.md`.

- `npm run content:check` and all 12 `test:content` tests passed.
- Pages build and TypeScript compilation passed for 23 generated pages.
- Export validation passed for 30 guidance boxes and 563 local links/assets.
- Browser checks passed for all 12 product detail pages, both new regional
  documents and their source links, mobile overflow, and existing guidance/map
  interactions. No browser JavaScript errors were observed.
- The browser check now derives catalog size from configured content and visits
  every product. Its initial regional assertion incorrectly expected a summary
  that the component does not display; it was corrected to check the displayed
  Markdown source link, then rerun successfully.
- ESLint reports zero errors and the existing application figure image warning.
- Focused independent scientific review found no blocking contradictions. Its
  license, climate-sensitivity, and calibration-period suggestions were applied.
- No climate data arrays were downloaded or evaluated. Documentation checks do
  not certify product suitability. Guidance remains draft pending expert review.
- Changes remain local; no commit, push, or deployment was performed for this update.

## Full matrix coverage and metadata fields, September 11, 2026

The catalog now has 31 records representing all 28 NCAR PDF dataset rows, with
20 bibliography records. Coverage is at the family/configuration level, not a
claim that every archive release or member has a separate record. The editable
crosswalk is `notes/ncar-matrix-coverage.yaml`.

The schema and product pages now include all concepts in `dataset_metadata.jpg`,
plus file format, creation date and license. Creation, release and publication
dates are distinct. Unknown dates/counts remain null; unrecorded funding/uses
remain empty arrays with explicit UI messages. `source_scope` distinguishes
matrix transcription from checked provider/paper details.

- Content validation and all 15 content tests passed. New cases check metadata
  dates, positive member counts, required access fields, source URLs, unknown
  values and all 28 source-row mappings. A failing date test exposed AJV's fast
  date mode; full date validation is now enabled and the test passes.
- Pages build and TypeScript compilation passed for 42 generated pages.
- Export validation passed for 30 guidance boxes and 981 local links/assets.
- Browser checks passed for all 31 product pages and regional documents,
  required metadata labels/sections, map/dropdown behavior, Markdown rendering,
  links and mobile overflow. No browser JavaScript errors were observed.
- ESLint reports no errors and one existing application-figure image warning.
- Independent inventory review confirmed 28 rows: 18 statistical, nine dynamical
  and one machine-learning row. It identified 19 missing rows in the earlier
  catalog. All are now represented. Review corrections preserved En-GARD mean
  temperature and STAR-ESDM signal decomposition rather than a method ensemble.
- The contributor guide and session transcript now document the metadata design,
  source reconciliation, uncertainty and contribution workflow.

No climate arrays were downloaded or benchmarked. Matrix-only properties and
unresolved access, license and creation-date fields are identified explicitly.
Recommendations remain drafts awaiting expert review.

## Organization and independent content repositories, September 11, 2026

The site repository moved to `practical-precip`. Guidance and dataset content now
live in the private `practical-precip/guidance` and `practical-precip/datasets`
repositories. Both include online editing instructions for invited contributors,
local PR instructions, templates, source indexes and standalone validation CI.
The website remains public by explicit user choice.

All 53 names in the typed workshop list map through `datasets/names.yaml` to one
or more of 67 records. Original workshop groups remain separate from scientific
dataset types. The original 28 PDF rows remain represented. NIU's WRF-BCC match
is provisional; LOCA2-CA and generic BCSD-CMIP5 await exact identification.
PNNL6 and UW-Mass have separate sourced records, with study/release qualifications.

The site selects exact commits through submodules. Author builds assemble the
YAML, Markdown, schemas and assets, validate cross-repository links, and generate
a publication snapshot. Public CI builds from that snapshot and published assets
without cloning private repositories. GitHub rejected read-only deploy keys;
none were installed, and no personal token is stored in the site workflow.
Snapshot checks cover its checksum and consistency with committed source pointers.
They do not claim to re-validate private authoring files in public CI.

Standalone metadata validation/tests passed locally and on GitHub for both
private repositories. The full site source/integration suite passed. Source
Pages build and TypeScript compilation passed for 78 generated pages. Export
validation checked 30 guidance cells and 1,737 local links/assets. Browser checks
passed for all 67 product pages, alias search, type filters, regional guidance,
Markdown/math, source edit links and mobile layout. ESLint has no errors and the
existing application-figure image warning.

A reversible live Markdown edit in the separate dataset repository refreshed the
site and was restored. The initial test used 127.0.0.1, which Next.js rejected for
HMR under its development-origin policy. The test passed using the advertised
localhost origin. Temporary test edits were restored before content commits.

Independent reviews identified and corrected dataset classification, method and
source-attribution issues. No meteorological arrays were downloaded or evaluated.
Publication claims remain limited to documented properties and draft guidance.

A fresh public-site clone without initialized metadata submodules passed its
locked dependency install, snapshot Pages build, 1,737-link export check and all
three snapshot tests. Snapshot development mode also rendered all 67 records
without accessing private metadata. The complete maintainer suite has 21 passing
tests. Snapshot checks reject changed JSON and mismatched source commit pointers;
asset bytes are validated by export/link checks, not covered by the JSON checksum.

The legacy branch-based Pages job attempted to initialize private submodules and
failed. Pages now uses the validated snapshot build artifact from the explicit
Actions workflow, whose checkout does not fetch submodules. Deployment is limited
to `main`; pull requests build a preview only.
