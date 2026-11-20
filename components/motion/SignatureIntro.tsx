export function SignatureIntro() {
  return (
    <div id="hamid-origin" className="signature-intro">
      <div className="origin-curtain" aria-hidden="true">
        <span className="origin-placeholder">H</span>
        <canvas
          className="origin-particles"
          width={1}
          height={1}
          suppressHydrationWarning
        />
      </div>
      <button type="button" id="hamid-origin-skip" className="origin-skip">
        Skip intro
      </button>
    </div>
  );
}
