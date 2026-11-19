import Link from "next/link";
import { notFound } from "next/navigation";
import { testimonials } from "@/data/testimonials";
import { testimonialPages } from "@/data/testimonial-pages";
import { experienceMeta } from "@/data/experience";
import { absolute } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
export const dynamicParams = false;
export function generateStaticParams() {
  return testimonialPages.map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!testimonialPages.some((item) => item.slug === slug)) notFound();
  return experienceMeta(`/testimonials/${slug}/`);
}
export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = testimonialPages.find((item) => item.slug === slug);
  if (!publication) notFound();
  const person = testimonials.find(
    (item) => item.id === publication.testimonialId,
  )!;
  const video = person.video;
  if (!video) notFound();
  const path = `/testimonials/${slug}/`;
  const player =
    video.provider === "google-drive"
      ? `https://drive.google.com/file/d/${video.fileId}/preview`
      : undefined;
  const external =
    video.provider === "google-drive"
      ? `https://drive.google.com/file/d/${video.fileId}/view`
      : video.src;
  return (
    <ContentPage
      path={path}
      title={`${person.name}'s perspective.`}
      intro={`${person.role}, ${person.company} · Video testimonial about working with Hamid.`}
      label="Client perspective"
      crumbs={[
        { label: "Client perspectives", href: "/testimonials/" },
        { label: person.name, href: path },
      ]}
    >
      <div className="watch-layout">
        <div className="watch-player">
          {player ? (
            <iframe
              src={player}
              title={`Video testimonial — ${person.name}, ${person.company}`}
              width="360"
              height="640"
              allow="encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            video.provider !== "google-drive" && (
              <video controls playsInline preload="none" poster={video.poster}>
                <source src={video.src} />
                {video.captions && (
                  <track
                    kind="captions"
                    src={video.captions}
                    srcLang={video.captionsLanguage || "en"}
                    label={video.captionsLabel || "English"}
                  />
                )}
              </video>
            )
          )}
        </div>
        <div className="watch-context">
          <span className="eyebrow">In their own voice</span>
          <h2>{person.company}</h2>
          <p>
            Watch the supplied {video.durationLabel} recording from{" "}
            {person.name}. Use the player controls to start, pause or view the
            video fullscreen.
          </p>
          <a
            className="text-link"
            href={external}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the original recording
          </a>
          <div className="watch-next">
            <h3>Another perspective</h3>
            {testimonialPages
              .filter((item) => item.slug !== slug)
              .map((item) => (
                <Link
                  className="button button-outline"
                  href={`/testimonials/${item.slug}/`}
                  key={item.slug}
                >
                  Watch{" "}
                  {testimonials.find((t) => t.id === item.testimonialId)!.name}
                  's video
                </Link>
              ))}
          </div>
          <p className="tool-small">
            The client recordings are separate from the self-directed demo
            websites shown in the portfolio.
          </p>
        </div>
      </div>
      {publication.transcript && (
        <section
          className="content-section"
          lang={publication.transcriptLanguage || "en"}
        >
          <h2>Video transcript</h2>
          {publication.transcript.map((segment, index) => (
            <p key={index}>
              <span className="transcript-time">{segment.start}</span>{" "}
              {segment.text}
            </p>
          ))}
          {publication.translation && (
            <>
              <h3>English translation</h3>
              <p lang="en">{publication.translation}</p>
            </>
          )}
        </section>
      )}
      <div className="related-links">
        <Link href="/testimonials/">All client perspectives</Link>
        <Link href="/case-studies/">Project walkthroughs</Link>
        <Link href="/editorial-policy/">Content standards</Link>
      </div>
      <ProjectCta />
      {publication.thumbnail && publication.uploadDate && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "@id": absolute(`${path}#video`),
            name: `${person.name} — ${person.company} video testimonial`,
            description: `${person.name}, ${person.role} of ${person.company}, shares a perspective on working with Hamid.`,
            thumbnailUrl: absolute(publication.thumbnail),
            uploadDate: publication.uploadDate,
            duration: publication.duration,
            ...(player
              ? { embedUrl: player }
              : { contentUrl: absolute(external) }),
            mainEntityOfPage: { "@id": absolute(`${path}#webpage`) },
            ...(publication.transcript
              ? {
                  transcript: publication.transcript
                    .map((segment) => segment.text)
                    .join(" "),
                }
              : {}),
          }}
        />
      )}
    </ContentPage>
  );
}
