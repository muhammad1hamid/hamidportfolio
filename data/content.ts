import type { Milestone } from "@/components/ui/scroll-timeline";

export const faqs = [
  {
    question: "What can we build together?",
    answer:
      "A distinctive business website, a landing page, an internal tool, a chatbot or a workflow. I also partner with agencies that need development or automation support.",
  },
  {
    question: "Can you work on an existing website?",
    answer:
      "Yes. Depending on the goal, I can review an existing site for design, development, search visibility or workflow improvements. The scope starts with what is already in place.",
  },
  {
    question: "What does Growth Engine cover?",
    answer:
      "Growth Engine brings together technical SEO, clear answers to buyer questions, AI search readiness and practical improvements to your enquiry paths. An audit guides the work. Search and AI platforms decide which pages they rank or cite.",
    link: "/growth/",
  },
  {
    question: "Do I need every service?",
    answer:
      "We start with the problem. That might call for a website, a focused SEO improvement or a single automation.",
  },
  {
    question: "Do you work with clients outside Pakistan?",
    answer:
      "Yes. I’m based in Pakistan and work with businesses and agencies worldwide. We agree on a clear scope, a practical timeline, and a way to stay in touch that works across time zones.",
  },
  {
    question: "Can you help after the launch?",
    answer:
      "Yes. We can discuss ongoing development, search visibility, automation improvements or support. The scope is shaped around what your business actually needs.",
  },
];

export const processMilestones = [
  {
    id: "discover",
    title: "Discover",
    description:
      "We start with your goals, audience, and what's already in place.",
  },
  {
    id: "define",
    title: "Define",
    description:
      "We agree on scope, deliverables, and how the work will be reviewed.",
  },
  {
    id: "build",
    title: "Build",
    description:
      "I turn the agreed plan into a working website, experience, or system.",
  },
  {
    id: "check",
    title: "Check",
    description:
      "We test key interactions, review the result, and refine what needs attention.",
  },
  {
    id: "launch",
    title: "Launch & improve",
    description:
      "I hand over the work and make next steps clear, including what to revisit later.",
  },
] as const satisfies readonly Milestone[];
