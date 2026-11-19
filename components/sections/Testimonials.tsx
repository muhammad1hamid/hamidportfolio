"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { Arrow } from "@/components/ui/Arrow";

function ClientVideo({ testimonial }: { testimonial: Testimonial }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) video.current?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.current?.pause();
    });
    if (video.current) observer.observe(video.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  if (!testimonial.video || testimonial.video.provider === "google-drive")
    return null;
  const media = testimonial.video;
  return (
    <div className="testimonial-film">
      <video
        ref={video}
        controls
        playsInline
        preload="none"
        poster={media.poster}
        style={{ aspectRatio: media.aspectRatio || "9 / 16" }}
        aria-label={`Video testimonial from ${testimonial.name}`}
        onPlay={() =>
          document
            .querySelectorAll<HTMLVideoElement>(".testimonial-film video")
            .forEach((other) => {
              if (other !== video.current) other.pause();
            })
        }
        onError={() => setFailed(true)}
      >
        <source src={media.src} />
        {media.captions && (
          <track
            kind="captions"
            src={media.captions}
            srcLang={media.captionsLanguage || "en"}
            label={media.captionsLabel || "English"}
            default
          />
        )}
        Your browser does not support video playback.{" "}
        <a href={media.src}>Open the video</a>.
      </video>
      {failed && (
        <p role="status">
          This video couldn’t load.{" "}
          <a href={media.src}>Try opening the video</a>.
        </p>
      )}
      {media.transcript && (
        <details className="video-transcript">
          <summary>Read transcript</summary>
          <p>{media.transcript}</p>
        </details>
      )}
    </div>
  );
}

function DriveVideo({ testimonial }: { testimonial: Testimonial }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (testimonial.video?.provider !== "google-drive") return null;
  const media = testimonial.video;
  return (
    <div
      className="testimonial-portrait"
      style={{ aspectRatio: media.aspectRatio }}
    >
      {!loaded && !failed && (
        <span className="testimonial-loading" role="status">
          Loading video…
        </span>
      )}
      <iframe
        src={`https://drive.google.com/file/d/${media.fileId}/preview`}
        title={`Video testimonial — ${testimonial.name}, ${testimonial.company}`}
        width="360"
        height="640"
        loading="lazy"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
      {failed && (
        <p className="testimonial-loading" role="status">
          The player couldn’t load. Use the video link below.
        </p>
      )}
    </div>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  if (!testimonials.length) return null;
  const current = testimonials[active];
  const change = (step: number) =>
    setActive(
      (index) => (index + step + testimonials.length) % testimonials.length,
    );
  const driveUrl =
    current.video?.provider === "google-drive"
      ? `https://drive.google.com/file/d/${current.video.fileId}/view`
      : null;
  return (
    <section
      id="testimonials"
      className="testimonials testimonials-v2 testimonial-stories wrap"
      aria-labelledby="testimonials-title"
    >
      <div className="section-marker" data-reveal>
        <span>Client stories</span>
        <span>The people behind the projects</span>
      </div>
      <div
        className="testimonial-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="Client video testimonials"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            change(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            change(-1);
          }
        }}
      >
        <div className="testimonial-editorial">
          <span className="testimonial-kicker">
            <i aria-hidden="true" /> A few words from the other side
          </span>
          <h2 id="testimonials-title">
            Good work.
            <br />
            <em>In their own words.</em>
          </h2>
          <p>
            Hear from the founders I’ve worked with. Their experience, in their
            own voice.
          </p>
          <div
            className="testimonial-selectors"
            role="group"
            aria-label="Choose a client story"
          >
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                aria-pressed={active === index}
                aria-controls="testimonial-current"
                aria-label={`Show ${testimonial.name} video testimonial`}
                onClick={() => setActive(index)}
              >
                <span className="testimonial-initials" aria-hidden="true">
                  {testimonial.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="testimonial-selector-name">
                  {testimonial.name}
                  <small>{testimonial.company}</small>
                </span>
                <span className="testimonial-selector-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
          <span className="testimonial-editorial-note">
            Two founder stories. A personal perspective.
          </span>
          <Link className="testimonial-watch-link" href="/testimonials/">
            Explore both client perspectives
          </Link>
        </div>
        <div className="testimonial-showcase">
          <div className="testimonial-film-label" aria-hidden="true">
            <span>
              <i /> Client perspective
            </span>
            <span>{current.video?.durationLabel}</span>
          </div>
          <figure
            id="testimonial-current"
            role="group"
            aria-roledescription="slide"
            aria-label={`${active + 1} of ${testimonials.length}: ${current.name}`}
          >
            {current.video?.provider === "google-drive" ? (
              <DriveVideo key={current.id} testimonial={current} />
            ) : (
              <ClientVideo key={current.id} testimonial={current} />
            )}
            {current.quote && <blockquote>“{current.quote}”</blockquote>}
            <figcaption>
              <strong>{current.name}</strong>
              <span>
                {[current.role, current.company].filter(Boolean).join(" · ")}
              </span>
            </figcaption>
          </figure>
          <div
            className="testimonial-controls"
            onTouchStart={(event) => {
              gesture.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
              };
            }}
            onTouchEnd={(event) => {
              if (!gesture.current) return;
              const dx = event.changedTouches[0].clientX - gesture.current.x;
              const dy = event.changedTouches[0].clientY - gesture.current.y;
              gesture.current = null;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5)
                change(dx < 0 ? 1 : -1);
            }}
            onTouchCancel={() => {
              gesture.current = null;
            }}
          >
            <button
              onClick={() => change(-1)}
              aria-label="Previous video testimonial"
              aria-controls="testimonial-current"
            >
              <Arrow />
            </button>
            <div className="testimonial-position">
              <span>{String(active + 1).padStart(2, "0")}</span>
              <span className="testimonial-position-line" aria-hidden="true" />
              <span>{String(testimonials.length).padStart(2, "0")}</span>
            </div>
            <button
              onClick={() => change(1)}
              aria-label="Next video testimonial"
              aria-controls="testimonial-current"
            >
              <Arrow />
            </button>
            <span
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Showing {current.name}, {current.company}. Video {active + 1} of{" "}
              {testimonials.length}.
            </span>
          </div>
          <div className="testimonial-player-footer">
            <span className="testimonial-swipe-hint">
              Swipe the counter to switch
            </span>
            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${current.name}'s video in Google Drive (new tab)`}
              >
                Open video <Arrow diagonal />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
