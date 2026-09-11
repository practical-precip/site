import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { assetPath } from "../site-paths";
import { RegionLink } from "./region-selector";
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { trust: false }]]}
        skipHtml
        components={{
          a: ({ href, children }) =>
            href?.startsWith("/") ? (
              <RegionLink href={href}>{children}</RegionLink>
            ) : (
              <a
                href={href}
                target={href?.startsWith("https:") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {children}
              </a>
            ),
          // Local assets need the repository prefix on GitHub Pages.
          img: ({ src, alt }) => (
            // Markdown images have author-defined dimensions and are served as static assets.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                typeof src === "string" && src.startsWith("/")
                  ? assetPath(src)
                  : src
              }
              alt={alt ?? ""}
              loading="lazy"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
