import { Hero } from "@/components/hero/Hero";
import { Capabilities } from "@/components/sections/Capabilities";
import { Work } from "@/components/projects/Work";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { MobileContact } from "@/components/layout/MobileContact";
import { site } from "@/data/site";
import { pageMeta, pageSchema } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreFurther } from "@/components/sections/ExploreFurther";

export const metadata = pageMeta(site.title, site.description, "/");

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Work />
      <Capabilities />
      <About />
      <Testimonials />
      <Process />
      <ExploreFurther />
      <Faq />
      <Contact />
      <MobileContact />
      <JsonLd
        data={pageSchema("/", site.title, site.description, {
          mainEntity: "/#person",
        })}
      />
    </main>
  );
}
