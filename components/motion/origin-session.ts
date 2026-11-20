export const originDuration = 2480;
export const originMotionQuery =
  "(prefers-reduced-motion: reduce), (forced-colors: active)";
export const pageLeadSelector =
  "#main :is(.hero-copy, .growth-hero-copy, .content-hero, .archive-heading)";

type OriginSession = {
  startedAt: number;
  duration: number;
  leadSelector: string;
  signal: AbortSignal;
  ready: () => boolean;
  finish: (focusPage?: boolean) => void;
};

declare global {
  interface Window {
    hamidOrigin?: OriginSession;
  }
}

// The small head script gives the first eligible paint an H and an operable
// skip button even while React starts. The watchdog also works without React.
export const originBootstrap = `
(() => {
  const root = document.documentElement;
  const preference = matchMedia(${JSON.stringify(originMotionQuery)});
  const connection = navigator.connection;
  const navigation = performance.getEntriesByType("navigation")[0];
  const slowLink = connection?.rtt >= 125 && connection.downlink > 0 &&
    connection.downlink < 2 && navigation?.responseStart >= 125;
  if (preference.matches || document.hidden || location.hash ||
      navigation?.type === "back_forward" ||
      connection?.saveData || slowLink || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType) ||
      navigator.deviceMemory <= 2 || navigator.hardwareConcurrency <= 2 ||
      typeof Element.prototype.animate !== "function") return;

  try {
    const key = "hamid-origin-v1";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "seen");
  } catch {
    return;
  }

  const startedAt = performance.now();
  const controller = new AbortController();
  const signal = controller.signal;
  const duration = ${originDuration};
  const startupBudget = 800;
  let timer;

  function finish(focusPage = false) {
    if (signal.aborted) return;
    const focusedSkip = document.activeElement?.id === "hamid-origin-skip";
    root.removeAttribute("data-origin-intro");
    delete window.hamidOrigin;
    clearTimeout(timer);
    controller.abort();

    if ((focusPage || focusedSkip) && !document.hidden) {
      const main = document.getElementById("main");
      if (!main) return;
      if (!main.hasAttribute("tabindex")) {
        main.tabIndex = -1;
        main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
      }
      main.focus({ preventScroll: true });
    }
  }

  root.dataset.originIntro = "pending";
  window.hamidOrigin = {
    startedAt, duration, signal, finish,
    leadSelector: ${JSON.stringify(pageLeadSelector)},
    ready() {
      if (signal.aborted || root.dataset.originIntro !== "pending") return false;
      if (performance.now() - startedAt >= startupBudget) {
        finish();
        return false;
      }
      clearTimeout(timer);
      root.dataset.originIntro = "playing";
      timer = setTimeout(finish, Math.max(0, startedAt + duration + 370 - performance.now()));
      return true;
    }
  };
  timer = setTimeout(finish, startupBudget);

  document.addEventListener("click", event => {
    if (event.target.id === "hamid-origin-skip") finish(true);
  }, { signal });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") finish(true);
  }, { signal });
  document.addEventListener("focusin", event => {
    if (event.target.id !== "hamid-origin-skip") finish();
  }, { signal });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finish();
  }, { signal });
  preference.addEventListener("change", () => finish(), { signal });
  window.addEventListener("pagehide", () => finish(), { signal });
  window.addEventListener("scroll", () => finish(), { signal, passive: true });

  Promise.all([
    import("/motion/origin/origin-word.js"),
    import("/motion/origin/brand-particles.js")
  ]).catch(() => finish());
})();
`;
