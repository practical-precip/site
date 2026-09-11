# Product catalog source review

The catalog contains 31 records covering all 28 dataset rows in the NCAR matrix. The initial 12-record expansion is documented below, followed by the full inventory reconciliation. Each YAML record names the release or publication it describes, links its sources, and records the date checked. Recommendations in the Markdown files are AI-assisted drafts awaiting expert review.

## NCAR source snapshot

Discovery started from the [NCAR Hydro Climate Evaluation README](https://github.com/NCAR/hydro-climate-evaluation/blob/28f529dc6a265dbf669e6fd38ec20e7ee11c1998/README.md) and [Downscaling Methods Matrix](https://raw.githubusercontent.com/NCAR/hydro-climate-evaluation/28f529dc6a265dbf669e6fd38ec20e7ee11c1998/docs/downscalingMethodsMatrixPublic.36x24.pdf). Credit belongs to the NCAR catalog contributors. The matrix itself states that its information may contain errors.

- Repository revision: `28f529dc6a265dbf669e6fd38ec20e7ee11c1998`.
- Retrieved: September 11, 2026. Main-branch downloads matched the pinned copies byte for byte.
- README SHA-256: `c9a57d7eebaf1af2aed570204bb788359e92ed2db8cad143c940b507fc904f9b`.
- PDF SHA-256: `67e86b6bc78dda306263c7fdf1a24336f543175d8016e819fccb30b958bc74ad`.
- PDF metadata title: `DownscalingMethodsMatrixPublic2025`. Its single page was read as text and visually inspected to resolve merged table cells.

The README's 1981-2016 and 2016-2099 year ranges describe the evaluation map's averaging periods. They are not training windows or universal archive coverage. The boundary year is preserved as written rather than silently changed.

## Evaluation labels and archive identity

| NCAR map label | Catalog handling |
| --- | --- |
| MACA | Separate MACAv2-METDATA and MACAv2-LIVNEH entries. The map label alone does not establish which variant was evaluated. |
| LOCA_8th | Native CMIP5 LOCA is recorded at 1/16 degree. The evaluation's 1/8-degree processing and exact release still need confirmation. LOCA2 is separate. |
| NASA-NEX | Separate CMIP5 and CMIP6 entries. The README links CMIP6 documentation but lists CMIP5-era driving models and RCP scenarios elsewhere. This label alone does not resolve dataset identity. |
| GARD_puv | README describes precipitation and 500 mb horizontal-wind predictors. Exact experiment files, release, grid, and training choices remain unresolved. Not treated as GARD-LENS. |
| GARD_quv | README describes 500 mb water-vapor and horizontal-wind predictors. Exact experiment files, release, grid, and training choices remain unresolved. Not treated as GARD-LENS. |
| ICAR | README links model code. The matrix combines completed and in-progress experiments and describes data available on request. A specific distributed dataset must be identified before a complete product record is added. |

These unresolved labels are not claims that the datasets are unavailable today. They identify information still needed to connect the evaluation maps to reproducible archive records.

## Additional sources and decisions

| Product | Additional evidence | Decision |
| --- | --- | --- |
| MACAv2 variants | [Climatology Lab](https://www.climatologylab.org/maca.html), [Earth Engine METDATA catalog](https://developers.google.com/earth-engine/datasets/catalog/IDAHO_EPSCOR_MACAv2_METDATA) | Separate grids and reference records. Exact calibration windows remain qualified because the provider FAQ describes a different training-statistics period. Use the provider's 1950-2005 historical experiment description, not Earth Engine's broader availability banner. METDATA variable units are not silently assigned to LIVNEH files. |
| LOCA CMIP5 | [Scripps provider](https://loca.ucsd.edu/) | Keep the 32-model CMIP5 archive separate from LOCA2 and evaluation regridding. |
| NEX-GDDP CMIP5 | [NCCS](https://www.nccs.nasa.gov/nex-gddp/), [Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/NASA_NEX-GDDP) | NCCS has inconsistent monthly/daily language and 2099/2100 end years. Daily cadence is corroborated by the distributor. End-year differences remain explicit. |
| NEX-DCP30 | [NCCS](https://www.nccs.nasa.gov/nex-dcp30/), [Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/NASA_NEX-DCP30) | Monthly product. Do not recommend it for daily precipitation maxima or wet/dry spells. The 2013 publication metadata was checked in the distributor citation; its full text was not retrieved. |
| GDPCIR | [Gergel et al. (2024)](https://gmd.copernicus.org/articles/17/191/2024/), [Planetary Computer collection metadata](https://planetarycomputer.microsoft.com/api/stac/v1/collections/cil-gdpcir-cc-by) | Record QDM plus QPLAD, 1995-2014 reference window, no-leap daily records, and model-dependent license collections. |
| GARD-LENS | [Hartke et al. (2024)](https://www.nature.com/articles/s41597-024-04205-z), [NCAR GDEX](https://gdex.ucar.edu/datasets/d619000/) | Distinguish 200 members from three models; record the later EC-Earth3 start and regional training windows. The dataset's CC-BY-4.0 license is verified in GDEX, independently of the article license. Include the paper's high climate-sensitivity caveat. |
| WUS-D3 | [Rahimi et al. (2024)](https://gmd.copernicus.org/articles/17/2265/2024/), [AWS registry](https://registry.opendata.aws/wrf-cmip6/) | Record the original 14-model, 16-simulation scope and limited additional CESM2 scenarios. Later corrected forcing runs are a separate configuration. |
| NA-CORDEX | [NCAR GDEX](https://gdex.ucar.edu/datasets/d316009/), [access guidance](https://na-cordex.org/data-access.html), [terms](https://na-cordex.org/terms-use.html) | Update the access link to GDEX. Keep native and derived products distinct. Do not invent a single model count for an uneven experiment matrix. |
| TGW | [Jones et al. (2023)](https://www.nature.com/articles/s41597-023-02485-5), [MSD-LIVE](https://tgw-data.msdlive.org/) | Use the paper's 12 km grid and explicit repeated-weather design. Four trajectories are not four independent weather ensembles. |

The search also found [Hartke et al. (2025)](https://repository.library.noaa.gov/view/noaa/71089), which motivates comparable evaluation protocols and is included in the bibliography. No universal product ranking was inferred from this paper or the NCAR map's performance selection controls.

The initial 12 entries covered nine matrix rows. The follow-up inventory added the
19 missing families, bringing coverage to all 28 PDF rows through 31 catalog
records. [The editable coverage crosswalk](ncar-matrix-coverage.yaml) maps each
PDF row to its records. The count includes historical comparators and method
experiment families, not just operational future projection archives.

New records distinguish matrix transcription from independently checked provider
or paper details through `source_scope` and source locators. Some fields remain
unknown. Within-family variants are described explicitly, including DBCCA and
RegCM reference datasets, CarbonPlan GARD-SV/MV, CanLEAD global/regional parents,
and Alaska/Hawaii grids. This is not a complete enumeration of every release or
run. CONUS404 and the cited ADDA evaluation are historical records.

The global BCCAQ paper identifies SSP5-3.4-OS where the matrix lists SSP3-7.0.
The catalog follows the paper and records the discrepancy. GDEX CONUS404's
abstract describes WY1980-2021 while its archive time-range field extends through
WY2022. Both scopes are retained. STAR-ESDM's older matrix access status is not
asserted to be current: a later public DRCDP file header is linked separately.

Additional provider documentation checked includes CarbonPlan's release article,
the Canadian CanDCS download page, NOAA's UW-PD distribution description, EPA's
EDDE registry, GDEX CONUS404 and Alaska/Hawaii pages, and ORNL's project highlight.
The public Canadian CanLEAD and CanRCM4 landing pages did not resolve through the
web reader, so unresolved fields retain matrix scope rather than inferred terms.

No climate data arrays were downloaded, and no product performance was benchmarked. Source review establishes documented properties, not expert endorsement or suitability for a particular basin. File-level units, calendars, coverage, and licenses remain explicit verification tasks where sources did not resolve them.

Focused independent review found no blocking contradictions in GARD-LENS, WUS-D3, TGW, or MACA records. Review suggestions were incorporated: the GARD-LENS data license and climate-sensitivity caveat, and explicit MACA calibration-period uncertainty. Alaska GARD-LENS and Northwest WUS-D3 guidance documents add regional findings with their study scope.
