import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function startScrollExperience() {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    duration: 0.9,
    smoothWheel: true,
    anchors: { offset: -88 },
    prevent: (node) => Boolean(node.closest("dialog")),
  });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  // Read positions together before writing styles. One native observer handles
  // one-time reveals; ScrollTrigger is reserved for scroll-linked effects.
  const pending = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter(element => element.getBoundingClientRect().top >= innerHeight);
  const revealTweens: gsap.core.Tween[] = [];
  let disposed = false;
  const revealObserver = new IntersectionObserver(entries => {
    if (disposed) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      revealObserver.unobserve(entry.target);
      revealTweens.push(gsap.to(entry.target, { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }));
    }
  }, { rootMargin: "0px 0px -6% 0px" });
  const context = gsap.context(() => {
    gsap.set(pending, { y: 24, autoAlpha: 0 });
    pending.forEach(element => revealObserver.observe(element));
    gsap.utils.toArray<HTMLElement>(".story-line").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0.22 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "top 44%",
            scrub: true,
          },
        },
      );
    });
  });
  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 500);
  return () => {
    disposed = true;
    revealObserver.disconnect();
    revealTweens.forEach(tween => tween.kill());
    clearTimeout(refresh);
    context.revert();
    lenis.destroy();
    gsap.ticker.remove(tick);
  };
}
