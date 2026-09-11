export const sources = {
  lehner: {
    authors: "Lehner et al.",
    year: 2020,
    title:
      "Partitioning climate projection uncertainty with multiple large ensembles and CMIP5/6",
    journal: "Earth System Dynamics",
    url: "https://esd.copernicus.org/articles/11/491/2020/",
    doi: "10.5194/esd-11-491-2020",
    support:
      "Multiple single-model ensembles help separate internal variability from differences in model response. The study shows why those uncertainty sources need separate treatment at regional scales.",
    scope:
      "Climate-model uncertainty analysis; not a downscaled product ranking.",
  },
  lange: {
    authors: "Lange",
    year: 2019,
    title:
      "Trend-preserving bias adjustment and statistical downscaling with ISIMIP3BASD (v1.0)",
    journal: "Geoscientific Model Development",
    url: "https://gmd.copernicus.org/articles/12/3055/2019/",
    doi: "10.5194/gmd-12-3055-2019",
    support:
      "This method separates bias adjustment from spatial downscaling and explicitly handles dry-day frequency. Its evaluation illustrates why trend preservation and spatial variability need their own checks.",
    scope:
      "Evidence about ISIMIP3BASD v1.0. It does not establish the behavior of every bias-adjusted product.",
  },
  kendon: {
    authors: "Kendon et al.",
    year: 2017,
    title:
      "Do Convection-Permitting Regional Climate Models Improve Projections of Future Precipitation Change?",
    journal: "Bulletin of the American Meteorological Society",
    url: "https://eprints.ncl.ac.uk/229888",
    doi: "10.1175/BAMS-D-15-0004.1",
    support:
      "The reviewed convection-permitting simulations improve several subdaily rainfall characteristics. That finding does not imply uniform improvements in daily means, or make grid spacing alone a skill measure.",
    scope:
      "Regional convection-permitting modeling evidence. Applicability depends on location, process, and configuration.",
  },
  extremes: {
    authors: "Bhatia & Ganguly",
    year: 2019,
    title:
      "Precipitation extremes and depth-duration-frequency under internal climate variability",
    journal: "Scientific Reports",
    url: "https://www.nature.com/articles/s41598-019-45673-3",
    doi: "10.1038/s41598-019-45673-3",
    support:
      "The study uses initial-condition ensembles to examine precipitation extremes and return levels. Combining member information can reduce sampling uncertainty under the study's distributional assumptions.",
    scope:
      "CESM large-ensemble analysis. Pooling members in another application requires checking the assumptions.",
  },
  maraun: {
    authors: "Maraun",
    year: 2013,
    title:
      "Bias Correction, Quantile Mapping, and Downscaling: Revisiting the Inflation Issue",
    journal: "Journal of Climate",
    url: "https://oceanrep.geomar.de/21175/1/jcli-d-12-00821.1.pdf",
    doi: "10.1175/JCLI-D-12-00821.1",
    support:
      "Using quantile mapping to bridge mismatched spatial scales can misrepresent dependence and area-mean extremes. Matching local distributions is therefore insufficient evidence of credible regional precipitation.",
    scope:
      "A methodological caution about scale mismatch. This is not a version-specific evaluation of STAR or another named product.",
  },
  value: {
    authors: "Maraun et al.",
    year: 2019,
    title:
      "Statistical downscaling skill under present climate conditions: A synthesis of the VALUE perfect predictor experiment",
    journal: "International Journal of Climatology",
    url: "https://rmets.onlinelibrary.wiley.com/doi/10.1002/joc.5877",
    doi: "10.1002/joc.5877",
    support:
      "VALUE evaluates multiple aspects of downscaling skill, including variability and dependence. Performance for one statistic does not establish skill for all application-relevant features.",
    scope:
      "Present-climate perfect-predictor evaluation. Future transfer and errors in driving climate models need additional assessment.",
  },
  jennings: {
    authors: "Jennings et al.",
    year: 2018,
    title:
      "Spatial variation of the rain-snow temperature threshold across the Northern Hemisphere",
    journal: "Nature Communications",
    url: "https://repository.library.noaa.gov/view/noaa/26564/noaa_26564_DS1.pdf",
    doi: "10.1038/s41467-018-03629-7",
    support:
      "Observed rain-snow transition temperatures vary geographically. Including humidity improves phase prediction relative to temperature-only methods in the conditions examined.",
    scope:
      "Northern Hemisphere observational analysis. It does not prescribe a universal threshold or validate a specific downscaled product.",
  },
};
export type SourceId = keyof typeof sources;
