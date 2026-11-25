import { faqs } from "@/data/content";
import { EditorialFAQ } from "@/components/ui/EditorialFAQ";

export function Faq() {
  return (
    <EditorialFAQ
      context="home"
      titleId="faq-title"
      items={faqs.map(({ question, answer, link }) => ({
        question,
        answer,
        links: link
          ? [{ href: link, label: "Explore Growth Engine ↗" }]
          : undefined,
      }))}
    />
  );
}
