import { assetPath } from "../../site-paths";
import type { Metadata } from "next";
import { RegionLink as Link } from "../../ui/region-selector";
import GuidanceCells from "../../ui/guidance-cells";
import { notFound } from "next/navigation";
import { columns, topics } from "../../data";
import { sources, type SourceId } from "../../sources";
import { Header, Footer } from "../../ui/matrix";
export const dynamicParams = false;
export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: id } = await params;
  const t = topics.find((t) => t.id === id);
  if (!t) return { title: "Guidance not found | Precip" };
  const title = `${t.title} | Precip`;
  return {
    title,
    description: t.intro,
    openGraph: { title, description: t.intro, images: [] },
    twitter: { card: "summary", title, description: t.intro, images: [] },
  };
}
export default async function Guidance({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: id } = await params;
  const topic = topics.find((t) => t.id === id);
  if (!topic) notFound();
  const figure = topic.figure;
  return (
    <>
      <Header active="guidance" />
      <main id="main" className="article-shell">
        <div className="breadcrumb">
          <Link href="/">The matrix</Link>
          <span>/</span>
          {topic.short}
        </div>
        <div className="article-grid">
          <aside className="article-nav">
            <p className="tiny-label">IN THIS GUIDE</p>
            <a href="#overview">The application</a>
            {columns.map((c) => (
              <a key={c.id} href={`#${c.id}`}>
                {c.title}
              </a>
            ))}
            {figure && <a href="#figure">Illustrative figure</a>}
            <a href="#literature">Supporting literature</a>
            <hr />
            <Link href="/">← Back to the matrix</Link>
          </aside>
          <article>
            <header className="article-hero" id="overview">
              <p className="eyebrow">APPLICATION GUIDE / {topic.use}</p>
              <h1>{topic.title}</h1>
              <p className="article-intro">{topic.intro}</p>
              <div className="evidence-banner">
                <span className="note-mark">i</span>
                <p>
                  Draft synthesis. The checks and priority labels below are
                  suggested evaluation criteria. Linked studies support the
                  scientific context, not individual product ratings.
                </p>
              </div>
            </header>
            <section className="metrics">
              <p className="tiny-label">START WITH THESE DIAGNOSTICS</p>
              <div>
                {topic.metrics.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </section>
            <GuidanceCells cells={topic.cells} />
            {figure && (
              <section id="figure" className="guidance-section">
                <p className="eyebrow">ILLUSTRATION / NOT PRODUCT BENCHMARKS</p>
                <h2>{figure.title}</h2>
                <figure>
                  <a
                    href={assetPath(figure.image)}
                    aria-label={`Open full-size figure: ${figure.title}`}
                  >
                    <img
                      src={assetPath(figure.image)}
                      width="1200"
                      height="620"
                      alt={figure.alt}
                    />
                  </a>
                  <figcaption>
                    {figure.caption}{" "}
                    {figure.data && (
                      <a href={assetPath(figure.data)}>Download example data</a>
                    )}
                  </figcaption>
                </figure>
                <p className="figure-provenance">
                  {figure.provenance}{" "}
                  {figure.code && (
                    <a href={assetPath(figure.code)} download>
                      Download plotting script
                    </a>
                  )}
                </p>
              </section>
            )}
            <section id="literature" className="guidance-section">
              <p className="eyebrow">EVIDENCE & LIMITS</p>
              <h2>Supporting literature</h2>
              {topic.sourceIds.map((id) => {
                const s = sources[id as SourceId];
                return (
                  <div className="reference" key={id}>
                    <p className="reference-byline">
                      {s.authors} ({s.year}) · {s.journal}
                    </p>
                    <h3>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title} ↗
                      </a>
                    </h3>
                    <p>{s.support}</p>
                    <p className="reference-scope">
                      <strong>Scope:</strong> {s.scope}
                    </p>
                  </div>
                );
              })}
            </section>
            <div className="next-guides">
              <p className="tiny-label">EXPLORE ANOTHER APPLICATION</p>
              <div>
                {topics
                  .filter((t) => t.id !== id)
                  .map((t) => (
                    <Link key={t.id} href={`/guidance/${t.id}`}>
                      {t.short} ↗
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
