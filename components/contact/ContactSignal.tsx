export function ContactSignal() {
  return (
    <div className="contact-signal" aria-hidden="true">
      <svg viewBox="0 0 560 172" fill="none">
        <path className="signal-guide" d="M24 47C99 47 110 139 198 139H501" />
        <path
          className="signal-stroke"
          pathLength="1"
          d="M24 47H92C166 47 137 117 205 117C280 117 245 25 320 25C392 25 372 117 447 117H526"
        />
        <circle className="signal-node signal-idea" cx="24" cy="47" r="5" />
        <circle
          className="signal-node signal-conversation"
          cx="320"
          cy="25"
          r="5"
        />
        <path className="signal-send" d="m512 107 15 10-15 10m-12-10h27" />
        <text x="24" y="80">
          IDEA
        </text>
        <text x="233" y="15">
          CONVERSATION
        </text>
        <text x="445" y="148">
          NEXT STEP
        </text>
      </svg>
    </div>
  );
}
