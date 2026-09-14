import Link from "next/link";
import { Header, Footer } from "./ui/matrix";
export default function NotFound() {
  return (
    <>
      <Header active="" />
      <main id="main" className="about-page">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>This guide is not here.</h1>
        <p className="article-intro">
          Return to the matrix to explore the five application guides.
        </p>
        <Link className="outline-link" href="/matrix">
          ← Back to the matrix
        </Link>
      </main>
      <Footer />
    </>
  );
}
