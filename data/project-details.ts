type ProjectDecision = {
  title: string;
  reason: string;
  implementation: string;
  inspect: string;
};

type ProjectStoryNotes = {
  idea: string;
  highlights: string[];
  journey: string[];
  desktop: string;
  mobile: string;
  decisions: ProjectDecision[];
  evidence: string;
};

// The notes draw on the supplied captures and visible features of each website.
export const projectDetails: Record<string, ProjectStoryNotes> = {
  "bridal-house": {
    idea: "This self-directed concept explores two moments in shopping for bridal couture. A visitor may want to browse styles and compare sale and rental options, or may arrive ready to ask about a particular look.",
    highlights: [
      "Photography-led opening",
      "Collections and separate rental navigation",
      "Bridal consultation enquiry route",
    ],
    journey: [
      "Discover the collection",
      "Explore a look",
      "Start a consultation",
    ],
    desktop:
      "The couture photograph fills the opening screen. The collection navigation and consultation action are visible together.",
    mobile:
      "The portrait crop keeps the garment in view. The consultation and collection actions stack below the headline.",
    decisions: [
      {
        title: "Let the collection set the tone",
        reason:
          "Fabric, embroidery and silhouette give visitors a useful starting point when comparing bridal styles.",
        implementation:
          "The opening uses a large photograph and keeps the supporting copy short.",
        inspect:
          "Look at how the garment and headline share the opening screen in both captures.",
      },
      {
        title: "Give browsing and enquiry their own paths",
        reason:
          "A visitor comparing styles needs a different next step from someone asking about an event date.",
        implementation:
          "The opening presents a collection link beside a dedicated bridal consultation action.",
        inspect:
          "Compare the two opening buttons with the Collections and Rentals entries in the desktop menu.",
      },
    ],
    evidence:
      "The captures show the browsing interface and consultation route.",
  },
  "ink-grail": {
    idea: "The studio site introduces the artwork and gives prospective visitors a route to discuss a tattoo idea. The notes focus on the visual identity and the paths visible in the interface.",
    highlights: [
      "Monochrome artwork and studio typography",
      "Work and artist information",
      "Consultation and WhatsApp entry points",
    ],
    journey: ["Meet the studio", "Find inspiration", "Discuss your idea"],
    desktop:
      "Large serif lettering and a close-up artwork image set the tone, with work and consultation choices below.",
    mobile:
      "The opening preserves the visual focus and adds a bottom row for Consult and WhatsApp.",
    decisions: [
      {
        title: "Bring the studio’s visual style forward",
        reason:
          "A prospective visitor wants a sense of the artist’s style before discussing a design.",
        implementation:
          "The homepage opens with a monochrome artwork detail and draws attention to the studio’s work.",
        inspect:
          "Compare the close-up image and the Explore the Work link in the opening capture.",
      },
      {
        title: "Keep the consultation route visible on a phone",
        reason:
          "A visitor with a reference or a question can move quickly from inspiration to a conversation.",
        implementation:
          "The mobile interface surfaces Consult and WhatsApp alongside the main consultation action.",
        inspect:
          "Look for the two actions at the bottom of the mobile screenshot.",
      },
    ],
    evidence:
      "The screenshots support the notes on artwork, typography and enquiry placement. Studio bookings and outcomes would need separate evidence.",
  },
  "qadeer-jewellers": {
    idea: "This self-directed showroom concept explores how jewellery photography and collection categories can help visitors decide what they want to see in person.",
    highlights: [
      "Gold, diamond and bridal collection routes",
      "Product photography as the lead visual",
      "Showroom visit and enquiry entry points",
    ],
    journey: ["Browse collections", "Find a style", "Plan a showroom visit"],
    desktop:
      "The desktop opening combines detailed jewellery photography with collection and showroom actions.",
    mobile:
      "The photograph fills the narrower display, with collection browsing and visit options close to the first screen.",
    decisions: [
      {
        title: "Start with the category a visitor recognizes",
        reason:
          "Someone shopping for bridal jewellery can begin with a collection before choosing a specific item.",
        implementation:
          "The navigation separates gold, diamonds and bridal browsing.",
        inspect: "Compare the category names across the desktop header.",
      },
      {
        title: "Make a showroom visit a clear next step",
        reason:
          "A visitor who has narrowed down a style may want to see its detail and fit in person.",
        implementation:
          "The concept pairs Explore Collection with a dedicated showroom visit action.",
        inspect:
          "Look for the collection and visit options in the opening on both devices.",
      },
    ],
    evidence:
      "The captures show the collections and showroom enquiry interface.",
  },
  "dylan-seedin": {
    idea: "The photography portfolio opens on a single wedding image and gives visitors routes into the work, services and a date enquiry.",
    highlights: [
      "Full-width wedding photography",
      "Work and services navigation",
      "An enquiry path for a date",
    ],
    journey: [
      "Discover the photographer",
      "Explore the work",
      "Enquire about a date",
    ],
    desktop:
      "The wide hero crop shows both figures and the landscape. Work and date-enquiry options sit beneath the opening message.",
    mobile:
      "The narrower crop emphasizes the sky and headline, with the two actions arranged vertically.",
    decisions: [
      {
        title: "Open with one photograph",
        reason:
          "A single scene gives a visitor time to read the framing and mood before opening a wider portfolio.",
        implementation:
          "The opening uses a wide wedding image with a compact heading and introductory text.",
        inspect:
          "Compare the subjects and landscape in the desktop and mobile crops.",
      },
      {
        title: "Pair the portfolio with a date enquiry",
        reason:
          "Some visitors are assessing the photography while others already have an event date in mind.",
        implementation:
          "The opening places the work link near an enquiry prompt about the visitor’s date.",
        inspect:
          "Look for Explore the Work and the date enquiry below the heading.",
      },
    ],
    evidence:
      "The captures document the image treatment and opening navigation. Booked events and business outcomes would need separate evidence.",
  },
  "editing-julian": {
    idea: "This self-directed portfolio concept explores how a video editor can help visitors reach work samples, understand the services and find a route to a conversation.",
    highlights: [
      "Portfolio and services navigation",
      "Dedicated video work section",
      "Consultation booking links",
    ],
    journey: ["Meet the editor", "Watch the work", "Open the booking option"],
    desktop:
      "The opening places View Portfolio and Book a Call beside one another under the headline.",
    mobile:
      "The same two actions occupy a vertical stack in the narrower opening.",
    decisions: [
      {
        title: "Put work samples one step from the opening",
        reason:
          "Potential collaborators can use a work sample to judge the editing style and the types of projects on offer.",
        implementation:
          "The hero includes a clear View Portfolio path alongside the service introduction.",
        inspect:
          "Look for the portfolio action immediately below the headline in both captures.",
      },
      {
        title: "Give an interested visitor a direct next step",
        reason:
          "A visitor who has already seen enough of the work may be ready to discuss their own brief.",
        implementation:
          "Book a Call is a separate action. On mobile it sits in its own row.",
        inspect:
          "Compare the desktop action pair with the stacked buttons in the mobile capture.",
      },
    ],
    evidence:
      "The opening captures show how the portfolio and booking paths are presented.",
  },
  "elevate-x": {
    idea: "The saved agency site shows how a visitor could move from the web development and chatbot offer to examples or a project enquiry. These notes use the captured interface.",
    highlights: [
      "Monochrome agency presentation",
      "Web development and chatbot service sections",
      "Separate work and enquiry paths",
    ],
    journey: [
      "Explore services",
      "See work examples",
      "Open the project enquiry",
    ],
    desktop:
      "The saved desktop opening uses a headline and action pair beside the agency’s profile graphic.",
    mobile:
      "In the saved mobile opening the headline and actions are centered as a vertical sequence.",
    decisions: [
      {
        title: "Summarize the practical offer near the headline",
        reason:
          "A visitor needs to know which kinds of website or chatbot requests they can bring.",
        implementation:
          "The opening uses one supporting line near the headline to name the service areas.",
        inspect:
          "Read the service line directly beneath the opening message in the desktop capture.",
      },
      {
        title: "Separate examples from starting an enquiry",
        reason:
          "Visitors exploring the offer can look through examples before choosing when to get in touch.",
        implementation:
          "The saved interface pairs Start Your Project with View Our Work and stacks the actions on mobile.",
        inspect: "Compare the action placement in the two saved captures.",
      },
    ],
    evidence:
      "The saved captures document the opening and enquiry placement. The supplied domain currently displays an expiry notice.",
  },
};
