import content from "./generated/content.json" with { type: "json" };
export type Paper = {
  authors: string;
  year: number;
  title: string;
  journal: string;
  url: string;
  doi: string;
  support: string;
  scope: string;
};
export const sources: Record<string, Paper> = content.papers;
export type SourceId = string;
