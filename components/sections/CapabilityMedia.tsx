import type { CapabilityId } from "@/data/capability-showcase";
import { demoKnowledge } from "@/data/enquiry-demo";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { ExploreIcon } from "./ExploreIcon";
import styles from "./MobileCapabilityStudio.module.css";

export function CapabilityIcon({ id }: { id: CapabilityId }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "web-experiences" && (
        <>
          <rect x="3" y="5" width="26" height="22" rx="4" />
          <path d="M3 12h26M8 8.5h.01M12 8.5h.01M16 8.5h.01" />
        </>
      )}
      {id === "growth-engine" && <path d="M5 27v-6m7 6V15m8 12V9m7 18V3" />}
      {id === "smart-systems" && (
        <path d="m16 3 13 7-13 7L3 10l13-7ZM3 17l13 7 13-7M3 24l13 7 13-7" />
      )}
      {id === "ai-conversations" && (
        <>
          <path d="M10 25 4 29v-8a9 9 0 0 1-2-6v-3a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v5a8 8 0 0 1-8 8H10Z" />
          <path d="M10 14h.01M16 14h.01M22 14h.01" />
        </>
      )}
    </svg>
  );
}

function ProjectPreview() {
  return (
    <figure className={styles.webFigure}>
      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          <ResponsiveImage
            src="/images/curve/bridal-house-960.webp"
            alt="Bridal House self-directed website demo by Hamid"
            width="960"
            height="640"
            sizes="(max-width: 767px) 90vw, 1px"
          />
        </div>
        <span className={styles.laptopBase} aria-hidden="true" />
      </div>
      <figcaption>Bridal House · Self-directed demo</figcaption>
    </figure>
  );
}

function SearchStructure() {
  return (
    <div className={styles.searchMedia}>
      <span className={styles.mediaNote}>Site structure example</span>
      <div className={styles.searchRoot}>
        <span className={styles.siteGlyph} aria-hidden="true">
          H
        </span>
        <div>
          <strong>itshamid.com</strong>
          <span>Clear pages. Connected answers.</span>
        </div>
      </div>
      <div className={styles.siteTree}>
        <div>
          <span>01</span>
          <div>
            <strong>Web development</strong>
            <small>/web-development/</small>
          </div>
        </div>
        <div>
          <span>02</span>
          <div>
            <strong>Useful project questions</strong>
            <small>/answers/</small>
          </div>
        </div>
        <div>
          <span>03</span>
          <div>
            <strong>A clear next step</strong>
            <small>/contact/</small>
          </div>
        </div>
      </div>
      <p className={styles.mediaFootnote}>
        Structure and clarity, without ranking promises.
      </p>
    </div>
  );
}

function Workflow() {
  return (
    <div className={styles.workflowMedia}>
      <span className={styles.mediaNote}>Illustrative workflow</span>
      <ol>
        <li>
          <span className={styles.nodeIcon}>
            <ExploreIcon name="mail" />
          </span>
          <div>
            <strong>Capture</strong>
            <p>A new website enquiry</p>
          </div>
        </li>
        <li>
          <span className={styles.nodeIcon}>
            <ExploreIcon name="layers" />
          </span>
          <div>
            <strong>Organise</strong>
            <p>Goal, requirements, next steps</p>
          </div>
        </li>
        <li>
          <span className={styles.nodeIcon}>
            <ExploreIcon name="check" />
          </span>
          <div>
            <strong>Draft a reply</strong>
            <p>Ready for a person to review</p>
          </div>
        </li>
      </ol>
      <span className={styles.reviewNote}>
        <span aria-hidden="true">✓</span> Human approval before sending
      </span>
    </div>
  );
}

function Conversation() {
  const example = demoKnowledge.find((item) => item.id === "remote")!;
  const answer = example.answer.split(". ")[0] + ".";
  return (
    <div className={styles.chatMedia}>
      <div className={styles.chatHeading}>
        <span className={styles.siteGlyph} aria-hidden="true">
          H
        </span>
        <div>
          <strong>Hamid’s enquiry demo</strong>
          <span>Approved answers · Sample conversation</span>
        </div>
      </div>
      <p className={styles.visitorBubble}>{example.question}</p>
      <div className={styles.answerBubble}>
        <span>From the existing answer set</span>
        <p>{answer}</p>
      </div>
      <span className={styles.chatFootnote}>
        A demonstration. No message is sent.
      </span>
    </div>
  );
}

export function CapabilityMedia({ id }: { id: CapabilityId }) {
  if (id === "web-experiences") return <ProjectPreview />;
  if (id === "growth-engine") return <SearchStructure />;
  if (id === "smart-systems") return <Workflow />;
  return <Conversation />;
}
