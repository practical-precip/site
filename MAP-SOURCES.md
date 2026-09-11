# Map sources

The default regions follow the National Climate Assessment state groupings for the 50 states and DC. The map omits US territories. Hawaii is shown alone, rather than the assessment's full Hawaii and US-Affiliated Pacific Islands region. These are broad assessment regions, not homogeneous climate zones.

- [National Climate Assessment regions](https://nca5.climate.us/regions/): preserved NCA5 report, originally published by USGCRP.
- [US Atlas](https://github.com/topojson/us-atlas): 2017 Census cartographic state boundaries, simplified and projected with Albers USA, including Alaska and Hawaii insets.
- Geometry downloaded from `https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json` on September 11, 2026. TopoJSON arcs were decoded to SVG paths and coordinates rounded to one decimal place in `app/us-states.json`. The viewBox is 975 by 610. There are no runtime requests for map data.
- The US Atlas copyright and ISC permission notice are retained in [public/licenses/us-atlas.txt](public/licenses/us-atlas.txt).

The initial regional entries are provisional evaluation questions, not measured regional findings or product recommendations. They illustrate optional content for annual precipitation spatial resolution in the Northwest, Southwest, Alaska, and Hawaii. Other entries retain general guidance.
