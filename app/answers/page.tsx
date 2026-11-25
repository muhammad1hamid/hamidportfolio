import Link from "next/link";
import answers from "@/data/answers.json";
import { site } from "@/data/site";
import { experienceMeta } from "@/data/experience";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { EditorialFAQ } from "@/components/ui/EditorialFAQ";
export const metadata = experienceMeta("/answers/");
export default function AnswersPage() {
  const groups = [...new Set(answers.map((item) => item.group))];
  return (
    <ContentPage
      path="/answers/"
      title="Good questions. Useful answers."
      intro="Find answers about choosing a website, planning automation, or checking how your business appears in search and AI. Each answer links to a useful next step."
      label="Project questions"
      type="CollectionPage"
      fullWidthSections
    >
      <nav className="answer-topics" aria-label="Question topics">
        {groups.map((group, i) => (
          <a href={`#topic-${i}`} key={group}>
            {group}
          </a>
        ))}
      </nav>
      <EditorialFAQ
        context="answers"
        subtitle={
          <>
            Website, automation and search questions,
            <br />
            with practical next steps.
          </>
        }
        items={groups.flatMap((group, i) =>
          answers
            .filter((item) => item.group === group)
            .map((item, index) => ({
              id: item.id,
              question: item.question,
              answer: item.answer,
              group,
              groupId: index === 0 ? `topic-${i}` : undefined,
              links: [
                { href: item.href, label: item.label },
                {
                  href: `#${item.id}`,
                  label: "Link to this answer",
                  ariaLabel: `Direct link: ${item.question}`,
                },
              ],
            })),
        )}
      />
      <p className="article-byline">
        By <Link href="/about/">{site.personName}</Link> · Updated{" "}
        <time dateTime="2026-11-22">22 November 2026</time> ·{" "}
        <Link href="/editorial-policy/">Content standards</Link>
      </p>
      <ProjectCta />
    </ContentPage>
  );
}
