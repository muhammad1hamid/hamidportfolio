import { useEffect, useLayoutEffect, useRef } from "react";
import { originMotionQuery, pageLeadSelector } from "./origin-session";

const routePath = (path: string) => path.replace(/\/+$/, "") || "/";

function getDestination(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  )
    return;

  const link = event.target.closest("a[href]");
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute("download") ||
    (link.target && link.target.toLowerCase() !== "_self") ||
    link.relList.contains("external") ||
    link.closest("form") ||
    link.origin !== location.origin ||
    link.href.includes("#")
  )
    return;

  const destination = routePath(link.pathname);
  if (destination !== routePath(location.pathname)) return destination;
}

export function useNavigationMotion(pathname: string) {
  const veil = useRef<HTMLDivElement>(null);
  const outgoing = useRef<{
    destination: string;
    startedAt: number;
    animation: Animation;
  } | null>(null);
  const incoming = useRef<Animation | null>(null);

  useEffect(() => {
    const layer = veil.current;
    if (!layer || typeof layer.animate !== "function") return;
    const preference = matchMedia(originMotionQuery);
    const controller = new AbortController();
    const { signal } = controller;
    const cancel = () => {
      outgoing.current?.animation.cancel();
      incoming.current?.cancel();
      outgoing.current = null;
      incoming.current = null;
    };

    document.addEventListener(
      "click",
      (event) => {
        if (preference.matches || document.hidden) return;
        const destination = getDestination(event);
        if (!destination) return;
        window.hamidOrigin?.finish();
        cancel();

        // Decoration only. Next's click, loading, focus and scroll flow
        // continue normally even if the destination takes a while to load.
        const animation = layer.animate(
          [
            { transform: "translateY(75%)", opacity: 0 },
            { transform: "translateY(0)", opacity: 0.4, offset: 0.54 },
            { transform: "translateY(-100%)", opacity: 0 },
          ],
          { duration: 290, easing: "cubic-bezier(.35,0,.23,1)" },
        );
        animation.onfinish = () => {
          if (outgoing.current?.animation === animation)
            outgoing.current = null;
        };
        outgoing.current = {
          destination,
          animation,
          startedAt: performance.now(),
        };
      },
      { capture: true, signal },
    );
    window.addEventListener(
      "popstate",
      () => {
        window.hamidOrigin?.finish();
        cancel();
      },
      { signal },
    );
    window.addEventListener("pagehide", cancel, { signal });
    document.addEventListener("visibilitychange", cancel, { signal });
    preference.addEventListener("change", cancel, { signal });

    return () => {
      controller.abort();
      cancel();
    };
  }, []);

  useLayoutEffect(() => {
    const transition = outgoing.current;
    if (!transition) return;
    if (
      transition.destination !== routePath(pathname) ||
      performance.now() - transition.startedAt > 200
    ) {
      transition.animation.cancel();
      outgoing.current = null;
      return;
    }

    const heading =
      document.querySelector(pageLeadSelector) ??
      document.querySelector("#main h1");
    if (!heading) return;
    const animation = heading.animate(
      [
        { opacity: 0.86, translate: "0 8px" },
        { opacity: 1, translate: "0 0" },
      ],
      { duration: 220, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    incoming.current = animation;
    animation.onfinish = () => {
      if (incoming.current === animation) incoming.current = null;
    };
  }, [pathname]);

  return veil;
}
