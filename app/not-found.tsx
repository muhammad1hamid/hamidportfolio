import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found wrap">
      <span className="eyebrow">404 / A wrong turn</span>
      <h1>
        Nothing built
        <br />
        <em>here. Yet.</em>
      </h1>
      <Link href="/" className="button button-light">
        Back to Hamid ↗
      </Link>
    </main>
  );
}
