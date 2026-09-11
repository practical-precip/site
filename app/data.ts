import content from "./generated/content.json" with { type: "json" };
import type { RegionSelection } from "./regions";
export type Priority = "essential" | "context" | "lower";
export type Evidence = {
  statement: string;
  paper: string;
  locator: string;
  scope: string;
};
export type Review = {
  status: "draft" | "expert-reviewed";
  contributors: string[];
  updated: string;
  reviewed_by?: string[];
  reviewed_on?: string;
};
export type GuidanceContent = {
  title: string;
  summary: string;
  body: string;
  evidence: Evidence[];
  review: Review;
  contentFile?: string;
  paperIds: string[];
  regions?: Record<string, GuidanceContent>;
};
export type Cell = GuidanceContent & {
  priority: Priority;
  regions?: Record<string, Cell>;
};
export type Figure = {
  title: string;
  alt: string;
  caption: string;
  image: string;
  provenance: string;
  pdf?: string;
  data?: string;
  code?: string;
};
export type Topic = {
  id: string;
  title: string;
  short: string;
  use: string;
  intro: string;
  cells: Cell[];
  metrics: string[];
  sourceIds: string[];
  figure?: Figure;
};
export const columns = content.columns;
export const topics = content.topics as Topic[];
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
export function resolveCell(cell: Cell, region: RegionSelection): Cell {
  return region !== "all" && cell.regions?.[region]
    ? cell.regions[region]
    : cell;
}
export function hasRegionalGuidance(cell: Cell, region: RegionSelection) {
  return region !== "all" && !!cell.regions?.[region];
}
export type Product = Omit<(typeof content.products)[number], "guidance"> & {
  guidance: GuidanceContent;
};
export const products = content.products as Product[];
