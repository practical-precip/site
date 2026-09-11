import type { Metadata } from "next";
import { columns, priorities } from "../data";
import { Header, Footer } from "../ui/matrix";
export const metadata: Metadata = {
  title: "About the guide | Precip",
  description:
    "How to interpret the provisional precipitation downscaling matrix, its scope, and its evidence.",
  openGraph: {
    title: "About the guide | Precip",
    description: "Scope, interpretation, and evidence status.",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "About the guide | Precip",
    description: "Scope, interpretation, and evidence status.",
    images: [],
  },
};
export default function About() {
  return (
    <>
      <Header active="about" />
      <main id="main" className="about-page">
        <p className="eyebrow">03 / ABOUT THE GUIDE</p>
        <h1>Scope and interpretation</h1>
        <p className="article-intro">
          This field guide translates a workshop matrix into practical questions
          for technical users of downscaled precipitation. Rows describe
          application needs. Columns describe general properties of products.
        </p>
        <section className="guidance-section" id="evidence">
          <h2>How to read the matrix</h2>
          <p>
            Each cell tells you what to investigate at that intersection. The
            label indicates the suggested priority of the check, not whether any
            product passes it.
          </p>
          <dl className="priority-definitions">
            {Object.entries(priorities).map(([id, p]) => (
              <div key={id}>
                <dt className={id}>
                  {p.symbol} {p.label}
                </dt>
                <dd>{p.description}</dd>
              </div>
            ))}
          </dl>
          <p>
            Click a cell for a short summary and suggested check. Follow its
            link to the relevant section of an application guide, including an
            illustrative figure and supporting literature.
          </p>
        </section>
        <section className="guidance-section">
          <h2>What is established, and what is provisional?</h2>
          <p>
            The literature summaries describe findings from linked studies.
            Applying those ideas to the matrix is an editorial synthesis.
            Priority labels and suggested checks have not been reviewed by
            workshop participants or calibrated against product benchmarks.
          </p>
          <p>
            The figures use synthetic data to isolate a concept. They contain no
            measured skill scores, observations, or output from named
            downscaling products.
          </p>
          <p>
            The handwritten sketch includes an example caution about STAR and
            spatial coherence. That product-specific statement needs an exact
            product identity, version, evaluation region, and supporting
            evidence before it can become a recommendation here. The sketch&apos;s
            broad annual-precipitation reassurance is also treated as a prompt
            for evaluation, not a universal endorsement.
          </p>
        </section>
        <section className="guidance-section">
          <h2>The six product properties</h2>
          <dl className="glossary">
            {columns.map((c) => (
              <div key={c.id}>
                <dt>{c.title}</dt>
                <dd>{c.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="guidance-section">
          <h2>Before using a product in an analysis</h2>
          <ol className="numbered-list">
            <li>
              Define the precipitation statistic, units, spatial support,
              accumulation interval, and planning horizon.
            </li>
            <li>
              Record product version, driving models, initial-condition members,
              scenarios, downscaling method, and bias-adjustment reference.
            </li>
            <li>
              Evaluate the application metrics against suitable observations.
              Account for uncertainty in the reference and reserve independent
              evaluation data where possible.
            </li>
            <li>
              Document failures and uncertainty alongside successful checks.
              Historical agreement does not by itself validate future changes.
            </li>
          </ol>
        </section>
        <section className="guidance-section">
          <h2>From workshop guidance to benchmarks</h2>
          <p>
            A future benchmark entry should identify the exact product version,
            region, evaluation period, metric, reference dataset, uncertainty,
            reproducible analysis, and review date. Until those records exist,
            this website remains a qualitative guide.
          </p>
          <p className="draft-note">
            Initial draft prepared September 2026. The reading list is selective
            and is not a claim of current product coverage.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
