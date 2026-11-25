import { site } from "@/data/site";
import { EditorialFAQ } from "@/components/ui/EditorialFAQ";

const questions = [
  {
    question: "Do I need a finished project brief?",
    answer:
      "Not at all. A rough idea, a few goals, or even just a problem you want to solve is enough. I’ll help you shape it into a clear and actionable plan.",
  },
  {
    question: "Can you improve an existing website?",
    answer:
      "Yes. I can review your existing website and help identify practical improvements to its design, performance, usability, search visibility, or functionality.",
  },
  {
    question: "Can we work together internationally?",
    answer:
      "Yes. I’m based in Pakistan and available for remote work worldwide. Communication, project planning and delivery can all be managed online.",
  },
  {
    question: "What happens after I send an enquiry?",
    answer:
      "I’ll review the information you share and discuss your goals, requirements and possible next steps. We’ll agree on a clear scope before starting any work.",
  },
] as const;

export function ContactFAQ() {
  return (
    <EditorialFAQ
      context="contact"
      items={questions.map(({ question, answer }, index) => ({
        question,
        answer:
          index === 3 ? (
            <>
              {answer} You can also{" "}
              <a href={`mailto:${site.email}`}>email me directly</a>.
            </>
          ) : (
            answer
          ),
      }))}
    />
  );
}
