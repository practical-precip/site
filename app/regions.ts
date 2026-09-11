import content from "./generated/content.json" with { type: "json" };
export const regions = content.regions;
export type RegionId = string;
export type RegionSelection = RegionId | "all";
export function validRegion(value: string | null): RegionSelection {
  return regions.find((r) => r.id === value)?.id ?? "all";
}
export function regionName(id: RegionSelection) {
  return regions.find((r) => r.id === id)?.name ?? "All regions";
}
