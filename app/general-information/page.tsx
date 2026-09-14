import Link from "next/link";
import { Header, Footer } from "../ui/matrix";

export default function GeneralInformationPage() {
  return (
    <>
      <Header active="home" />
      <main id="main" className="landing-page placeholder-page">
        <p className="eyebrow">GENERAL INFORMATION</p>
        <h1>Dan&apos;s outline is coming soon.</h1>
        <p>This page will link to the outline when it is ready.</p>
        <Link className="outline-link" href="/">Back to Practical Precip →</Link>
      </main>
      <Footer />
    </>
  );
}
