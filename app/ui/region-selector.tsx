"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  regions,
  validRegion,
  regionName,
  type RegionSelection,
} from "../regions";
import states from "../us-states.json";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("regionchange", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("regionchange", callback);
  };
}
function snapshot() {
  return validRegion(new URLSearchParams(window.location.search).get("region"));
}
export function useRegion() {
  // Re-read the URL after client navigation as well as browser history changes.
  usePathname();
  const region = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "all" as RegionSelection,
  );
  function setRegion(value: RegionSelection) {
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("region");
    else url.searchParams.set("region", value);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event("regionchange"));
  }
  return [region, setRegion] as const;
}
export function regionalHref(href: string, region: RegionSelection) {
  if (region === "all" || !href.startsWith("/")) return href;
  const [path, hash] = href.split("#");
  return `${path}${path.includes("?") ? "&" : "?"}region=${region}${hash ? `#${hash}` : ""}`;
}
export function RegionLink(props: React.ComponentProps<typeof Link>) {
  const [region] = useRegion();
  return (
    <Link
      {...props}
      href={
        typeof props.href === "string"
          ? regionalHref(props.href, region)
          : props.href
      }
    />
  );
}
export default function RegionSelector() {
  const [region, setRegion] = useRegion();
  return (
    <section className="region-selector" aria-label="Regional guidance filter">
      <div className="region-controls">
        <label className="filter-label" htmlFor="climate-region">
          Climate region
          <select
            id="climate-region"
            value={region}
            onChange={(e) => setRegion(validRegion(e.target.value))}
          >
            <option value="all">All regions (general guidance)</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <p role="status">
          {region === "all"
            ? "Showing general guidance."
            : `Showing guidance for ${regionName(region)}. General guidance remains where no regional entry is available.`}
        </p>
        <button
          type="button"
          className="region-reset"
          onClick={() => setRegion("all")}
          disabled={region === "all"}
        >
          Reset to all regions
        </button>
        <p className="map-caption">
          Broad{" "}
          <a
            href="https://nca5.climate.us/regions/"
            target="_blank"
            rel="noreferrer"
          >
            National Climate Assessment
          </a>{" "}
          groupings, shown for the 50 states and DC. Boundaries follow states,
          not local climate zones.
        </p>
      </div>
      <div className="region-map">
        <svg
          viewBox="0 0 975 610"
          role="group"
          aria-label="Select a US climate region. Alaska and Hawaii shown as insets."
        >
          {regions.map((r) => (
            <g
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={r.name}
              aria-pressed={region === r.id}
              className={`map-region ${region === r.id ? "selected" : ""}`}
              onClick={() => setRegion(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setRegion(r.id);
                }
              }}
            >
              <title>{r.name}</title>
              {r.states.map((id) => (
                <path key={id} d={states[id as keyof typeof states].path} />
              ))}
              <text x={r.label[0]} y={r.label[1]} textAnchor="middle">
                {r.short}
              </text>
            </g>
          ))}
        </svg>
        <div className="map-key" aria-hidden="true">
          {regions.map((r) => (
            <span key={r.id}>
              {r.short}: {r.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
