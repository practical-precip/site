import { publishedSiteUrl } from "./site-paths";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(publishedSiteUrl),
  title: "Precip | A precipitation downscaling field guide",
  description:
    "An application-first cheatsheet for evaluating precipitation downscaling products. Explore product properties, practical checks, and supporting literature.",
  openGraph: {
    title: "Precip | A precipitation downscaling field guide",
    description: "Start with your application. Know what to check.",
    images: [
      {
        url: `${publishedSiteUrl}/og.png`,
        width: 1730,
        height: 909,
        alt: "Precip: A precipitation downscaling field guide. Start with your application.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precip | A precipitation downscaling field guide",
    description: "Start with your application. Know what to check.",
    images: [`${publishedSiteUrl}/og.png`],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
