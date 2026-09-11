import type { RegionId, RegionSelection } from "./regions";
export const columns = [
  {
    id: "spatial",
    title: "Spatial resolution",
    subtitle: "Grid spacing & support",
    definition:
      "The spacing of the output grid, and the area each value represents. A fine output grid does not by itself establish the scale of credible information.",
  },
  {
    id: "temporal",
    title: "Temporal resolution",
    subtitle: "Hourly, daily, monthly",
    definition:
      "The interval and accumulation window of each output value. Match these to the process and statistic your application needs.",
  },
  {
    id: "models",
    title: "GCM ensemble size",
    subtitle: "Different climate models",
    definition:
      "The number and diversity of driving global climate models. Count models separately from initial-condition members and downscaling methods.",
  },
  {
    id: "members",
    title: "Internal variability",
    subtitle: "Members within a model",
    definition:
      "Multiple simulations of the same climate model and forcing, started from different initial conditions. These sample different plausible climate sequences.",
  },
  {
    id: "domain",
    title: "Geographic domain",
    subtitle: "Coverage & boundaries",
    definition:
      "The geographic footprint of the product, including your complete study area. CONUS means the contiguous United States.",
  },
  {
    id: "coverage",
    title: "Temporal coverage",
    subtitle: "Baseline & future period",
    definition:
      "The years, continuity, and scenarios available for your baseline and planning horizon. This is different from the timestep.",
  },
];
export type Priority = "essential" | "context" | "lower";
export const priorities = {
  essential: {
    label: "Essential check",
    symbol: "!",
    description:
      "Directly affects the target statistic or whether it can be calculated.",
  },
  context: {
    label: "Context dependent",
    symbol: "~",
    description:
      "Importance depends on the region, process, scale, or planning horizon.",
  },
  lower: {
    label: "Lower priority",
    symbol: "-",
    description:
      "Fine resolution is often a secondary selection criterion for this target. Validation is still needed.",
  },
};
export type GuidanceContent = {
  priority: Priority;
  title: string;
  summary: string;
  check: string;
};
export type Cell = GuidanceContent & {
  regions?: Partial<Record<RegionId, Partial<GuidanceContent>>>;
};
export function resolveCell(
  cell: Cell,
  region: RegionSelection,
): GuidanceContent {
  const override = region === "all" ? undefined : cell.regions?.[region];
  return {
    ...cell,
    ...Object.fromEntries(
      Object.entries(override ?? {}).filter(([, value]) => value !== undefined),
    ),
  };
}
export function hasRegionalGuidance(cell: Cell, region: RegionSelection) {
  return (
    region !== "all" &&
    Object.values(cell.regions?.[region] ?? {}).some((v) => v !== undefined)
  );
}
export type Topic = {
  id: string;
  title: string;
  short: string;
  use: string;
  intro: string;
  cells: Cell[];
  metrics: string[];
  sourceIds: string[];
};
const c = (
  priority: Priority,
  title: string,
  summary: string,
  check: string,
  regions?: Cell["regions"],
): Cell => ({ priority, title, summary, check, regions });
export const topics: Topic[] = [
  {
    id: "annual-precipitation",
    title: "Annual precipitation",
    short: "Annual totals",
    use: "Water balance & long-term supply",
    intro:
      "Evaluate totals over the area and year definition used in your water balance. Start with seasonal and annual performance before selecting a finer output grid.",
    cells: [
      c(
        "context",
        "Catchment spatial support",
        "Choose a spatial scale that represents your catchment and elevation gradients. Fine grid spacing is not a guarantee of accurate basin totals.",
        "Compare area-weighted annual totals and elevation bands with an appropriate reference. Record the regridding method.",
        {
          northwest: {
            title: "Evaluate terrain and basin totals",
            check:
              "Compare annual totals separately for coastal, mountain, and inland catchments. Evaluate elevation bands and record the reference coverage and regridding method.",
          },
          southwest: {
            title: "Evaluate seasonal and basin totals",
            check:
              "Compare annual and seasonal basin totals separately. Evaluate elevation bands and test whether annual agreement masks differences between seasons.",
          },
          alaska: {
            title: "Check basin and reference coverage",
            check:
              "Confirm coverage of the Alaska study basin. Compare elevation bands and document gaps in the reference network before interpreting basin totals.",
          },
          hawaii: {
            title: "Evaluate island and elevation coverage",
            check:
              "Check the land mask for each study island. Compare totals by elevation and exposure, and document how coastal grid cells are handled.",
          },
        },
      ),
      c(
        "lower",
        "Annual aggregation",
        "Monthly or daily accumulations can support annual totals when the record is complete. Subdaily output is not required for this statistic alone.",
        "Check precipitation units, calendar, missing intervals, and whether your target uses calendar years or water years.",
      ),
      c(
        "essential",
        "Climate model uncertainty",
        "Use several driving models to examine uncertainty in projected annual changes. A large file count may still represent only a few models.",
        "Report model identities, scenario, and the distribution of basin-scale changes. Keep model and member counts separate.",
      ),
      c(
        "context",
        "Forced change and internal variability",
        "For short records or modest changes, internal variability can affect the interpretation of annual precipitation trends.",
        "Compare changes across initial-condition members where available. Keep the same baseline and future window.",
      ),
      c(
        "essential",
        "Include the full basin",
        "Check that the product covers the entire contributing area, including upstream regions across national boundaries.",
        "Overlay the product mask and basin boundary. Quantify the fraction of basin area without valid coverage.",
      ),
      c(
        "essential",
        "Baseline and future periods",
        "Require a usable historical reference period and output covering the planning horizon and scenario of interest.",
        "Inventory years, calendars, scenario transitions, and missing periods before comparing climatologies.",
      ),
    ],
    metrics: [
      "Annual and seasonal bias",
      "Interannual variability",
      "Basin-average change",
    ],
    sourceIds: ["lehner", "lange"],
  },
  {
    id: "annual-maximum",
    title: "Annual maximum precipitation",
    short: "Annual maxima",
    use: "Extreme rainfall & flood studies",
    intro:
      "Define the accumulation duration and spatial support first. A maximum hourly point value, a maximum daily grid value, and a basin-average storm maximum answer different questions.",
    cells: [
      c(
        "essential",
        "Resolve the event scale",
        "Check extremes at the footprint your application uses. Fine grids can still inherit unresolved storm processes or unsuitable spatial dependence.",
        "Evaluate maxima after aggregating both product and reference to the same area. Separate point and areal targets.",
      ),
      c(
        "essential",
        "Match the duration",
        "Daily data cannot directly supply hourly extremes. The output interval must resolve your target accumulation duration.",
        "Check fixed versus rolling windows, timestamp conventions, and whether temporal disaggregation has been independently evaluated.",
      ),
      c(
        "essential",
        "Compare tail changes",
        "Examine how annual maxima and their projected changes differ across driving models and downscaling choices.",
        "Compare duration-specific maxima using the same period, region, scenario, and estimator across models.",
      ),
      c(
        "essential",
        "Sample rare events",
        "Annual maxima are noisy. Initial-condition ensembles help assess how much an extreme estimate depends on the realized climate sequence.",
        "Report record length and member count alongside interval estimates. Do not pool unequal climates as one stationary sample.",
      ),
      c(
        "context",
        "Capture storm footprints",
        "Large-area flood studies need complete storm coverage. A small site study may need a smaller domain, but still needs credible regional processes.",
        "Check storm coverage, coastlines, mountain regions, and proximity to a regional model boundary.",
      ),
      c(
        "essential",
        "Record length for extremes",
        "Short time slices supply few annual maxima. Extrapolated return levels require uncertainty estimates and explicit climate assumptions.",
        "State the years and missing-year rule. Show sensitivity to fitting window, distribution, and nonstationarity assumptions.",
      ),
    ],
    metrics: [
      "Duration-specific annual maxima",
      "Return-level uncertainty",
      "Areal extreme bias",
    ],
    sourceIds: ["kendon", "extremes", "maraun"],
  },
  {
    id: "intermittency",
    title: "Intermittency",
    short: "Wet & dry spells",
    use: "Drought, agriculture & runoff timing",
    intro:
      "Define a wet interval before counting wet days or spells. Then evaluate both occurrence and persistence. Matching the precipitation distribution does not establish that the sequence is useful.",
    cells: [
      c(
        "context",
        "Wet-interval definition",
        "A catchment can receive rain somewhere while one location remains dry. Occurrence depends on spatial aggregation.",
        "Compute wet frequency and spells at the station, grid, or basin support used in the application.",
      ),
      c(
        "essential",
        "Preserve the sequence",
        "Use a timestep suited to the dry or wet spells you need. Monthly totals do not identify consecutive dry days.",
        "Check dry-spell lengths, wet-spell lengths, and wet-to-wet transition frequency using a documented threshold.",
      ),
      c(
        "context",
        "Compare occurrence",
        "Assess whether driving models and downscaling methods give consistent changes in wet frequency and spell persistence.",
        "Compare occurrence and persistence separately from wet-day intensity across the available models.",
      ),
      c(
        "context",
        "Sample long spells",
        "A single realization may include too few persistent dry or wet events for your intended risk estimate.",
        "Examine the variability of longest spells across years and members. Report sample size and uncertainty.",
      ),
      c(
        "context",
        "Follow regional spells",
        "Regional drought applications need consistent occurrence across the whole study area. Point applications may not need a continental domain.",
        "Measure simultaneous dry conditions across subregions rather than relying only on individual grid-cell metrics.",
      ),
      c(
        "essential",
        "Sequence completeness",
        "Missing intervals and disconnected time slices can truncate spells or create false ones.",
        "Retain missingness, verify continuity, and define how spells crossing year or scenario boundaries are handled.",
      ),
    ],
    metrics: [
      "Wet-interval frequency",
      "Wet and dry spell lengths",
      "Occurrence transitions",
    ],
    sourceIds: ["lange", "value"],
  },
  {
    id: "precipitation-phase",
    title: "Precipitation phase",
    short: "Rain versus snow",
    use: "Snowpack & seasonal water storage",
    intro:
      "Total precipitation alone does not identify phase. Establish whether rain and snow are provided directly or diagnosed from other variables, and evaluate the partitioning method.",
    cells: [
      c(
        "essential",
        "Represent elevation",
        "Assess terrain and elevation differences between the product, observations, and impact model before using rain-snow partitioning.",
        "Check elevation-band rain fractions and snow accumulation. Document any lapse-rate or terrain adjustment.",
      ),
      c(
        "essential",
        "Pair weather variables",
        "Check that precipitation and the variables used to diagnose phase refer to compatible times and locations.",
        "Inspect available rain, snowfall, temperature, and humidity variables. Test phase estimates at the application timestep.",
      ),
      c(
        "context",
        "Compare phase response",
        "Snow-related impacts depend on the joint changes in temperature and precipitation across models.",
        "Compare rain fraction and seasonal snowfall changes, not just changes in total precipitation.",
      ),
      c(
        "context",
        "Sample snow seasons",
        "Consider member variability when estimating the frequency of low-snow years or rain-on-snow conditions.",
        "Compare event and seasonal metrics across available members without treating members as distinct climate models.",
      ),
      c(
        "essential",
        "Cover the snow zone",
        "The footprint must include the elevations contributing snow storage and meltwater to the study area.",
        "Check mountain coverage, product masks, and the observation network supporting evaluation.",
      ),
      c(
        "essential",
        "Seasonal phase changes",
        "Use historical and future windows that support evaluation of the changing snowfall season.",
        "Check seasonal completeness and scenario availability. Compare phase by month and elevation, not just annually.",
      ),
    ],
    metrics: [
      "Rain fraction by elevation",
      "Seasonal snowfall water equivalent",
      "Phase classification error",
    ],
    sourceIds: ["jennings", "lehner"],
  },
  {
    id: "spatial-coherence",
    title: "Spatial coherence",
    short: "Storms across a region",
    use: "Basin floods & connected systems",
    intro:
      "Evaluate whether precipitation occurs together at different locations. Good individual grid-cell distributions do not establish credible storm footprints or basin-average extremes.",
    cells: [
      c(
        "essential",
        "Spatial dependence",
        "Spatial dependence must be evaluated directly. A high-resolution grid alone does not establish coherent precipitation fields.",
        "Compare correlation with distance, simultaneous extremes, and basin-average event totals at common spatial support.",
      ),
      c(
        "essential",
        "Check synchronized storms",
        "Use synchronized timestamps and an interval that resolves the propagation or concurrence of events of interest.",
        "Inspect event maps and time sequences. Check temporal disaggregation for independent timing across neighboring cells.",
      ),
      c(
        "context",
        "Test each method",
        "Assess field behavior across driving models and downscaling methods before treating them as interchangeable.",
        "Apply the same spatial dependence diagnostics to each product version and driving model.",
      ),
      c(
        "context",
        "Sample joint extremes",
        "More members can provide more regional events, but cannot repair a method that misrepresents spatial dependence.",
        "Evaluate dependence first, then estimate uncertainty in regional event metrics across members.",
      ),
      c(
        "essential",
        "Use a continuous field",
        "Require spatially consistent coverage across connected catchments or assets. Inspect seams when combining products.",
        "Check overlap, masks, boundary behavior, and simultaneous precipitation across the full application domain.",
      ),
      c(
        "context",
        "Keep comparable events",
        "Use overlapping periods and compatible calendars for spatial diagnostics. Avoid comparing different seasons or unmatched event records.",
        "For free-running climate simulations, compare event statistics rather than requiring storms on observed dates.",
      ),
    ],
    metrics: [
      "Correlation versus distance",
      "Concurrent exceedance frequency",
      "Basin-average storm totals",
    ],
    sourceIds: ["maraun", "value", "lange"],
  },
];
