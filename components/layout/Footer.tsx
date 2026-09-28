import Link from "next/link";
import { site } from "@/data/site";
import { CurrentYear } from "@/components/ui/CurrentYear";

export function Footer() {
  const socials = [
    { label: "LinkedIn", url: site.linkedin },
    { label: "Instagram", url: site.instagram },
    { label: "WhatsApp", url: site.whatsapp },
  ].filter((s) => s.url);
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <Link href="/" className="wordmark">
          HAMID<span>✳</span>
        </Link>
        <p>
          Web development.
          <br />
          AI automation. Chatbot development.
        </p>
        <a href="#main" className="back-top">
          Back to top ↑
        </a>
      </div>
      <div className="footer-bottom">
        <span>© <CurrentYear initialYear={new Date().getFullYear()} /> Hamid</span>
        <span>Based in Pakistan · Working worldwide</span>
        <div>
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
        <span>Thoughtfully built.</span>
      </div>
    </footer>
  );
}
