"use client";
import {
  columns,
  priorities,
  resolveCell,
  hasRegionalGuidance,
  type Cell,
} from "../data";
import { regionName } from "../regions";
import GuidanceDocument from "./guidance-document";
import RegionSelector, { useRegion } from "./region-selector";
export default function GuidanceCells({ cells }: { cells: Cell[] }) {
  const [region] = useRegion();
  return (
    <>
      <RegionSelector />
      {columns.map((col, i) => {
        const cell = resolveCell(cells[i], region);
        return (
          <section className="guidance-section" id={col.id} key={col.id}>
            <div className="section-kicker">
              <span>
                0{i + 1} / {col.title}
              </span>
              <span className={`status-badge ${cell.priority}`}>
                {priorities[cell.priority].symbol}{" "}
                {priorities[cell.priority].label}
              </span>
            </div>
            {region !== "all" && (
              <p className="regional-scope">
                {hasRegionalGuidance(cells[i], region)
                  ? `${regionName(region)} guidance`
                  : "General guidance (no regional entry)"}
              </p>
            )}
            <h2>{cell.title}</h2>
            <GuidanceDocument document={cell} />
            <dl className="property-definition">
              <dt>Product property</dt>
              <dd>{col.definition}</dd>
            </dl>
          </section>
        );
      })}
    </>
  );
}
