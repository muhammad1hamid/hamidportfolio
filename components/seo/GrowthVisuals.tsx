import { ResponsiveImage } from "./ResponsiveImage";

export function GrowthSignal() {
  const image = "/images/growth/discovery-field-charcoal";
  return (
    <figure className="growth-signal">
      <ResponsiveImage
        src={`${image}.webp`}
        srcSet={`${image}-520.webp 520w, ${image}-900.webp 900w, ${image}.webp 1200w`}
        alt="Three rays of light converge through a bevelled glass pane"
        sizes="(max-width: 740px) 90vw, (max-width: 1480px) 42vw, 600px"
        width={1200}
        height={1200}
        loading="eager"
        fetchPriority="high"
      />
      <figcaption>
        <span className="growth-signal-caption">
          Illustrative discovery field
        </span>
        <div className="growth-signal-flow">
          <div>
            <a href="#search-foundations">Search</a>
            <a href="#answer-readiness">Answers</a>
            <a href="#ai-discoverability">AI Search</a>
          </div>
          <span className="growth-signal-beam" aria-hidden="true" />
          <span className="growth-signal-outcome">Useful visit</span>
        </div>
      </figcaption>
    </figure>
  );
}

const auditRows = [
  {
    page: "Service page",
    finding: "Two URLs point to the same service.",
    priority: "High",
    action: "Choose the preferred URL and align canonical and internal links.",
    check: "Inspect the live HTML, redirects and sitemap entry.",
  },
  {
    page: "Buying guide",
    finding: "The main buyer question is buried.",
    priority: "Medium",
    action: "Open with a direct answer and add useful evidence.",
    check: "Review the answer and its source in the published page.",
  },
  {
    page: "Contact page",
    finding: "The enquiry action is hard to see on mobile.",
    priority: "Medium",
    action: "Bring the contact action into view and clarify what to share.",
    check: "Follow the link on a phone and verify the draft opens.",
  },
];

const auditColumns = [
  ["page", "Page"],
  ["finding", "Finding"],
  ["priority", "Priority"],
  ["action", "Recommended action"],
  ["check", "How verified"],
] as const;

export function GrowthAuditPreview() {
  return (
    <table className="growth-audit" role="table" id="example-audit">
      <caption>
        <strong>Example audit walkthrough</strong>
        <span>Fictional findings · Illustrative sample</span>
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          {auditColumns.map(([key, label]) => (
            <th scope="col" key={key} role="columnheader">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {auditRows.map((row) => (
          <tr key={row.page} role="row">
            {auditColumns.map(([key, label]) => (
              <td key={key} role="cell">
                <span className="growth-audit-label" aria-hidden="true">
                  {label}
                </span>
                {key === "priority" ? (
                  <strong className="growth-priority">{row[key]}</strong>
                ) : (
                  row[key]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GrowthWorkstreamVisual({ id }: { id: string }) {
  switch (id) {
    case "search-foundations":
      return (
        <figure className="growth-specimen specimen-crawl">
          <figcaption>Sample crawl path</figcaption>
          <ol>
            <li>Page listed in the sitemap</li>
            <li>Follow the service link</li>
            <li>Check the preferred URL</li>
          </ol>
        </figure>
      );
    case "answer-readiness":
      return (
        <figure className="growth-specimen specimen-answer">
          <figcaption>Sample buyer question</figcaption>
          <p>“What should I bring to a website review?”</p>
          <strong>Your website, audience and one goal.</strong>
        </figure>
      );
    case "ai-discoverability":
      return (
        <figure className="growth-specimen specimen-entity">
          <figcaption>Illustrative evidence chain</figcaption>
          <div>
            <span>Business identity</span>
            <span>Service page</span>
          </div>
          <strong>Public evidence</strong>
        </figure>
      );
    case "conversion-paths":
      return (
        <figure className="growth-specimen specimen-path">
          <figcaption>Sample enquiry path</figcaption>
          <ol>
            <li>Read the scope</li>
            <li>Open contact</li>
            <li>Confirm the enquiry</li>
          </ol>
        </figure>
      );
    default:
      return (
        <figure className="growth-specimen specimen-measure">
          <figcaption>Sample review timeline</figcaption>
          <ol>
            <li>Capture the baseline</li>
            <li>Verify the change</li>
            <li>Review evidence</li>
          </ol>
        </figure>
      );
  }
}
