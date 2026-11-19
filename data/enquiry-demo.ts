export const demoKnowledge = [
  {
    id: "scope",
    title: "Website scope",
    question: "What should I include in a website brief?",
    answer:
      "Start with your audience, the main action, the pages you need and the content you have. The website planner turns those choices into a downloadable brief.",
    href: "/plan/",
  },
  {
    id: "work",
    title: "Website examples",
    question: "Can I see examples of the work?",
    answer:
      "You can explore live website examples and desktop/mobile screenshots. Bridal House, Editing Julian and Qadeer Jewellers are self-directed demos built by Hamid, not commissioned client case studies.",
    href: "/case-studies/",
  },
  {
    id: "remote",
    title: "Working remotely",
    question: "Can we work together remotely?",
    answer:
      "Hamid is based in Pakistan and works with businesses and agencies remotely. Share your goal and current setup to discuss scope and availability.",
    href: "/about/",
  },
  {
    id: "handover",
    title: "Human handover",
    question: "Can I talk to a person?",
    answer:
      "Yes. You can prepare a short enquiry below and choose to open it in WhatsApp. This demo only prepares a draft; it does not notify a team or send a message.",
    href: "/contact/",
  },
];
export function answerDemo(raw: string) {
  const text = raw.toLowerCase().trim().slice(0, 280);
  const fallback = {
    id: "unknown",
    title: "Needs a conversation",
    answer:
      "That question is outside this demo's approved answer set. I cannot confirm a price, booking or other commitment. You can prepare a handover draft for Hamid below.",
    href: "/contact/",
    handover: true,
  };
  if (!text) return null;
  if (
    /price|cost|quote|book|appointment|guarantee|discount|refund|password|ignore|pretend|secret|deliver|timeline|when|hours|phone|email|address/.test(
      text,
    )
  )
    return fallback;
  const matches = [
    [/\b(brief|scope|pages|prepare|content)\b/.test(text), "scope"],
    [/\b(examples?|portfolio|projects?|work samples)\b/.test(text), "work"],
    [/\b(remotely|remote|pakistan|location|worldwide)\b/.test(text), "remote"],
    [/\b(person|human|someone|handover|contact)\b/.test(text), "handover"],
  ].filter(([matched]) => matched);
  if (matches.length !== 1) return fallback;
  const found = demoKnowledge.find((item) => item.id === matches[0][1])!;
  return { ...found, handover: found.id === "handover" };
}
