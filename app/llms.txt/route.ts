import { servicePillars } from "@/data/services";
import { site } from "@/data/site";

export const dynamic = "force-static";

export function GET() {
  const origin = site.url;
  const services = servicePillars.map((pillar) =>
    [
      `### ${pillar.name}`,
      "",
      ...pillar.services.map(
        (service) =>
          `- [${service.name}](${origin}/${service.slug}/): ${service.description}`,
      ),
    ].join("\n"),
  );
  const resources = [
    ["White-label web development for agencies", "/for-agencies/"],
    ["Website portfolio", "/work/"],
    ["Project experience notes", "/case-studies/"],
    ["Practical guides", "/blog/"],
    ["Website and automation insights", "/insights/"],
    ["Project questions", "/answers/"],
    ["Website planner", "/plan/"],
    ["Client video testimonials", "/testimonials/"],
    ["Enquiry demonstration", "/demos/enquiry-assistant/"],
    ["Content standards", "/editorial-policy/"],
    ["About Hamid", "/about/"],
    ["Contact", "/contact/"],
  ];
  const text = `# Hamid

${site.personName} is an independent developer and founder of ElevateX. He works from Pakistan with businesses and agencies worldwide on websites, search and AI visibility, and practical automation.

## Services

${services.join("\n\n")}

## Resources

${resources.map(([label, path]) => `- [${label}](${origin}${path})`).join("\n")}

## Scope

Bridal House, Editing Julian and Qadeer Jewellers are self-directed demo websites built by Hamid. Project notes describe visible features. Client testimonials have their own video pages. The enquiry demo follows rules for a defined set of questions. The service pages describe illustrative scopes. This overview is an experimental index of the site's public pages.
`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
