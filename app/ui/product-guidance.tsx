"use client";
import type { GuidanceContent } from "../data";
import { regionName } from "../regions";
import GuidanceDocument from "./guidance-document";
import RegionSelector, { useRegion } from "./region-selector";
export default function ProductGuidance({
  document,
}: {
  document: GuidanceContent;
}) {
  const [region] = useRegion();
  const regional = region === "all" ? undefined : document.regions?.[region];
  return (
    <>
      <RegionSelector />
      <p className="regional-scope">
        {regional
          ? `${regionName(region)} guidance`
          : "General product guidance"}
      </p>
      <GuidanceDocument document={regional ?? document} />
    </>
  );
}
