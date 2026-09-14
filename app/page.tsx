import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "./ui/matrix";

export const metadata: Metadata = {
  title: "Practical Precip (working title)",
  description:
    "Curated metadata and expert guidance on using historical and projected precipitation datasets",
  openGraph: {
    title: "Practical Precip (working title)",
    description:
      "Curated metadata and expert guidance on using historical and projected precipitation datasets",
  },
  twitter: {
    title: "Practical Precip (working title)",
    description:
      "Curated metadata and expert guidance on using historical and projected precipitation datasets",
  },
};

export default function Home() {
  return (
    <>
      <Header active="home" />
      <main id="main" className="landing-page">
        <section className="landing-intro" aria-labelledby="landing-title">
          <h1 id="landing-title">Practical Precip (working title)</h1>
          <p>
            Curated metadata and expert guidance on using historical and
            projected precipitation datasets
          </p>
        </section>
        <section className="landing-choices" aria-labelledby="landing-choices-title">
          <h2 id="landing-choices-title">What are you looking for?</h2>
          <div className="landing-cards">
            <Link className="landing-card" href="/general-information">
              <h3>General information</h3>
              <p>Dan&apos;s outline will be linked here when it is available.</p>
              <span className="landing-card-arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="landing-card" href="/matrix">
              <h3>What dataset should I use?</h3>
              <p>Explore expert guidance by application and region.</p>
              <span className="landing-card-arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="landing-card" href="/products">
              <h3>Detailed information on each dataset</h3>
              <p>Browse dataset details and links to source documentation.</p>
              <span className="landing-card-arrow" aria-hidden="true">↗</span>
            </Link>
            <a
              className="landing-card"
              href="https://github.com/practical-precip/datasets-and-guidance/tree/main"
            >
              <h3>Get involved</h3>
              <p>Invited contributors can edit metadata and guidance on GitHub.</p>
              <span className="landing-card-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
