import { notFound } from "next/navigation";
import { products, topics } from "../../data";
import { sources } from "../../sources";
import { Header, Footer } from "../../ui/matrix";
import { RegionLink as Link } from "../../ui/region-selector";
import ProductGuidance from "../../ui/product-guidance";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ product: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const entry = products.find((p) => p.id === product);
  return { title: `${entry?.name ?? "Product not found"} | Precip` };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const p = products.find((p) => p.id === product);
  if (!p) notFound();
  const rows: [string, string][] = [
    ["Provider", p.provider],
    ["Also known as", p.aliases.join(", ") || "No alternate names recorded"],
    ["Dataset type", p.kind.replaceAll("-", " ")],
    ["Version scope", p.version],
    ["Source scope", p.source_scope],
    ["CMIP generation", p.generation.join(", ") || "Not documented"],
    ["Creation date", p.dates.created ?? "Not documented"],
    ["Release date", p.dates.released ?? "Not documented"],
    ["Related publication date", p.dates.publication ?? "Not documented"],
    ["Date context", p.dates.notes],
    ["Metadata checked", p.verified_on],
    ["Method", `${p.method.family}: ${p.method.description}`],
    ["Reference data", p.method.reference_dataset],
    ["Training period", p.method.training_period],
    ["Spatial extent", p.coverage.domain],
    ["Grid", p.coverage.grid],
    [
      "Spatial resolution",
      `${p.coverage.grid_spacing.value ?? "Not established"} ${p.coverage.grid_spacing.unit}`,
    ],
    ["Temporal resolution", p.coverage.timestep],
    ["Historical period", p.coverage.historical],
    ["Future period", p.coverage.future],
    ["Scenarios", p.coverage.scenarios.join(", ")],
    ["Calendar", p.coverage.calendar],
    [
      "Driving models",
      `${p.ensemble.driving_models}; ${p.ensemble.model_count ?? "count not recorded"}`,
    ],
    ["Initial-condition members", p.ensemble.members],
    ["File format", p.access.format],
    ["Subsetting", p.access.subsetting],
    ["Cost", p.access.cost],
    ["License", p.access.license],
  ];
  return (
    <>
      <Header active="products" />
      <main id="main" className="reading-page">
        <div className="breadcrumb">
          <Link href="/products">Product catalog</Link>
        </div>
        <h1>{p.name}</h1>
        <p className="article-intro">{p.summary}</p>
        <dl className="product-metadata">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <section className="guidance-section">
          <h2>Variables</h2>
          {p.coverage.variables.map((v) => (
            <p key={v.name}>
              <strong>{v.name}</strong>: {v.unit}. {v.description}
            </p>
          ))}
        </section>
        <section className="guidance-section" id="ensemble-members">
          <h2>Ensemble members per GCM</h2>
          {p.ensemble.member_counts.length === 0 && (
            <p>Counts by model have not been documented here. See the ensemble description above.</p>
          )}
          {p.ensemble.member_counts.map((m) => (
            <p key={m.model}>
              <strong>{m.model}</strong>: {m.count ?? "Count not documented"}. {m.scope}{" "}
              <a href={m.source_url}>Source</a>
            </p>
          ))}
        </section>
        <section className="guidance-section" id="existing-uses">
          <h2>Existing uses</h2>
          {p.existing_uses.length === 0 && <p>No documented uses have been entered.</p>}
          {p.existing_uses.map((u) => <p key={u.url}>{u.description} <a href={u.url}>Source</a></p>)}
        </section>
        <section className="guidance-section" id="funding">
          <h2>Funding</h2>
          {p.funding.length === 0 && <p>Funding agencies have not been documented here.</p>}
          {p.funding.map((f, i) => (
            <p key={`${f.agency}-${i}`}>
              <strong>{f.agency}</strong>{f.award ? ` (${f.award})` : ""}. {f.notes}{" "}
              <a href={f.source_url}>Source</a>
            </p>
          ))}
        </section>
        <section className="guidance-section" id="associated-resources">
          <h2>Associated resources</h2>
          {p.associated_resources.length === 0 && <p>No associated resources have been entered.</p>}
          {p.associated_resources.map((r, i) => (
            <p key={`${r.url}-${i}`}><a href={r.url}>{r.label}</a>: {r.description}</p>
          ))}
        </section>
        <section className="guidance-section">
          <h2>Access and documentation</h2>
          <p>
            <a href={p.access.landing_page}>Provider documentation</a> |{" "}
            <a href={p.access.data}>Access information</a>
            {p.access.license_url && (
              <>
                {" "}
                | <a href={p.access.license_url}>License</a>
              </>
            )}
          </p>
          {p.metadata_sources.map((s) => (
            <p key={s.url}>
              <a href={s.url}>{s.locator}</a>
            </p>
          ))}
        </section>
        <section className="guidance-section">
          <h2>Recommendations and expert guidance</h2>
          <ProductGuidance document={p.guidance} />
        </section>
        <section className="guidance-section">
          <h2>Papers</h2>
          {p.references.length === 0 && <p>No bibliography entries have been added. Related publications and reports may be linked under associated resources.</p>}
          {p.references.map((id) => (
            <p key={id}>
              <a href={sources[id].url}>
                {sources[id].authors} ({sources[id].year}): {sources[id].title}
              </a>
            </p>
          ))}
        </section>
        <section className="guidance-section">
          <h2>Related evaluation guidance</h2>
          {p.relevant_rows.map((id) => (
            <p key={id}>
              <Link href={`/guidance/${id}`}>
                {topics.find((t) => t.id === id)?.title}
              </Link>
            </p>
          ))}
        </section>
        <p className="contribution-note">
          <a
            href={`https://github.com/practical-precip/datasets-and-guidance/edit/main/datasets/${p.id}.nt`}
          >
            Edit metadata (invited contributors)
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
