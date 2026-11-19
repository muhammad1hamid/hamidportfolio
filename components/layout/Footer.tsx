import Link from "next/link";
import { site } from "@/data/site";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { Clarity } from "@/components/seo/Clarity";

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
      <nav className="footer-pages" aria-label="Explore Hamid’s website">
        {[
          ["Services", "/services/"],
          ["Work", "/work/"],
          ["Project walkthroughs", "/case-studies/"],
          ["Client perspectives", "/testimonials/"],
          ["Guides", "/blog/"],
          ["Questions", "/answers/"],
          ["Website planner", "/plan/"],
          ["Enquiry demo", "/demos/enquiry-assistant/"],
          ["About Hamid", "/about/"],
          ["Contact", "/contact/"],
          ["Content standards", "/editorial-policy/"],
        ].map(([label, href]) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="footer-bottom">
        <span>
          © <CurrentYear initialYear={new Date().getFullYear()} /> Hamid
        </span>
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
      {!site.noindex && <Clarity origin={site.url} />}
    </footer>
  );
}
