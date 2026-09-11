// Broad NCA regions for the 50 states and DC. Territories are outside this map.
// State geometry: us-atlas 3.0.1, states-albers-10m.json (ISC; see MAP-SOURCES.md).
export const regions = [
  {
    id: "northwest",
    name: "Northwest",
    short: "NW",
    states: ["53", "41", "16"],
    label: [170, 105],
  },
  {
    id: "southwest",
    name: "Southwest",
    short: "SW",
    states: ["06", "32", "49", "04", "08", "35"],
    label: [250, 285],
  },
  {
    id: "northern-plains",
    name: "Northern Great Plains",
    short: "NGP",
    states: ["30", "56", "38", "46", "31"],
    label: [425, 145],
  },
  {
    id: "southern-plains",
    name: "Southern Great Plains",
    short: "SGP",
    states: ["20", "40", "48"],
    label: [475, 365],
  },
  {
    id: "midwest",
    name: "Midwest",
    short: "MW",
    states: ["27", "19", "29", "55", "17", "26", "18", "39"],
    label: [640, 215],
  },
  {
    id: "southeast",
    name: "Southeast",
    short: "SE",
    states: ["05", "22", "28", "01", "47", "21", "51", "37", "45", "13", "12"],
    label: [725, 365],
  },
  {
    id: "northeast",
    name: "Northeast",
    short: "NE",
    states: [
      "54",
      "24",
      "10",
      "11",
      "42",
      "34",
      "36",
      "09",
      "44",
      "25",
      "50",
      "33",
      "23",
    ],
    label: [850, 160],
  },
  {
    id: "alaska",
    name: "Alaska",
    short: "AK",
    states: ["02"],
    label: [150, 480],
  },
  {
    id: "hawaii",
    name: "Hawaii",
    short: "HI",
    states: ["15"],
    label: [325, 540],
  },
] as const;
export type RegionId = (typeof regions)[number]["id"];
export type RegionSelection = RegionId | "all";
export function validRegion(value: string | null): RegionSelection {
  return regions.find((r) => r.id === value)?.id ?? "all";
}
export function regionName(id: RegionSelection) {
  return regions.find((r) => r.id === id)?.name ?? "All regions";
}
