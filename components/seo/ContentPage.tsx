import Link from "next/link";
import { site } from "@/data/site";
import { absolute, pageSchema } from "@/data/seo";
import { JsonLd } from "./JsonLd";
import { Arrow } from "@/components/ui/Arrow";

type Crumb = { label: string; href: string };
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((item, i) => (
            <li key={item.href}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === crumbs.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: absolute(item.href),
          })),
        }}
      />
    </>
  );
}
export function ContentPage({
  path,
  title,
  intro,
  label,
  crumbs,
  children,
  type,
  className,
}: {
  path: string;
  title: string;
  intro: string;
  label: string;
  crumbs?: Crumb[];
  children: React.ReactNode;
  type?: string;
  className?: string;
}) {
  return (
    <main
      id="main"
      className={`content-page wrap${className ? ` ${className}` : ""}`}
    >
      <Breadcrumbs items={crumbs || [{ label, href: path }]} />
      <header className="content-hero">
        <span className="eyebrow">
          <i className="accent-dot" /> {label} / Hamid
        </span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {children}
      <JsonLd data={pageSchema(path, title, intro, type)} />
    </main>
  );
}
export function ProjectCta({
  title = "Let’s scope your next move.",
  text = "Share your goal, current setup and any references. I’ll help identify the work needed before we agree on scope and timing.",
  whatsappMessage,
}: {
  title?: string;
  text?: string;
  whatsappMessage?: string;
}) {
  const whatsapp = whatsappMessage
    ? `${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
    : site.whatsapp;
  return (
    <section className="content-cta">
      <div>
        <span className="eyebrow">A clear next step</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="content-actions">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-accent"
          data-contact-context={whatsappMessage ? "insight" : undefined}
          aria-label={
            whatsappMessage
              ? "Discuss on WhatsApp (opens in a new tab)"
              : undefined
          }
        >
          {whatsappMessage ? "Discuss on WhatsApp" : "Discuss your project"}{" "}
          <Arrow diagonal />
        </a>
        <Link href="/contact/" className="text-link">
          Contact details ↗
        </Link>
      </div>
    </section>
  );
}
