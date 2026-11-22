import Link from "next/link";
import answers from "@/data/answers.json";
import { site } from "@/data/site";
import { experienceMeta } from "@/data/experience";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { AnswerNavigation } from "@/components/tools/AnswerNavigation";
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
    >
      <AnswerNavigation />
      <nav className="answer-topics" aria-label="Question topics">
        {groups.map((group, i) => (
          <a href={`#topic-${i}`} key={group}>
            {group}
          </a>
        ))}
      </nav>
      {groups.map((group, i) => (
        <section
          className="content-section content-faq"
          id={`topic-${i}`}
          key={group}
        >
          <h2>{group}</h2>
          {answers
            .filter((item) => item.group === group)
            .map((item) => (
              <details id={item.id} key={item.id}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
                <Link className="text-link answer-source" href={item.href}>
                  {item.label}
                </Link>
                <a
                  className="answer-permalink"
                  href={`#${item.id}`}
                  aria-label={`Direct link: ${item.question}`}
                >
                  Link to this answer
                </a>
              </details>
            ))}
        </section>
      ))}
      <p className="article-byline">
        By <Link href="/about/">{site.personName}</Link> · Updated{" "}
        <time dateTime="2026-11-22">22 November 2026</time> ·{" "}
        <Link href="/editorial-policy/">Content standards</Link>
      </p>
      <ProjectCta />
    </ContentPage>
  );
}
