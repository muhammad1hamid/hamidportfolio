# Hamid — personal portfolio

A responsive Next.js / TypeScript portfolio with Tailwind CSS, GSAP ScrollTrigger, Lenis, and a lazy-loaded Three.js monogram. Hero and About use the same supplied portrait.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` creates the deployable static website in `out/`, including generated search files, responsive assets and compressed delivery variants. `npm start` serves that production export locally. `npm run typecheck` checks TypeScript.

## SEO and content

The site includes 36 canonical pages: the original service/portfolio pages plus a 20-question answer library, website planner, enquiry-flow demonstration, testimonial directory and two watch pages, content standards, and three additional planning guides. Hamid remains the portfolio brand; ElevateX is his founder affiliation. Bridal House, Editing Julian and Qadeer Jewellers are explicitly identified as self-directed demos built by Hamid.

See `SEO-AUDIT.md` for the baseline, `SEO-REPORT.md` for the completed upgrade, `CONTENT-PUBLISHING.md` for content maintenance, and `MANUAL-SEO-SETUP.md` for domain, verification, analytics and IndexNow setup. No external account or search submission is automatically configured.

See `AEO-GEO-IMPLEMENTATION.md` for the latest work and remaining dependencies, and `DISCOVERY-OPERATIONS.md` for public launch and measurement. `npm run test:discovery` checks the planner, answer links and demonstration; `npm run check:public` inspects the selected public domain without making external changes.

`npm run test:seo` checks exported pages, links, metadata, schemas, assets, mobile layout, accessibility and redirects. `npm run test:performance` records three local mobile lab runs. Both default to the temporary production preview on port 3001; set `QA_BASE_URL=http://127.0.0.1:3000` to use the main local server. `npm run indexnow` is a dry run; submission requires a real ownership key, a matching deployed export and `-- --submit`.

## Add real content

- `data/site.ts`: contains the supplied WhatsApp, LinkedIn, Instagram and `hamidwork360@gmail.com` contact destinations.
- `data/projects.ts`: contains the 18 supplied websites with verified brand names and descriptions. Six appear on the homepage; the archive includes all 18. Empty categories are hidden. Only add verified dates, technologies, and results.
- `data/project-details.ts`: experience overviews for the featured projects, describing visible website features without inventing client results or development roles.
- `public/images/projects/`: compressed desktop and mobile captures of all 18 websites. Featured projects have taller previews that scroll on hover. Use the project's ID for its WebP filename, with `-mobile` and `-preview` suffixes for variants.
- `data/testimonials.ts`: the two supplied Google Drive video reviews, with portrait sizing and verified durations. The carousel supports buttons, keyboard arrows and swiping its counter area. See `VIDEO-TESTIMONIALS.md` for Drive embeds or direct video files.
- `data/content.ts`: services, process, and the three FAQs.
- `public/images/hamid-hero.webp`: the portrait used in both Hero and About.
- Set `NEXT_PUBLIC_SITE_URL` when moving to a custom domain, then rebuild. This controls canonicals, OpenGraph URLs, structured data, robots, and the sitemap.

## Contact behavior

The `/contact/` page is **The First Conversation**: the final approved Soft UI design with four category choices, three required entry fields, a small real portrait, orange path artwork and a compact three-step process. It uses the owner's public Web3Forms identifier and hCaptcha. Email sending requires provider acceptance; failure keeps the visitor's note. The owner has confirmed hCaptcha is enabled in Web3Forms. See [the final-reference implementation record](docs/contact-final-reference.md), including the outstanding real-inbox verification. `npm run test:contact` tests the current contact route, controlled provider outcomes and preserved planner/agency delivery paths.

Direct WhatsApp, email, LinkedIn and Instagram remain available. The project planner can download a local outline or open a WhatsApp draft for review. Its separate optional website-send path and the agency form retain the existing Vercel/Turnstile/Upstash/Resend configuration; Web3Forms does not silently enable those routes. Google Drive supplies the selected testimonial video through its embedded player.

The Contact FAQ uses the approved solid charcoal/ivory editorial split with a numbered, single-open accordion and a dedicated stacked mobile layout. See [the locked FAQ implementation record](docs/contact-faq-editorial.md) for screenshots and verified checks. `npm run test:contact-faq` tests its responsive layout, keyboard/touch controls, motion, no-script fallback and optional before/after preservation captures.

On mobile, a small WhatsApp action appears after the hero and stays hidden in dialogs, while testimonials are visible, and at or below the contact section. The services section includes a clearly labelled, local workflow illustration; it is not connected to an AI service and sends no data.

## Motion and performance

- The full-screen intro overlay has been removed so it cannot cover the first useful content.
- Smooth scrolling, scroll reveals, cursor interpolation, portrait depth, and the monogram honor reduced motion.
- The monogram loads near its section, skips narrow mobile devices, and pauses offscreen or in a hidden tab. A typographic H remains if WebGL is unavailable.
- Native dialogs provide focus containment and Escape dismissal. Touch users retain all actions without hover.
- Latin fonts are bundled locally. Portrait and desktop project images have responsive WebP variants with explicit dimensions. Images use preoptimized assets without a server image optimizer. Below-fold images and Drive embeds are lazy-loaded.
- GSAP/Lenis load when idle on wide screens with a fine pointer and reduced motion off. Phones use native scrolling without loading those effects. Initial content remains visible.
- The build creates Brotli/gzip variants. The local production server negotiates compression, normalizes slash/index.html duplicates, aliases `/portfolio/` to `/work/`, and keeps the existing byte-range support.

## Deployment

`.openai/hosting.json` identifies the existing private Sites deployment. The output folder is `out/`. Running locally does not publish changes.

The canonical default is the owner-selected `https://itshamid.com`. Domain registration, DNS and hosting connection are external steps; the local preview does not establish them. Rebuild after any origin change so canonical links, sharing metadata, robots and the sitemap stay consistent. The sharing card and Apple icon are bundled locally; regenerate them with `npm run assets:brand` after changing `public/social-card.svg` or `public/favicon.svg`.

Validate with `npm run build`, `npm run test:browser`, and `npm audit --omit=dev`. To test the actual static output, run `npm start` after building; an optional `PORT` environment variable selects a different port. Set `QA_BASE_URL` when checking that port. The preview server includes MIME types, basic response headers, 404 handling, and immutable caching for versioned Next.js assets. Configure equivalent headers and HTTPS on the eventual hosting provider.
