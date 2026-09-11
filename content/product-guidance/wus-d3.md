---
title: WUS-D3 evaluation guidance
summary: Draft interpretation of documented product properties; expert review is pending.
review:
  status: draft
  contributors:
    - Initial AI-assisted draft
  updated: '2026-09-11'
evidence:
  - statement: >-
      The original study reports precipitation above PRISM in parts of the western US and
      discusses uncertainty in mountain reference precipitation.
    paper: rahimi-wus-d3
    locator: Section 3, Figures 3-5.
    scope: >-
      Original ensemble and historical evaluation; do not generalize to later bias-corrected
      experiments.
regions:
  northwest: product-guidance/wus-d3.northwest.md
---

## Application guidance

Consider hourly precipitation and spatial storm structure for western US applications. Evaluate accumulated precipitation, seasonal biases, and extremes against multiple suitable references.

## Limits and evaluation checks

Record whether GCM forcing was bias corrected. Findings from the original ensemble cannot be assigned to later corrected experiments. Confirm WRF accumulation resets and time intervals before calculating hourly or daily extremes.

## Documentation and expert contributions

The linked metadata sources describe this archive. Related publication: [@rahimi-wus-d3]. Recommendations above are AI-assisted interpretation, not an endorsement from the dataset authors. Add region-specific evaluations with the release, model/member, reference data, period, and diagnostic before marking this guidance reviewed.
