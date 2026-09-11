---
title: Catchment spatial support
priority: context
evidence: []
review:
  status: draft
  contributors:
    - Initial AI-assisted draft
  updated: '2026-09-11'
summary: >-
  Choose a spatial scale that represents your catchment and elevation gradients. Fine
  grid spacing is not a guarantee of accurate basin totals.
regions:
  northwest: cells/annual-precipitation/spatial.northwest.md
  southwest: cells/annual-precipitation/spatial.southwest.md
  alaska: cells/annual-precipitation/spatial.alaska.md
  hawaii: cells/annual-precipitation/spatial.hawaii.md
---

Choose a spatial scale that represents your catchment and elevation gradients. Fine grid spacing is not a guarantee of accurate basin totals.

## Evaluation check

Compare area-weighted annual totals and elevation bands with an appropriate reference. Record the regridding method.

## Basin aggregation

For grid-cell precipitation $P_i$ and overlapping basin areas $A_i$, the area-weighted mean is

$$
\bar{P} = \frac{\sum_i A_i P_i}{\sum_i A_i}.
$$

Use consistent units and account for cells with missing values. This equation defines the aggregation, not product skill.

![Synthetic monthly totals illustrating why seasonal evaluation matters](/figures/annual-precipitation.png)

_Illustrative synthetic data, not observations or a product benchmark. See the application figure for provenance._
