export function SignatureIntro() {
  return (
    <div id="hamid-origin" className="signature-intro">
      <div className="origin-curtain" aria-hidden="true">
        <span className="origin-placeholder">H</span>
      </div>
      <canvas
        className="origin-particles"
        width={1}
        height={1}
        aria-hidden="true"
        suppressHydrationWarning
      />
      <button type="button" id="hamid-origin-skip" className="origin-skip">
        Skip intro
      </button>
    </div>
  );
}
