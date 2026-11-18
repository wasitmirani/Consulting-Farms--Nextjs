import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalculatorWithRates from "@/components/CalculatorWithRates";
import { ArrowRight, Plus, Sprout, Greenhouse, Mail } from "@/components/Icons";
import { site, costFaqs } from "@/lib/site";

const title = "Mushroom Farm & Greenhouse Cost Calculator (UAE)";
const description =
  "Free calculator: estimate the setup and running cost of a mushroom farm or greenhouse in Dubai & the UAE in AED. Pick your area, cooling and growing system, then get an expert quotation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/calculator" },
  keywords: [
    "mushroom farm cost UAE",
    "mushroom farm setup cost Dubai",
    "greenhouse cost per square metre UAE",
    "greenhouse cost calculator",
    "hydroponic farm cost Dubai",
    "fan and pad greenhouse cost",
    "mushroom grow room cost",
  ],
  openGraph: { title, description, url: "/calculator", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Consulting Farms Cost Calculator",
      url: `${site.url}/calculator`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any (web browser)",
      description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
      provider: { "@id": `${site.url}/#organization` },
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Cost Calculator", item: `${site.url}/calculator` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: costFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function CalculatorPage() {
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <main id="main">
        <section className="p-2 sm:p-3">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary pt-28 pb-14 text-white sm:rounded-[2.5rem] sm:pb-16">
            <Image src="/images/farm/greenhouse-crops.jpg" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="-z-20 object-cover opacity-25" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <nav aria-label="Breadcrumb" className="text-sm text-white/60">
                <ol className="flex items-center gap-2">
                  <li><Link href="/" className="hover:text-white">Home</Link></li>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="text-white">Cost calculator</li>
                </ol>
              </nav>
              <h1 className="mt-6 max-w-3xl font-display text-[2.4rem] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-6xl">
                How much does a mushroom farm or greenhouse <span className="text-highlight">cost in the UAE?</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                Get an instant, indicative estimate in AED. Choose your area, setup level, cooling and growing
                system — then send it to our team for a detailed quotation. Free, no sign-up.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2 text-sm">
                {["Instant AED estimate", "Setup + running costs", "Expert follow-up"].map((t) => (
                  <li key={t} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="calculator" aria-label="Cost calculator" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <CalculatorWithRates />
          </div>
        </section>

        <section aria-labelledby="how-title" className="bg-cream py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="eyebrow">How it works</p>
            <h2 id="how-title" className="section-title mt-5">How the estimate is calculated</h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { i: Sprout, t: "Mushroom farms", d: "Cost per m² of grow room by setup level, adjusted for mushroom type and rack tiers, plus optional planting warehouse, spawn area and cold store." },
                { i: Greenhouse, t: "Greenhouses", d: "Cost per m² for the structure, cooling and growing system — the three biggest cost drivers in the UAE — plus screens, automation and water treatment." },
                { i: Mail, t: "Expert quotation", d: "Your inputs are emailed to our team. We review them against your site and goals and come back with a tailored, itemised quotation." },
              ].map(({ i: Icon, t, d }) => (
                <div key={t} className="rounded-[1.5rem] bg-white p-7 ring-1 ring-primary/5">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-highlight"><Icon className="size-6" /></span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-primary">{t}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cost-faq-title" className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="eyebrow">Cost FAQs</p>
            <h2 id="cost-faq-title" className="section-title mt-5">Common questions about farm setup costs</h2>
            <div className="mt-10 space-y-3">
              {costFaqs.map((f, i) => (
                <details key={f.q} className="group rounded-2xl bg-white px-6 ring-1 ring-primary/5 open:shadow-card" open={i === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-primary">
                    <h3>{f.q}</h3>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-primary transition-colors group-open:bg-highlight">
                      <Plus className="faq-icon size-4 transition-transform duration-300" />
                    </span>
                  </summary>
                  <p className="pr-10 pb-6 leading-relaxed text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] bg-primary p-7 text-white">
              <p className="font-display text-2xl font-semibold">Prefer to talk it through?</p>
              <Link href="/#contact" className="inline-flex items-center gap-2 rounded-full bg-highlight px-6 py-3 font-semibold text-primary">
                Contact our team <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
