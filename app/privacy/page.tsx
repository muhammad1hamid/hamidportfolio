import Link from "next/link";
import { ContentPage } from "@/components/seo/ContentPage";
import { pageMeta } from "@/data/seo";
import { site } from "@/data/site";

const path = "/privacy/";
const description =
  "How Hamid uses project enquiry details, the services that help handle them, and how to ask about your information.";

export const metadata = pageMeta(
  "Enquiry Privacy Notice — Hamid",
  description,
  path,
);

export default function PrivacyPage() {
  return (
    <ContentPage
      path={path}
      title="Enquiry privacy notice."
      intro={description}
      label="Privacy"
    >
      <section className="content-section">
        <h2>What I use to respond</h2>
        <p>
          Hamid operates itshamid.com. When the website form is available and
          you choose to send an enquiry, I use your name, reply email, service
          choice, project details and any optional information you include to
          assess the work and reply. Agency enquiries also include the company
          name and any collaboration details you choose to share. Please leave
          out credentials, payment details and private client material.
        </p>
      </section>
      <section className="content-section">
        <h2>How the website handles an enquiry</h2>
        <p>
          The Contact page uses Web3Forms when email sending is configured. Your
          browser sends the details you choose to include to Web3Forms over
          HTTPS for delivery to my project inbox. hCaptcha helps verify
          submissions and receives browser and network information when its
          check loads after you start the form. Web3Forms and the email provider
          may retain enquiry information under their own policies and account
          settings. An on-page confirmation means the delivery service accepted
          the enquiry; it does not confirm that I have read it.
        </p>
        <p>
          A separately configured website submission from the planner or agency
          page uses a Vercel endpoint, Cloudflare Turnstile and Resend.
          Turnstile receives browser and network information when its check
          loads. This route remains unavailable unless its delivery services are
          configured.
        </p>
        <p>
          On that separate route, Upstash holds temporary anti-spam counters and
          submission references. The counters use a keyed hash of the IP address
          and expire within an hour. Submission references include a keyed hash
          of the submitted details and expire within 24 hours. The temporary
          store does not contain the readable project message or reply address.
        </p>
        <p>
          I keep enquiry emails to review the project, follow up and keep
          relevant correspondence if we work together. You can ask about your
          enquiry or request that I remove it using the contact options below.
        </p>
      </section>
      <section className="content-section">
        <h2>Planner and WhatsApp</h2>
        <p>
          The contact composer keeps your unfinished note in page memory, not in
          browser storage. Reloading or leaving the page may discard it. A
          WhatsApp draft is shown for review before you choose to open it;
          opening a draft does not send a message. The planner builds your
          outline on the page. Download saves it to your device. If you choose
          to send it through the website, you can review and edit the outline
          first. If you open a WhatsApp draft, WhatsApp handles the draft and
          any message you choose to send under its own privacy notice.
        </p>
      </section>
      <section className="content-section">
        <h2>Site measurement</h2>
        <p>
          The site uses Ahrefs Analytics. You can manage optional Google
          Analytics and Microsoft Clarity through Analytics preferences in the
          footer. Form event tracking uses information such as the service
          category, entry point and confirmation status. With Google Analytics
          enabled, a recognized AI referral may be recorded as a source
          category. These events use the page path and exclude your name, email
          address and project text.
        </p>
      </section>
      <section className="content-section">
        <h2>Ask about your information</h2>
        <p>
          Contact me to ask what enquiry information I have, correct it or
          request deletion. The submission reference can help me find the
          enquiry.
        </p>
        <div className="related-links">
          <Link href="/contact/">Contact Hamid</Link>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-contact-context="privacy"
          >
            Ask on WhatsApp ↗
          </a>
        </div>
      </section>
    </ContentPage>
  );
}
