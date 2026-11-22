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
          id="hero-eye-wash"
          x1="348"
          y1="0"
          x2="760"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--accent)" stopOpacity=".31" />
          <stop offset=".18" stopColor="var(--accent)" stopOpacity=".92" />
          <stop offset=".53" stopColor="var(--accent)" />
          <stop offset=".86" stopColor="var(--accent)" stopOpacity=".90" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity=".29" />
        </linearGradient>
      </defs>
      {/* The pupils in the original 1100px cutout sit at (487,398) and (622,396). */}
      <path
        className="hero-eye-ink"
        d="m350 414 23-10-8-1 19-7-6-1 23-7c44-15 88-23 129-28 61-8 142-10 189 3l20 5-4 2 16 4-8 2 15 6-7 2 8 6-12 3 9 5-11 4 10 4-14 4 7 3-18 4 5 3c-53-8-123-8-177-1-67 7-122 20-163 34l-27 10 4-6-13 3 11-7-16 1 13-7-9-2 7-6-15-1 10-7-13-1 12-6Z"
        fill="url(#hero-eye-wash)"
      />
      <g fill="var(--accent)" opacity=".29">
        <path d="m351 403 21-12 26-7-31 12-16 7Zm-2 46 19-6-14 8-5-2Zm375-93 22 7-11-1-11-6Zm21 61 18-7-6 6-12 1Zm-363 42 11-8 13-2-24 10Z" />
        <path d="M388 408c17-8 34-13 51-16l-59 19Zm304-41c12 0 28 3 36 7l-41-7Z" />
      </g>
    </svg>
  );
}
