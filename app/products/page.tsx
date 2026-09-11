import ProductCatalog from "../ui/product-catalog";
import { Header, Footer } from "../ui/matrix";
export const metadata = {
  title: "Precipitation datasets | Precip",
  description:
    "Version-specific product metadata, documentation, and draft evaluation guidance.",
};
export default function Products() {
  return (
    <>
      <Header active="products" />
      <main id="main" className="reading-page">
        <h1>Precipitation datasets</h1>
        <p className="article-intro">
          Compare documented properties and evaluation guidance. All 28 dataset rows
          in the NCAR matrix are represented, alongside datasets from the workshop
          list. Browse projections, observations, reanalyses, and model ensembles
          using their familiar names. Some entries still need identification.
          Entries state their source scope, and recommendations remain draft until reviewed.
        </p>
        <ProductCatalog />
      </main>
      <Footer />
    </>
  );
}
