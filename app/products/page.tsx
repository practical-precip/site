import { products } from "../data";
import { Header, Footer } from "../ui/matrix";
import { RegionLink as Link } from "../ui/region-selector";
export const metadata = {
  title: "Downscaled precipitation products | Precip",
  description:
    "Version-specific product metadata, documentation, and draft evaluation guidance.",
};
export default function Products() {
  return (
    <>
      <Header active="products" />
      <main id="main" className="reading-page">
        <h1>Downscaled precipitation products</h1>
        <p className="article-intro">
          Compare documented properties and evaluation guidance. All 28 dataset rows
          in the NCAR matrix are represented by 31 family and variant records,
          including historical comparators. Some details rely on the matrix alone.
          Entries state their source scope, and recommendations remain draft until reviewed.
        </p>
        <div className="reading-list">
          {products.map((p) => (
            <section className="product-card" key={p.id}>
              <h2>
                <Link href={`/products/${p.id}`}>{p.name}</Link>
              </h2>
              <p>{p.summary}</p>
              <dl>
                <dt>Version scope</dt>
                <dd>{p.version}</dd>
                <dt>Resolution</dt>
                <dd>
                  {p.coverage.grid_spacing.value} {p.coverage.grid_spacing.unit}
                  ; {p.coverage.timestep}
                </dd>
                <dt>Source scope</dt>
                <dd>{p.source_scope}</dd>
                <dt>Metadata checked</dt>
                <dd>{p.verified_on}</dd>
              </dl>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
