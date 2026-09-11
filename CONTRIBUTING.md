# Contributing guidance and product metadata

You can edit content on GitHub and open a pull request without changing application code. Start with one cell, paper, or product. Describe the change and the evidence supporting it in your PR.

## Find the file

| Content | Editable source |
| --- | --- |
| Row and column order, column labels and definitions | `content/table.yaml` |
| Row title, introduction, metrics, optional figure, and cell file paths | `content/rows/<row-id>.yaml` |
| One guidance box, including prose, images, and equations | `content/cells/<row-id>/<column-id>.md` |
| Optional regional version of a box | `content/cells/<row-id>/<column-id>.<region-id>.md` |
| Region labels, state membership, and map label positions | `content/regions.yaml` |
| Shared academic bibliography | `content/papers.yaml` |
| Product catalog order | `content/catalog.yaml` |
| Product technical metadata | `content/products/<product-id>.yaml` |
| Product recommendations and expert prose | `content/product-guidance/<product-id>.md` |
| Local images and downloads | `public/`, normally `public/guidance-assets/` |

Every displayed box has its own Markdown file. A row maps column IDs to these files. IDs remain stable when labels or order change. Use two spaces for YAML indentation, never tabs. Unknown fields and duplicate keys fail validation.

## Edit a box

Open the Markdown file from the website's "View or edit this Markdown file" link, or browse `content/cells/`. The YAML header controls the short title, priority, summary, paper findings, review record, and optional region files. The body is the expert guidance shown in both the popup and application guide.

```markdown
---
title: Catchment spatial support
priority: context
summary: Evaluate precipitation at the spatial support used by the application.
review:
  status: draft
  contributors:
    - Your public name or GitHub handle
  updated: "2026-09-11"
evidence:
  - statement: State a specific finding reported by the paper in your own words.
    paper: existing-paper-id
    locator: Section 3.2, Figure 4
    scope: State the study region, period, method, and limits of transfer.
---

Explain your interpretation and recommended evaluation here. Cite a bibliography
entry with [@existing-paper-id], or link directly to a supporting source.

## Evaluation check

Describe a diagnostic, its units, and how to interpret it.

For an area-weighted basin mean:

$$
\bar{P} = \frac{\sum_i A_i P_i}{\sum_i A_i}.
$$

![Describe the information conveyed by the figure](/guidance-assets/example.png)

_Identify the source, license or permission, and what the image shows._
```

This is a template: replace the placeholder paper ID and image path with real entries before running checks. A working equation and image example is in `content/cells/annual-precipitation/spatial.md`.

Use `$...$` for inline math and `$$` on separate lines for displayed equations. GitHub-style tables and lists are supported. Put blank lines around paragraphs, lists, equations, and images. Raw HTML, scripts, and embedded iframes are not supported. Math uses KaTeX with trusted commands disabled.

Image paths start at the public root: `/guidance-assets/example.png` means `public/guidance-assets/example.png`. The site adds its deployment prefix automatically. Images require alt text. HTTPS images are supported, but locally stored images are more reproducible. Use images you have permission to redistribute, and credit their source. Do not copy a paper's figure without checking reuse terms.

Links may be HTTPS URLs, site paths such as `/guidance/annual-maximum#temporal`, or `#anchors`. Relative filesystem links are not supported in rendered guidance. Do not put the GitHub Pages repository prefix in content URLs.

## Separate findings from judgment

- `evidence` contains paraphrased findings from academic papers. Each entry needs a bibliography key, a locator, and the study's scope. Include contrary findings and limitations.
- The Markdown body contains interpretation, evaluation instructions, and expert recommendations. Identify when advice is based on experience or inference rather than a published result.
- A citation in the body uses `[@paper-id]`. It becomes a paper link. Add the full reference once in `content/papers.yaml`, including DOI, authors, year, title, journal, URL, a short supporting finding, and scope.
- An empty `evidence: []` is allowed and displays as no published finding entered. Do not add a loosely related citation merely to fill a box.
- Keep `review.status: draft` until a domain expert has reviewed the actual text. For `expert-reviewed`, add `reviewed_by` (a list of public names/handles) and `reviewed_on` (a quoted date). Record contributors truthfully. Change reviewed guidance back to draft when making substantive changes that have not been reviewed.

The migrated guidance is labeled "Initial AI-assisted draft." Those entries do not imply that any researcher endorsed the advice. Automated validation checks structure and references, not whether a paper supports a claim. Reviewers must check scientific accuracy.

## Add or change a regional version

Copy the complete box document to a regional Markdown file. Add its path to the general file's header:

```yaml
regions:
  northwest: cells/annual-precipitation/spatial.northwest.md
```

A regional file replaces the whole document, including its evidence and review record. It does not inherit expert approval from the general file. Regional documents cannot link to further regional variants. Without a matching regional file, the site shows the general document. Regional IDs must exist in `content/regions.yaml`.

## Configure rows and columns

`content/table.yaml` determines display order. Reordering does not move content between boxes because row files use column IDs, not array positions.

To add a row:

1. Add its ID to `table.yaml` under `rows`.
2. Copy a row file to `content/rows/<new-id>.yaml` and update `id`, labels, introduction, metrics, and references.
3. Supply one `cells` entry for every configured column. Point each entry to a Markdown file, or use `null` for an explicit "Guidance not yet supplied" box.
4. A figure is optional. Omit the entire `figure` block if none is available. Otherwise supply the image path, title, alt text, caption, and provenance. PDF, data, and code downloads are optional.

To add a column, add its definition to `table.yaml` and add that ID to every row's `cells`. Existing Markdown files do not need to move. To remove rows or columns, remove their references and files together. Validation reports unreferenced documents to catch misspelled paths and accidentally omitted contributions. If a removed row appears in product `relevant_rows`, update those products too.

## Add a precipitation product

Copy a file under `content/products/`, give it a stable ID, and list it in `content/catalog.yaml`. Create its recommendations file under `content/product-guidance/` and point `guidance` to it. Add the cited academic papers to the shared bibliography.

Document the exact release or publication described. Include provider, method, reference/training data, geographic domain and mask limits, grid spacing and units, output interval, historical/future periods, scenarios, variable names and units, calendar handling, driving models, member availability, data access, format, and reuse terms. `metadata_sources` must identify supporting documentation and locators, and `verified_on` records the date checked. Use explicit "not recorded" notes or the permitted `null` values when information is unavailable. Do not infer a license from public download access.

Product guidance supports the same `regions` mapping to complete regional Markdown documents as table cells. Product documents do not need a priority field.

Keep recommendations in the Markdown document. Describe relevant applications, evaluation checks, limitations, and regional evidence. An entry is a catalog record, not a certification. Do not apply metadata from an older release to a later one without checking changes. Link `relevant_rows` to application IDs in the table.

## Validate and preview

With Node.js 22.13 or newer:

```sh
npm ci
npm run content:check
npm run test:content
npm run dev
```

`npm run dev` compiles content before starting Next.js and watches Markdown, YAML, and public assets. Valid changes reload automatically. Invalid edits print a source-file error in the terminal and retain the last valid preview until corrected. `npm run content:build` is also available for a one-time build.

For a Pages build:

```sh
npm run build:pages
npm run check:export
npm run lint
```

The compiler checks metadata structure, IDs, complete cell mappings, paper keys, image paths and alt text, equation syntax, and regional references. `content/schema.json` also supplies editor schema definitions. Errors name the source file.

Never edit `app/generated/content.json` or `docs/` by hand. The former is ignored and regenerated. The current Pages configuration publishes the checked-in `docs/` directory. Contributors may submit source-only PRs; maintainers must run the Pages build and include its output before merging a published update. The PR workflow validates and builds a preview artifact but does not publish pull requests.

In your PR, identify changed cells/products, explain the evidence and recommendation, note review status and unresolved questions, and include the checks you ran. The maintainer reviews the science and generated preview before merging.

For maintainers checking the live editing workflow, `scripts/check_content_preview.mjs` uses Playwright against a running development server. It temporarily adds a regional product document, verifies that saving it updates the page and source link, then restores the files. Run it only in an isolated checkout with no other content editor. `PRECIP_SITE_URL` defaults to `http://127.0.0.1:3011`; configure the Playwright module and executable as for the other browser check.

## Source reconciliation

The [catalog source review](notes/2026-09-11-catalog-sources.md) records the NCAR
matrix revision and additional provider and paper sources. Treat evaluation-map
labels, archive versions, and downscaling methods as different identifiers.
Evaluation averaging periods are not necessarily dataset or training periods.
When sources conflict, explain the discrepancy in the affected field and source
locator. `verified_on` means documentation was checked on that date, not that data
files were inspected or every field was independently validated.

## Dataset metadata fields

The catalog merges the fields in [dataset_metadata.jpg](dataset_metadata.jpg)
with the existing provenance and guidance structure. Edit one YAML file in
`content/products/` and its Markdown file in `content/product-guidance/`.

| Requested concept | Editable field |
| --- | --- |
| CMIP generation | `generation` (CMIP3/5/6/7 or Other) |
| Spatial extent, grid, resolution | `coverage.domain`, `grid`, `grid_spacing` |
| Temporal resolution, period, scenarios | `coverage.timestep`, `historical`, `future`, `scenarios` |
| Training data and method | `method.reference_dataset`, `training_period`, `family`, `description` |
| Variables | `coverage.variables` (names, units, descriptions) |
| GCM count and members | `ensemble.model_count`, `driving_models`, `members`, `member_counts` |
| Access, subsetting, cost | `access.landing_page`, `data`, `subsetting`, `cost` |
| File format and license | `access.format`, `license`, `license_url` |
| Creation, release, publication dates | `dates.created`, `released`, `publication`, `notes` |
| Publications and documented uses | `references`, `existing_uses` |
| Funding and related resources | `funding`, `associated_resources` |
| Evidence scope and check date | `source_scope`, `metadata_sources`, `verified_on` |

Dates use quoted ISO dates, such as `'2024-09-22'`, or `null` when unknown.
"Creation data" in the request is interpreted as creation date. Do not infer it
from a version token, file timestamp, publication date, or simulation period.
Empty arrays mean information has not been entered, not that no funding or uses
exist. A nullable member count means unknown, not zero. Member counts must name
their model, release/scenario scope, and supporting URL. Stochastic downscaling
realizations and GCM initial-condition members are different quantities.

A qualitative geographic extent is supported. If the family has different grids
or reference datasets, describe each configuration explicitly or split it into
records. Public downloads do not imply a particular license. Software and paper
licenses do not automatically apply to data. Keep unverified details visible in
`source_scope` and source locators.

The [NCAR crosswalk](notes/ncar-matrix-coverage.yaml) maps the 28 PDF rows to
catalog records. Update it when splitting or renaming one of those records.
The tests ensure that each source row still points to an existing record.
