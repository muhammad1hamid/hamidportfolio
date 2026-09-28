# Hamid — personal portfolio

A responsive Next.js / TypeScript portfolio with Tailwind CSS, GSAP ScrollTrigger, Lenis, and a lazy-loaded Three.js monogram. The two optimized portraits come from the supplied assets.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` creates the deployable static website in `out/`. `npm run typecheck` checks TypeScript.

## Add real content

- `data/site.ts`: set the verified email, WhatsApp, LinkedIn, and Instagram URLs. Missing contact channels are omitted. Adding an email replaces the brief preparation button with a real email CTA.
- `data/projects.ts`: replace the six clearly labeled presentation slots. Each entry supports title, slug, category, featured, thumbnail, preview, description, technologies, liveUrl, year, status, and visual. Set `status` to `published` to use the real thumbnail. A live link appears only when supplied. Keep 6–8 entries featured; the archive automatically handles the rest.
- `public/images/projects/`: add real project images. The current placeholders use local interface studies and never request the unfilled image paths.
- `data/testimonials.ts`: add approved client quotes; the section is hidden while empty.
- `data/content.ts`: services, process, and the three FAQs.
- `public/images/hamid-hero.webp` and `public/images/hamid-about.webp`: replace portraits here while keeping their names.
- Set `NEXT_PUBLIC_SITE_URL` when moving to a custom domain, then rebuild. This controls canonicals, OpenGraph URLs, structured data, robots, and the sitemap.

## Contact behavior

Until an email address is configured, visitors can prepare and download a project brief. The form does not send anything or store personal data on a server. It clearly says so. Contact URLs and testimonials are never fabricated.

## Motion and performance

- Intro appears once per browser session and skips reduced motion.
- Smooth scrolling, scroll reveals, cursor interpolation, portrait depth, and the monogram honor reduced motion.
- The monogram loads near its section, skips narrow mobile devices, and pauses offscreen or in a hidden tab. A typographic H remains if WebGL is unavailable.
- Native dialogs provide focus containment and Escape dismissal. Touch users retain all actions without hover.
- Fonts are bundled locally. Images are compressed WebP with explicit dimensions. Static export uses preoptimized local images through next/image, without a server image optimizer.

## Deployment

`.openai/hosting.json` identifies the private Sites deployment. The output folder is `out/`. Source code and deployment settings remain editable here. Keep contact and project placeholders until verified content is supplied.
