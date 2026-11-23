export function ContactAtmosphere() {
  return (
    <div className="contact-atmosphere" aria-hidden="true">
      <svg className="contact-upper-path" viewBox="0 0 420 270" fill="none">
        <path
          className="contact-path-light"
          d="M-35 254C79 117 282 129 313-35"
        />
        <path
          className="contact-path-line"
          pathLength="1"
          d="M-35 254C79 117 282 129 313-35"
        />
      </svg>
      <svg className="contact-rim-path" viewBox="0 0 220 380" fill="none">
        <path
          className="contact-path-light"
          d="M242-20C224 184 130 318-25 364"
        />
        <path
          className="contact-path-line"
          pathLength="1"
          d="M242-20C224 184 130 318-25 364"
        />
      </svg>
    </div>
  );
}

export function ContactMountainAccent() {
  return (
    <div className="contact-mountain" aria-hidden="true">
      <img
        src="/images/contact/stone-640.webp"
        srcSet="/images/contact/stone-640.webp 640w, /images/contact/stone-960.webp 960w"
        sizes="(max-width: 767px) 1px, (max-width: 1100px) 400px, 560px"
        width="960"
        height="640"
        alt=""
        decoding="async"
        loading="lazy"
      />
    </div>
  );
}
