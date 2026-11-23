import { ContactEnquiry } from "@/components/contact/ContactEnquiry";
import {
  ContactAtmosphere,
  ContactMountainAccent,
} from "@/components/contact/ContactArtwork";
import {
  ContactEditorialIntro,
  ContactAlternatives,
  ContactProcessStrip,
  ContactFAQ,
} from "@/components/contact/ContactSections";
import { JsonLd } from "@/components/seo/JsonLd";
import { configuredWeb3FormsKey } from "@/data/conversation.mjs";
import { contactSettings } from "@/data/contact-settings";
import { pageMeta, pageSchema } from "@/data/seo";
import "../contact.css";
import "../first-conversation.css";

const path = "/contact/";
const heading = "Have an idea? Let’s make it real.";
const description =
  "A direct conversation with Hamid about a new website, stronger search visibility, AI automation or agency collaboration. No finished brief needed.";
export const metadata = pageMeta(
  "Contact Hamid — The First Conversation",
  description,
  path,
);

export default function ContactPage() {
  const accessKey = configuredWeb3FormsKey(
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
      contactSettings.web3FormsAccessKey,
  );
  return (
    <main id="main" className="content-page first-conversation">
      <ContactAtmosphere />
      <div className="wrap contact-content">
        <div className="first-conversation-grid">
          <ContactEditorialIntro />
          <section
            className="conversation-sheet"
            id="project-enquiry"
            aria-labelledby="project-enquiry-title"
          >
            <span
              className="contact-anchor"
              id="growth-enquiry"
              aria-hidden="true"
            />
            <ContactEnquiry accessKey={accessKey} />
          </section>
        </div>
        <ContactAlternatives />
        <ContactProcessStrip />
        <ContactFAQ />
      </div>
      <ContactMountainAccent />
      <JsonLd
        data={pageSchema(path, heading, description, { type: "ContactPage" })}
      />
    </main>
  );
}
