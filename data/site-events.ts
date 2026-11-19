const actionEvents = [
  "hero_primary_cta_click",
  "hero_portfolio_cta_click",
  "service_pillar_click",
  "growth_cta_click",
  "contact_whatsapp_click",
  "planner_open",
  "planner_growth_option_select",
] as const;

type ActionEvent = (typeof actionEvents)[number];

export function isActionEvent(name: string | undefined): name is ActionEvent {
  return actionEvents.some((event) => event === name);
}

export function trackSiteEvent(event: ActionEvent, pillar?: string) {
  window.dataLayer?.push({
    event,
    page_path: window.location.pathname,
    ...(event === "service_pillar_click" && pillar ? { pillar } : {}),
  });
}
