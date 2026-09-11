---
title: 'GARD-LENS: Alaska evaluation guidance'
summary: Check the Alaska observation processing before evaluating heavy precipitation.
review:
  status: draft
  contributors:
    - Initial AI-assisted draft
  updated: '2026-09-11'
evidence:
  - statement: >-
      The authors capped Alaska GMET training precipitation at 500 mm/day and regridded it
      from a 2 km curvilinear grid to an approximately 4 km rectilinear grid.
    paper: hartke-gard-lens
    locator: 'Methods: Observation data.'
    scope: >-
      Processing of Alaska training observations, not a stated maximum imposed on every
      projected GARD-LENS value.
---

## Application guidance

Compare basin and elevation-band precipitation against independent observations where possible. Record the processed GMET reference used in training and do not treat it as independent validation.

## Interpretation limits

The cap described in [@hartke-gard-lens] applies to the training observations. Check the actual output distribution rather than assuming a 500 mm/day ceiling in the projections. Preserve parent-model identity when pooling members. All three parent models have relatively high climate sensitivity, and the archive samples only SSP3-7.0.

## Expert contribution needed

Add Alaska basin and mountain precipitation evaluations with the release, reference data, period, and metric. This interpretation is an AI-assisted draft awaiting regional expert review.
