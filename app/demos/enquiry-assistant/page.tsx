import Link from "next/link";
import { EnquiryDemo } from "@/components/tools/EnquiryDemo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { experienceMeta } from "@/data/experience";
import { demoKnowledge } from "@/data/enquiry-demo";
export const metadata = experienceMeta("/demos/enquiry-assistant/");
export default function DemoPage() {
  return (
    <ContentPage
      path="/demos/enquiry-assistant/"
      title="Helpful answers. Human handover."
      intro="Explore how a small enquiry assistant can answer supported questions, show its sources and recognise when a person needs to take over."
      label="Interactive demonstration"
      crumbs={[
        { label: "Enquiry assistant demo", href: "/demos/enquiry-assistant/" },
      ]}
    >
      <EnquiryDemo />
      <noscript>
        <p>
          The interactive demo needs JavaScript. Its complete answer set and
          method are available below.
        </p>
      </noscript>
      <section className="content-section">
        <h2>The answer set behind the demonstration</h2>
        <p>
          These four entries are the entire knowledge set. Topic matching
          selects one entry; unsupported or ambiguous questions receive a
          fallback. No language model generates these answers.
        </p>
        <div className="content-card-grid">
          {demoKnowledge.map((item) => (
            <article className="content-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.answer}</p>
              <Link className="text-link" href={item.href}>
                Read the source page
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section">
        <h2>From a demonstration to a working system</h2>
        <ol className="plain-list">
          <li>Agree the business information and who maintains it.</li>
          <li>
            Define questions the assistant may answer and requests that require
            a person.
          </li>
          <li>
            Connect a real inbox or CRM, with delivery confirmation and failure
            handling.
          </li>
          <li>
            Evaluate representative questions, languages and edge cases before
            expanding the scope.
          </li>
        </ol>
        <p>
          This demonstration keeps its draft in the browser. A live assistant
          needs a suitable backend, account access, ongoing content maintenance
          and evaluation. Keyword routing here is deliberately limited and is
          not a measure of a language model's accuracy.
        </p>
        <div className="related-links">
          <Link href="/whatsapp-ai-chatbot/">WhatsApp chatbot scope</Link>
          <Link href="/website-chatbot/">Website chatbot scope</Link>
          <Link href="/blog/chatbot-human-handover/">Plan human handover</Link>
        </div>
      </section>
      <ProjectCta title="Bring the process you want to improve." />
    </ContentPage>
  );
}
