---
title: GARD-LENS evaluation guidance
summary: Draft interpretation of documented product properties; expert review is pending.
review:
  status: draft
  contributors:
    - Initial AI-assisted draft
  updated: '2026-09-11'
evidence:
  - statement: The ensemble contains 200 members from three CMIP6 models; EC-Earth3 begins in 1970.
    paper: hartke-gard-lens
    locator: 'Abstract and Methods: GCM data.'
    scope: Published GARD-LENS ensemble under historical and SSP3-7.0 forcing.
regions:
  alaska: product-guidance/gard-lens.alaska.md
---

## Application guidance

Use member-level series to estimate internal variability while keeping results grouped by parent GCM. Compare balanced parent-model summaries with any pooled-member result.

## Limits and evaluation checks

The ensemble samples only three CMIP6 models under one future scenario. The paper identifies all three as relatively high climate-sensitivity models [@hartke-gard-lens], so also examine how their forced responses compare with a broader model ensemble. Do not interpret 200 members as 200 independent climate models or as complete scenario uncertainty. EC-Earth3 starts later, which affects common-period comparisons.

## Documentation and expert contributions

The linked metadata sources describe this archive. Related publication: [@hartke-gard-lens]. Recommendations above are AI-assisted interpretation, not an endorsement from the dataset authors. Add region-specific evaluations with the release, model/member, reference data, period, and diagnostic before marking this guidance reviewed.
