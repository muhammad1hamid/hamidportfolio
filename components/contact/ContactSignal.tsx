export function ContactSignal() {
  return (
    <div className="contact-signal" aria-hidden="true">
      <svg viewBox="0 0 560 100" fill="none">
        <path
          className="signal-guide"
          d="M-80 64C88 194 166-60 309 34S472 90 548 18"
        />
        <path
          className="signal-stroke"
          pathLength="1"
          d="M-80 64C88 194 166-60 309 34S472 90 548 18"
        />
        <circle className="signal-node" cx="548" cy="18" r="4.5" />
      </svg>
    </div>
  );
}
