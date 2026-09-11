---
title: GDPCIR evaluation guidance
summary: Draft interpretation of documented product properties; expert review is pending.
review:
  status: draft
  contributors:
    - Initial AI-assisted draft
  updated: '2026-09-11'
evidence:
  - statement: The published workflow applies QDM followed by QPLAD using ERA5 over 1995-2014.
    paper: gergel-gdpcir
    locator: Abstract and sections 2-3.
    scope: >-
      Method and training design of the 2024 release; not a validation of every
      precipitation metric.
---

## Application guidance

Consider this product for studies requiring global daily coverage and an explicit quantile-trend preservation method. Compare against other reference datasets as well as ERA5.

## Limits and evaluation checks

Test whether the target statistic is preserved after spatial and temporal aggregation. A method designed to preserve GCM quantile changes cannot establish the accuracy of those future changes. Keep model-specific licenses with downloaded subsets.

## Documentation and expert contributions

The linked metadata sources describe this archive. Related publication: [@gergel-gdpcir]. Recommendations above are AI-assisted interpretation, not an endorsement from the dataset authors. Add region-specific evaluations with the release, model/member, reference data, period, and diagnostic before marking this guidance reviewed.
