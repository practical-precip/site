import type { GuidanceContent } from "../data";
import { sources } from "../sources";
import Markdown from "./markdown";
export default function GuidanceDocument({
  document,
}: {
  document: GuidanceContent;
}) {
  return (
    <div className="guidance-document">
      <p className="review-status">
        {document.review.status === "expert-reviewed"
          ? `Expert reviewed by ${document.review.reviewed_by?.join(", ")} (${document.review.reviewed_on})`
          : "Draft guidance; expert review pending"}
      </p>
      <Markdown>{document.body}</Markdown>
      <div className="published-evidence">
        <h3>Published evidence</h3>
        {document.evidence.length === 0 ? (
          <p>No published finding has been entered for this guidance.</p>
        ) : (
          document.evidence.map((e, i) => {
            const paper = sources[e.paper];
            return (
              <div className="evidence-entry" key={i}>
                <p>{e.statement}</p>
                <a href={paper.url} target="_blank" rel="noreferrer">
                  {paper.authors} ({paper.year}): {paper.title}
                </a>
                <p className="reference-scope">
                  {e.locator}. Scope: {e.scope}
                </p>
              </div>
            );
          })
        )}
      </div>
      <p className="contribution-note">
        Contributors: {document.review.contributors.join(", ")}. Updated{" "}
        {document.review.updated}.
        {document.contentFile && (
          <>
            {" "}
            <a
              href={`https://github.com/practical-precip/${document.contentFile.startsWith("product-guidance/") ? "datasets" : "guidance"}/edit/main/${document.contentFile}`}
              target="_blank"
              rel="noreferrer"
            >
              View or edit this Markdown file
            </a>
          </>
        )}
      </p>
    </div>
  );
}
