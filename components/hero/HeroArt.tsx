export function HeroDoodles() {
  return (
    <div className="hero-doodles" aria-hidden="true">
      <svg
        className="hero-doodle hero-doodle-rocket"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M39 76C47 49 66 28 88 21c1 23-10 44-33 63l-16-8Z" />
        <path d="M72 29c5 4 10 7 15 9M44 63c-3-4-9-2-14 1l-11 14 17-2m25-1c3 6-1 14-5 19l-7-11M39 75l-9 8 12 8 8-9" />
        <path d="M65 50c2-4 6-5 9-3s3 6 1 8-5 3-8 1-3-4-2-6Z" />
        <path d="M49 76c8-6 17-14 22-21" strokeOpacity=".44" />
        <path
          className="hero-doodle-accent"
          d="m104 13-12 10m15 2-12 4m8 8-9-1M27 87 12 104m20-12-22 27m31-23-13 16"
          stroke="var(--accent)"
          strokeWidth="1.3"
        />
      </svg>
      <svg
        className="hero-doodle hero-doodle-plane"
        viewBox="0 0 164 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="m77 33 69-22-27 48-20-18-6 11-2-13-14-6Z" />
        <path d="m91 39 55-28-47 30m-6 11 13-5" />
        <path
          d="M90 55c-23 3-42 11-47 30-5 19-1 32-22 47"
          strokeOpacity=".65"
          strokeDasharray="5 7"
        />
        <path
          className="hero-doodle-accent"
          d="m137 57 8 5m-12 0 7 8m-13-6 3 8"
          stroke="var(--accent)"
          strokeWidth="1.3"
        />
      </svg>
      <svg
        className="hero-doodle hero-doodle-code"
        viewBox="0 0 86 77"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="m7 30 43-11 11 29-45 13-9-31Zm9 31 25 4 35-11-15-6m-45 13 1 4 25 4 35-12-1-3m-51 3 14 2 19-6" />
        <path d="m24 38-4 5 6 3m12-12 6 2-4 6m-7-8-3 15" />
        <path d="m10 33 6 21" strokeOpacity=".46" />
        <path
          className="hero-doodle-accent"
          d="m59 18 7-9m-5 13 12-8m-11 13 10-4"
          stroke="var(--accent)"
          strokeWidth="1.25"
        />
      </svg>
      <svg
        className="hero-doodle hero-doodle-bulb"
        viewBox="0 0 93 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M56 24c10 4 15 13 14 24-2 12-12 14-17 24l-16-7c4-11-4-16-2-25 2-12 11-20 21-16Z" />
        <path d="m37 65-4 11 17 7 4-11m-18 0 14 6m-14 0-1 6 10 4 4-6m-4-14c4-8 8-13 13-16m-9 15c-2-8-1-14 1-17" />
        <path
          className="hero-doodle-accent"
          d="M50 49c-5-3-2-7 0-6 2 0 2 3 1 7 3-2 6-4 8-1 2 4-3 6-7 5M26 37l-8-3m9-8-6-6m14-1-2-8m12 6 2-9m12 9 5-7m5 13 8-6m0 15 9-3m-8 16 10 2m-13 9 8 6"
          stroke="var(--accent)"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
}

export function PortraitEyeBrush() {
  return (
    <svg
      className="hero-eye-brush"
      viewBox="0 0 1100 1100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="hero-eye-fade"
          x1="348"
          y1="0"
          x2="760"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset=".12" stopColor="white" stopOpacity=".18" />
          <stop offset=".24" stopColor="white" stopOpacity=".64" />
          <stop offset=".34" stopColor="white" stopOpacity=".97" />
          <stop offset=".65" stopColor="white" stopOpacity=".97" />
          <stop offset=".77" stopColor="white" stopOpacity=".64" />
          <stop offset=".91" stopColor="white" stopOpacity=".16" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask
          id="hero-eye-mask"
          x="340"
          y="340"
          width="430"
          height="130"
          maskUnits="userSpaceOnUse"
        >
          <rect
            x="340"
            y="340"
            width="430"
            height="130"
            fill="url(#hero-eye-fade)"
          />
        </mask>
      </defs>
      {/* The pupils in the original 1100px cutout sit at (487,398) and (622,396). */}
      <g mask="url(#hero-eye-mask)" fill="var(--accent)">
        <path
          className="hero-eye-ink"
          d="m350 381 23-5-8-3 24-2-8-3 26 1c77-3 163-2 239-2l67 1 20 4-5 2 17 3-8 2 15 4-7 3 12 5-12 3 8 5-10 4 9 4-13 4 8 3-20 3 5 3c-80-1-163 1-239 0l-90-1-22 3 5-5-14 3 8-6-13 1 11-6-10-2 8-5-14-2 10-5-12-3 12-6Z"
        />
        <g opacity=".23">
          <path d="m350 377 21-5 28-2-32 6-17 1Zm0 44 20-2-15 5-5-3Zm375-53 23 5-12 1-11-6Zm19 51 18-3-7 5-11-2Zm-362 10 12-4 13 1-25 3Z" />
          <path d="M389 383c17-4 34-5 51-4l-59 6Zm303-13c12-1 27 0 36 3l-41-1Z" />
        </g>
      </g>
    </svg>
  );
}
