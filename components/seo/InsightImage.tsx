import { insightCover, type Insight } from "@/data/insights";
import { ResponsiveImage } from "./ResponsiveImage";

export function InsightImage({
  insight,
  sizes,
  priority = false,
}: {
  insight: Insight;
  sizes: string;
  priority?: boolean;
}) {
  const { slug, cover } = insight;
  return (
    <div className="insight-poster" data-tone={cover.tone}>
      <ResponsiveImage
        src={insightCover(slug)}
        srcSet={`/images/responsive/insight-${slug}-480.webp 480w, /images/responsive/insight-${slug}-768.webp 768w, ${insightCover(slug)} 1200w`}
        alt={cover.alt}
        width={1200}
        height={675}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      {cover.poster.length > 0 && (
        <div className="insight-poster-type" aria-hidden="true">
          <span className="insight-poster-mark">Hamid / Insights</span>
          <span className="insight-poster-title">
            {cover.poster.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
