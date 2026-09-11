import type { Metadata } from "next";
import { RegionLink as Link } from "../ui/region-selector";
import { sources } from "../sources";
import { topics } from "../data";
import { Header, Footer } from "../ui/matrix";
export const metadata: Metadata = {
  title: "Reading room | Precip",
  description:
    "Seven starting references on precipitation downscaling, extremes, internal variability, rain-snow phase, and dependence.",
  openGraph: {
    title: "Reading room | Precip",
    description: "The evidence behind the field guide.",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Reading room | Precip",
    description: "The evidence behind the field guide.",
    images: [],
  },
};
export default function ReadingRoom() {
  return (
    <>
      <Header active="reading" />
      <main id="main" className="reading-page">
        <p className="eyebrow">02 / THE READING ROOM</p>
        <h1>Supporting literature</h1>
        <p className="article-intro">
          A starting bibliography, organized by the questions in the matrix.
          These studies explain methods and limitations. They are not a
          comprehensive review or a ranking of available products.
        </p>
        <div className="reading-list">
          {Object.entries(sources).map(([id, s], i) => (
            <section className="reading-card" key={id}>
              <span className="row-number">0{i + 1}</span>
              <div>
                <p className="reference-byline">
                  {s.authors} ({s.year}) · {s.journal}
                </p>
                <h2>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title} ↗
                  </a>
                </h2>
                <p>{s.support}</p>
                <p className="reference-scope">{s.scope}</p>
                <div className="topic-tags">
                  {topics
                    .filter((t) => t.sourceIds.includes(id))
                    .map((t) => (
                      <Link key={t.id} href={`/guidance/${t.id}#literature`}>
                        {t.short} ↗
                      </Link>
                    ))}
                </div>
                <a className="doi" href={`https://doi.org/${s.doi}`}>
                  DOI: {s.doi}
                </a>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
