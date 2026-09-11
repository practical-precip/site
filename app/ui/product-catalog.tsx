"use client";
import { useState } from "react";
import { products } from "../data";
import { RegionLink as Link } from "./region-selector";
const labels: Record<string,string> = {
  "downscaled-projection": "Downscaled projections",
  "historical-simulation": "Historical simulations and weather systems",
  observation: "Observations and derived analyses",
  reanalysis: "Reanalyses and forcing systems",
  "model-ensemble": "Model ensembles",
  collection: "Collections and programs",
  unresolved: "Names awaiting identification",
};
export default function ProductCatalog() {
  const [query,setQuery]=useState("");
  const [kind,setKind]=useState("all");
  const matches=products.filter(p=>(kind==="all"||p.kind===kind)&&[p.name,...p.aliases,p.provider,p.summary].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  return <>
    <div className="catalog-controls">
      <label>Find a dataset<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, acronym, or provider" /></label>
      <label>Dataset type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All types</option>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    </div>
    <p role="status">{matches.length} of {products.length} records</p>
    <div className="reading-list">{matches.map(p=><section className="product-card" key={p.id}>
      <h2><Link href={`/products/${p.id}`}>{p.name}</Link></h2>
      <p>{p.summary}</p>
      <p><strong>{labels[p.kind]}</strong>{p.aliases.length ? ` | Also known as: ${p.aliases.join(", ")}` : ""}</p>
      <dl><dt>Version scope</dt><dd>{p.version}</dd><dt>Resolution</dt><dd>{p.coverage.grid_spacing.value ?? "Not established"} {p.coverage.grid_spacing.unit}; {p.coverage.timestep}</dd></dl>
    </section>)}</div>
    {matches.length===0&&<p>No match. Try another name or choose all dataset types.</p>}
    <p><a href="https://github.com/practical-precip/datasets/blob/main/INDEX.md">Edit a dataset or suggest a correction</a></p>
  </>;
}
