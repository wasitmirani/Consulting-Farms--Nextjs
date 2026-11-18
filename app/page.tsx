import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroScene from "@/components/three/HeroScene";
import EnquiryForm from "@/components/EnquiryForm";
import EnquireButton from "@/components/EnquireButton";
import FacilityExplorer from "@/components/FacilityExplorer";
import GreenhouseExplorer from "@/components/GreenhouseExplorer";
import VideoShowcase from "@/components/VideoShowcase";
import CalculatorWithRates from "@/components/CalculatorWithRates";
import Link from "next/link";
import RevealObserver from "@/components/RevealObserver";
import {
  ArrowRight, Sprout, Greenhouse, Leaf, Users, Shield, Package, Plus, Check,
  Phone, Mail, Pin, Instagram, WhatsApp, Drag, Rack, Warehouse, Snow, Youtube, Clock,
} from "@/components/Icons";
import { site, products, services, processSteps, faqs, costFaqs, facilityZones, whatsappLink, formatPhone, telHref, mapsLink } from "@/lib/site";

const homeFaqs = [...faqs, costFaqs[0], costFaqs[2]];

const serviceIcons = { sprout: Sprout, rack: Rack, warehouse: Warehouse, greenhouse: Greenhouse, leaf: Leaf, users: Users } as const;
const zoneIcons = [Warehouse, Sprout, Rack, Snow];

const VIDEO = { id: "OhywCiVRCxc", title: "ConsultingFarms: Guiding You Towards Success" };

const marquee = [
  { src: "/images/farm/grow-room-rack.jpg", alt: "Mushrooms fruiting on grow-room racks" },
  { src: "/images/farm/greenhouse-crops.jpg", alt: "Greenhouse crop rows" },
  { src: "/images/farm/oyster-led.jpg", alt: "Oyster mushrooms under grow lights" },
  { src: "/images/farm/vertical-lettuce.jpg", alt: "Lettuce on vertical hydroponic racks" },
  { src: "/images/farm/button-beds.jpg", alt: "Button mushroom beds" },
  { src: "/images/farm/greenhouse-tomato.jpg", alt: "Tomatoes growing in a greenhouse" },
  { src: "/images/farm/maitake.jpg", alt: "Clustered specialty mushroom" },
  { src: "/images/farm/hydroponic-raft.jpg", alt: "Hydroponic raft of leafy greens" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  const wa = whatsappLink(`Hello ${site.name}, I'd like to enquire about `);

  return (
    <>
      <Header />
      <RevealObserver />
      <main id="main">
        {/* ================================================= HERO */}
        <section id="top" className="p-2 sm:p-3">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary text-white sm:rounded-[2.5rem]">
            <Image
              src="/images/farm/grow-room-rack.jpg"
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className="-z-20 object-cover opacity-30"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#0e2a1f_0%,rgba(14,42,31,0.94)_38%,rgba(14,42,31,0.7)_70%,rgba(14,42,31,0.55)_100%)]" />
            <div aria-hidden className="absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-highlight/20 blur-[130px]" />

            <div className="mx-auto grid max-w-7xl items-center gap-2 px-5 pt-28 pb-10 sm:px-8 lg:min-h-[min(calc(100svh-1.5rem),860px)] lg:grid-cols-[1fr_1.05fr] lg:pt-24 lg:pb-12">
              <div className="relative z-10">
                <p className="rise eyebrow eyebrow-dark">Mushroom farming · Greenhouse consulting · Dubai, UAE</p>
                <h1 className="rise mt-6 font-display text-[2.9rem] leading-[0.98] font-semibold tracking-[-0.035em] sm:text-7xl lg:text-[4.4rem] xl:text-[5rem]" style={{ animationDelay: "80ms" }}>
                  Grown with care.
                  <span className="block text-highlight">Farmed with know&#8209;how.</span>
                </h1>
                <p className="rise mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg" style={{ animationDelay: "160ms" }}>
                  Dubai-based {site.name} grows fresh mushrooms in dedicated grow rooms and helps farmers across the UAE build productive
                  farms — with hands-on consulting in mushroom cultivation, greenhouse management and
                  hydroponic growing.
                </p>
                <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
                  <a href="#contact" className="group inline-flex items-center gap-3 rounded-full bg-highlight py-2 pr-2 pl-6 text-[15px] font-semibold text-primary shadow-[0_14px_34px_-12px_rgba(184,224,74,0.7)] transition-transform hover:-translate-y-0.5">
                    Request a Quote
                    <span className="grid size-10 place-items-center rounded-full bg-primary text-highlight transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="size-4" />
                    </span>
                  </a>
                  <a href="#video" className="inline-flex items-center gap-3 rounded-full border border-white/25 py-2 pr-6 pl-2 text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
                    <span className="grid size-10 place-items-center rounded-full bg-white text-primary">
                      <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
                    </span>
                    Watch our story
                  </a>
                </div>
                <dl className="rise mt-12 grid max-w-lg grid-cols-3 gap-3" style={{ animationDelay: "320ms" }}>
                  {[
                    ["4", "farm rooms, start to finish"],
                    ["8", "stage growing process"],
                    ["B2B", "& household supply"],
                  ].map(([k, v]) => (
                    <div key={v} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <dt className="sr-only">{v}</dt>
                      <dd className="font-display text-3xl font-semibold text-highlight">{k}</dd>
                      <dd className="mt-1 text-xs leading-snug text-white/65">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative -mx-5 h-[360px] sm:mx-0 sm:h-[480px] lg:h-[640px]">
                <HeroScene />
                <div className="float-slow pointer-events-none absolute top-[10%] left-0 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-5 shadow-2xl backdrop-blur-xl lg:flex">
                  <span className="relative size-12 overflow-hidden rounded-xl">
                    <Image src="/images/farm/substrate-straw.jpg" alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Planting warehouse</span>
                    <span className="block text-xs text-white/65">Substrate, bagging & spawning</span>
                  </span>
                </div>
                <div className="float-slow-alt pointer-events-none absolute right-2 bottom-[14%] hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-5 shadow-2xl backdrop-blur-xl lg:flex">
                  <span className="relative size-12 overflow-hidden rounded-xl">
                    <Image src="/images/farm/button-beds.jpg" alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Grow rooms</span>
                    <span className="block text-xs text-white/65">Hand-harvested at the right stage</span>
                  </span>
                </div>
                <p className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur [@media(pointer:fine)]:flex">
                  <Drag className="size-4" /> Drag to explore in 3D
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= PHOTO RIBBON */}
        <section aria-label="Photos from our farm" className="overflow-hidden py-6">
          <div className="marquee flex w-max gap-4">
            {[...marquee, ...marquee].map((m, i) => (
              <div key={i} className="relative h-36 w-56 shrink-0 overflow-hidden rounded-2xl sm:h-44 sm:w-72" aria-hidden={i >= marquee.length}>
                <Image src={m.src} alt={i < marquee.length ? m.alt : ""} fill sizes="288px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* ================================================= ABOUT */}
        <section id="about" aria-labelledby="about-title" className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div data-reveal className="relative grid h-[480px] grid-cols-5 grid-rows-6 gap-3 sm:h-[560px]">
              <div className="relative col-span-3 row-span-6 overflow-hidden rounded-3xl">
                <Image src="/images/farm/inspection.jpg" alt="Checking mushroom beds in a grow room" fill sizes="(min-width:1024px) 30vw, 60vw" className="object-cover" />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl">
                <Image src="/images/farm/oyster-led.jpg" alt="Oyster mushrooms under grow lights" fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl">
                <Image src="/images/farm/greenhouse-rows.jpg" alt="Greenhouse rows of leafy crops" fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl bg-primary p-4 pr-6 text-white shadow-2xl sm:left-10">
                <span className="grid size-12 place-items-center rounded-xl bg-highlight text-primary"><Sprout className="size-6" /></span>
                <span>
                  <span className="block font-display text-lg font-semibold">Growers first</span>
                  <span className="block text-sm text-white/65">Advice that comes from practice</span>
                </span>
              </div>
            </div>

            <div data-reveal>
              <p className="eyebrow">About Consulting Farms</p>
              <h2 id="about-title" className="section-title mt-5">We grow it ourselves — then help you grow it too</h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/70">
                Consulting Farms is a mushroom farm and agricultural consultancy. We run our own grow rooms and
                planting warehouse, and we work in greenhouses and hydroponic systems every day. That hands-on
                experience is what we bring to every farm we advise.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Fresh mushrooms for homes & businesses",
                  "Grow-room & warehouse design",
                  "Greenhouse management support",
                  "Hydroponic & vertical farming",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3.5 text-[15px] font-medium text-primary">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-highlight text-primary"><Check className="size-4" /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#services" className="btn-primary px-6 py-3.5 text-[15px]">Explore our services <ArrowRight className="size-4" /></a>
                <a href="#farm" className="btn-ghost px-6 py-3.5 text-[15px]">Tour the farm in 3D</a>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= VIDEO */}
        <section id="video" aria-labelledby="video-title" className="px-2 sm:px-3">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary py-20 text-white sm:rounded-[2.5rem] sm:py-24">
            <div aria-hidden className="absolute -bottom-40 -left-20 size-[36rem] rounded-full bg-secondary/30 blur-[120px]" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
              <div data-reveal>
                <p className="eyebrow eyebrow-dark">Watch</p>
                <h2 id="video-title" className="mt-5 font-display text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance sm:text-5xl">
                  See Consulting Farms in action
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-white/70">
                  A look at how we guide farmers towards success — from grow rooms and substrate to
                  harvest-ready crops.
                </p>
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 py-2 pr-5 pl-2 text-[15px] font-semibold transition-colors hover:bg-white/10"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-[#ff0033] text-white"><Youtube className="size-5" /></span>
                  More on our YouTube channel
                </a>
              </div>
              <div data-reveal>
                <VideoShowcase id={VIDEO.id} title={VIDEO.title} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= PRODUCTS */}
        <section id="products" aria-labelledby="products-title" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">Products</p>
                <h2 id="products-title" className="section-title mt-5">Fresh from our grow rooms</h2>
              </div>
              <p className="max-w-md text-ink/70">
                Mushrooms and greens grown on our own farm. Availability changes with the season — ask us
                for what&apos;s current.
              </p>
            </div>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <li key={p.slug} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-card ring-1 ring-primary/5 transition-transform duration-300 hover:-translate-y-1.5">
                  <div className="relative aspect-[4/3.4] overflow-hidden rounded-[1.4rem]">
                    <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-primary uppercase backdrop-blur">
                      {p.form}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-primary">{p.name}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/65">{p.summary}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Suited to">
                      {p.audiences.map((a) => (
                        <li key={a} className="rounded-full bg-tint px-2.5 py-1 text-xs font-medium text-primary">{a}</li>
                      ))}
                    </ul>
                    <EnquireButton product={p.name} type="Product enquiry" className="mt-5 inline-flex items-center justify-between rounded-full bg-cream py-1.5 pr-1.5 pl-4 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      Enquire now
                      <span className="grid size-8 place-items-center rounded-full bg-highlight text-primary"><ArrowRight className="size-4" /></span>
                    </EnquireButton>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================= SERVICES */}
        <section id="services" aria-labelledby="services-title" className="bg-cream py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">Services</p>
                <h2 id="services-title" className="section-title mt-5">Consulting for mushroom farms, greenhouses &amp; hydroponics</h2>
              </div>
              <EnquireButton type="Farm setup & consulting" product="Consulting services" className="btn-primary shrink-0 px-6 py-3.5 text-[15px]">
                Book a consultation <ArrowRight className="size-4" />
              </EnquireButton>
            </div>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => {
                const Icon = serviceIcons[s.icon];
                return (
                  <li key={s.title} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }} className="group relative h-[400px] overflow-hidden rounded-[1.75rem]">
                    <Image src={s.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07190f] via-[#07190f]/55 to-transparent transition-colors duration-500 group-hover:via-[#07190f]/75" />
                    <span className="absolute top-5 left-5 grid size-12 place-items-center rounded-2xl bg-white/15 text-highlight backdrop-blur-md ring-1 ring-white/20">
                      <Icon className="size-6" />
                    </span>
                    <span className="absolute top-6 right-6 font-display text-sm font-semibold text-white/60">0{i + 1}</span>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <h3 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75">{s.body}</p>
                      <EnquireButton type={s.title.includes("Greenhouse") ? "Greenhouse management" : "Farm setup & consulting"} product="Consulting services" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-highlight">
                        Discuss your project <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </EnquireButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ================================================= COST CALCULATOR */}
        <section id="calculator" aria-labelledby="calculator-title" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">Free cost calculator</p>
                <h2 id="calculator-title" className="section-title mt-5">What will your farm cost to set up?</h2>
              </div>
              <p className="max-w-md text-ink/70">
                Get an instant indicative estimate in AED for a mushroom farm or greenhouse in the UAE — then send it
                to our experts for a detailed quotation.{" "}
                <Link href="/calculator" className="font-semibold text-secondary underline underline-offset-4">Open full calculator</Link>
              </p>
            </div>
            <div data-reveal className="mt-12">
              <CalculatorWithRates />
            </div>
          </div>
        </section>

        {/* ================================================= INSIDE THE FARM (3D) */}
        <section id="farm" aria-labelledby="farm-title" className="px-2 py-2 sm:px-3">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary-deep py-20 text-white sm:rounded-[2.5rem] sm:py-24">
            <div aria-hidden className="absolute -top-40 left-1/3 size-[40rem] rounded-full bg-secondary/25 blur-[130px]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div data-reveal className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <div>
                  <p className="eyebrow eyebrow-dark">Inside our farm · 3D</p>
                  <h2 id="farm-title" className="mt-5 font-display text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance sm:text-5xl">
                    Grow rooms &amp; planting warehouse, room by room
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-white/70">
                  Our farm is organised into four rooms that every crop moves through in order — the{" "}
                  <strong className="text-white">planting warehouse</strong>, the <strong className="text-white">incubation room</strong>, the{" "}
                  <strong className="text-white">grow rooms</strong> and <strong className="text-white">packing &amp; cold store</strong>. Pick a room to step inside.
                </p>
              </div>
              <div data-reveal className="mt-12">
                <FacilityExplorer />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= PROCESS */}
        <section id="process" aria-labelledby="process-title" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Our farming process</p>
              <h2 id="process-title" className="section-title mt-5">How are our mushrooms grown?</h2>
              <p className="mt-5 text-lg text-ink/70">
                Mushrooms are grown in eight stages across our four rooms — from preparing the growing medium in
                the planting warehouse to packing in the cold store.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {facilityZones.map((z, zi) => {
                const Icon = zoneIcons[zi];
                const steps = processSteps.map((s, i) => ({ ...s, n: i + 1 })).filter((s) => s.zone === zi);
                return (
                  <div key={z.id} data-reveal style={{ transitionDelay: `${zi * 90}ms` }} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-primary/5">
                    <div className="relative h-36">
                      <Image src={z.image} alt={z.imageAlt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                        <span className="grid size-9 place-items-center rounded-xl text-primary" style={{ background: z.color }}>
                          <Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">Room {zi + 1}</span>
                          <span className="block font-display text-lg leading-tight font-semibold">{z.name}</span>
                        </span>
                      </span>
                    </div>
                    <ol className="space-y-5 p-6">
                      {steps.map((s) => (
                        <li key={s.title} className="flex gap-3">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint font-display text-sm font-semibold text-primary">{s.n}</span>
                          <div>
                            <p className="font-semibold text-primary">{s.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-ink/65">{s.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= GREENHOUSE (3D) */}
        <section id="greenhouse" aria-labelledby="greenhouse-title" className="bg-cream py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
              <div>
                <p className="eyebrow">Greenhouse management · 3D</p>
                <h2 id="greenhouse-title" className="section-title mt-5">What does greenhouse management involve?</h2>
              </div>
              <p className="text-lg leading-relaxed text-ink/70">
                Greenhouse management is the day-to-day work of balancing <strong className="text-primary">temperature,
                humidity, light, water and airflow</strong> so the crop grows steadily and stays healthy. Switch the
                systems on and off to see how each one works.
              </p>
            </div>

            <div data-reveal className="mt-12">
              <GreenhouseExplorer />
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-4 md:grid-rows-2">
              {[
                { src: "/images/farm/greenhouse-crops.jpg", t: "Greenhouse crops", c: "md:col-span-2 md:row-span-2" },
                { src: "/images/farm/greenhouse-fans.jpg", t: "Ventilation & fans", c: "" },
                { src: "/images/farm/greenhouse-tomato.jpg", t: "Tomatoes under cover", c: "" },
                { src: "/images/farm/vertical-farm.jpg", t: "Vertical hydroponics", c: "" },
                { src: "/images/farm/greenhouse-cucumber.jpg", t: "Climbing crops", c: "" },
              ].map((g, i) => (
                <figure key={g.src} data-reveal style={{ transitionDelay: `${i * 60}ms` }} className={`group relative min-h-52 overflow-hidden rounded-[1.5rem] ${g.c}`}>
                  <Image src={g.src} alt={g.t} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur">{g.t}</figcaption>
                </figure>
              ))}
            </div>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "Climate", d: "Vents, shading and air movement keep heat and humidity in a healthy range through the day and season." },
                { t: "Light", d: "Shade on harsh days, extra light when it's short — so plants get what they need without stress." },
                { t: "Water & nutrients", d: "Drip lines feed each row at the root zone, matched to the crop's stage and the weather." },
                { t: "Hygiene & crop health", d: "Clean benches, good airflow and regular scouting catch pests and disease early." },
              ].map((p, i) => (
                <li key={p.t} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="rounded-[1.5rem] bg-white p-6 ring-1 ring-primary/5">
                  <span className="grid size-10 place-items-center rounded-xl bg-highlight font-display text-sm font-semibold text-primary">0{i + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold text-primary">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================= WHOLESALE */}
        <section id="wholesale" aria-labelledby="wholesale-title" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="grid overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-primary/5 lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-14">
                <p className="eyebrow">Wholesale &amp; business supply</p>
                <h2 id="wholesale-title" className="section-title mt-5">Supplying kitchens, shelves and distributors</h2>
                <p className="mt-6 text-lg leading-relaxed text-ink/70">
                  Do you need a regular supply of mushrooms? Tell us the variety, volume and how often you need it,
                  and we&apos;ll plan supply with you and send a quotation.
                </p>
                <ol className="mt-10 space-y-6">
                  {[
                    { t: "Share your requirement", d: "Product, approximate quantity, frequency and delivery area." },
                    { t: "Receive a quotation", d: "We confirm availability, packaging and current pricing." },
                    { t: "Set up regular supply", d: "One-off orders or a recurring schedule that suits your business." },
                  ].map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-highlight">{i + 1}</span>
                      <div>
                        <h3 className="font-semibold text-primary">{s.t}</h3>
                        <p className="mt-1 text-ink/65">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <EnquireButton type="Wholesale supply" className="btn-primary mt-10 px-6 py-3.5 text-[15px]">
                  Start a wholesale enquiry <ArrowRight className="size-4" />
                </EnquireButton>
              </div>

              <div className="relative min-h-[520px] p-8 text-white sm:p-12 lg:p-14">
                <Image src="/images/farm/button-beds.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-[#07190f]/80" />
                <div className="relative">
                  <h3 className="font-display text-3xl font-semibold">Who we work with</h3>
                  <ul className="mt-7 grid grid-cols-2 gap-2.5">
                    {["Households", "Restaurants & cafés", "Hotels & catering", "Grocers & supermarkets", "Distributors", "Food processors", "New growers", "Greenhouse farms"].map((a) => (
                      <li key={a} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] font-medium backdrop-blur">{a}</li>
                    ))}
                  </ul>
                  <h3 className="mt-11 font-display text-3xl font-semibold">Why work with us</h3>
                  <ul className="mt-6 space-y-5">
                    {[
                      { i: Sprout, t: "Growers, not middlemen", d: "We farm and consult, so our advice comes from practice." },
                      { i: Shield, t: "Straight answers", d: "Clear information on availability and pricing — no inflated promises." },
                      { i: Package, t: "Careful handling", d: "Harvested, sorted and packed to arrive in good condition." },
                    ].map(({ i: Icon, t, d }) => (
                      <li key={t} className="flex gap-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-highlight text-primary"><Icon className="size-5" /></span>
                        <div>
                          <p className="font-semibold">{t}</p>
                          <p className="mt-1 text-white/70">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= KNOWLEDGE */}
        <section aria-labelledby="knowledge-title" className="pb-20 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">Knowledge centre</p>
              <h2 id="knowledge-title" className="section-title mt-5">Guides for buyers and growers</h2>
              <p className="mt-5 text-ink/70">Practical, fact-checked articles are on the way. Here&apos;s what we&apos;re writing first.</p>
            </div>
            <ul className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { tag: "Buying", t: "How to store fresh mushrooms so they last", d: "Simple kitchen and cold-room habits that keep mushrooms firm and fresh.", img: "/images/farm/mushroom-crates.jpg" },
                { tag: "Growing", t: "Setting up your first grow room", d: "Space, racks, humidity, fresh air and hygiene — the decisions that matter most.", img: "/images/farm/grow-room-wide.jpg" },
                { tag: "Greenhouse", t: "Hydroponics vs soil: which suits your farm?", d: "A practical comparison of cost, crops, water use and day-to-day management.", img: "/images/farm/hydroponic-raft.jpg" },
              ].map((a, i) => (
                <li key={a.t} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white p-2 ring-1 ring-primary/5">
                  <div className="relative h-48 overflow-hidden rounded-[1.4rem]">
                    <Image src={a.img} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">{a.tag}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl leading-snug font-semibold text-primary">{a.t}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/65">{a.d}</p>
                    <p className="mt-5 text-sm font-semibold text-secondary">Coming soon</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================= FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="bg-cream py-20 sm:py-28">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div data-reveal>
              <p className="eyebrow">FAQs</p>
              <h2 id="faq-title" className="section-title mt-5">Questions we&apos;re often asked</h2>
              <p className="mt-5 text-ink/70">Can&apos;t find your answer? Send us a message and we&apos;ll reply directly.</p>
              <a href="#contact" className="btn-primary mt-8">Ask a question <ArrowRight className="size-4" /></a>
              <div className="relative mt-10 hidden h-64 overflow-hidden rounded-[1.75rem] lg:block">
                <Image src="/images/farm/team-grow-room.jpg" alt="In one of our mushroom grow rooms" fill sizes="30vw" className="object-cover object-top" />
              </div>
            </div>
            <div data-reveal className="space-y-3">
              {homeFaqs.map((f, i) => (
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
          </div>
        </section>

        {/* ================================================= CONTACT */}
        <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-20 sm:py-28">
          <div aria-hidden className="absolute top-20 -left-40 -z-10 size-[30rem] rounded-full bg-accent-soft/50 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div data-reveal>
              <p className="eyebrow">Contact</p>
              <h2 id="contact-title" className="section-title mt-5">Request a quote or book a consultation</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink/70">
                Tell us what you need and we&apos;ll reply with availability, pricing or next steps.
              </p>

              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" data-track="whatsapp" className="group flex h-full flex-col gap-3 rounded-2xl bg-primary p-5 text-white transition-transform hover:-translate-y-0.5">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#25d366] text-white"><WhatsApp className="size-6" /></span>
                    <span>
                      <span className="block text-sm text-white/60">WhatsApp</span>
                      <span className="mt-0.5 flex items-center gap-1.5 font-semibold">Chat with us <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={telHref(site.phone)} data-track="phone" className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-primary/5 transition-transform hover:-translate-y-0.5">
                    <span className="grid size-11 place-items-center rounded-xl bg-tint text-primary"><Phone className="size-5" /></span>
                    <span>
                      <span className="block text-sm text-ink/55">Call us</span>
                      <span className="mt-0.5 block font-semibold whitespace-nowrap text-primary">{formatPhone(site.phone)}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} data-track="email" className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-primary/5 transition-transform hover:-translate-y-0.5">
                    <span className="grid size-11 place-items-center rounded-xl bg-tint text-primary"><Mail className="size-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-sm text-ink/55">Email</span>
                      <span className="mt-0.5 block text-[15px] font-semibold break-all text-primary">{site.email}</span>
                    </span>
                  </a>
                </li>
                <li className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-primary/5">
                  <span className="grid size-11 place-items-center rounded-xl bg-tint text-primary"><Clock className="size-5" /></span>
                  <span>
                    <span className="block text-sm text-ink/55">Office hours</span>
                    <span className="mt-0.5 block font-semibold text-primary">{site.hours}</span>
                  </span>
                </li>
                <li className="sm:col-span-2">
                  <a href={mapsLink(site.address)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-primary/5 transition-transform hover:-translate-y-0.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-highlight text-primary"><Pin className="size-5" /></span>
                    <address className="not-italic">
                      <span className="block text-sm text-ink/55">Head office · {site.address.city}, UAE</span>
                      <span className="mt-0.5 block font-semibold text-primary">
                        {site.address.office}, {site.address.area}, {site.address.city}
                      </span>
                    </address>
                    <ArrowRight className="ml-auto size-5 shrink-0 text-secondary transition-transform group-hover:translate-x-1" />
                  </a>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink/60">
                Follow us
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full bg-white text-[#b01f61] ring-1 ring-primary/10 hover:bg-tint"><Instagram className="size-5" /></a>
                <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid size-10 place-items-center rounded-full bg-white text-[#d4002a] ring-1 ring-primary/10 hover:bg-tint"><Youtube className="size-5" /></a>
              </div>
            </div>

            <div data-reveal>
              <EnquiryForm />
            </div>
          </div>

          {/* Map */}
          <div data-reveal className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-primary/10">
              <iframe
                title={`Map: ${site.address.full}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent("Al Manara Tower, Business Bay, Dubai")}&output=embed`}
                className="h-[340px] w-full border-0 grayscale-[35%] sm:h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute top-4 right-4 hidden max-w-xs rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur sm:block">
                <p className="font-display text-lg font-semibold text-primary">{site.legalName}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">
                  {site.address.office}
                  <br />
                  {site.address.area}, {site.address.city}, UAE
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        data-track="whatsapp"
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] p-3.5 text-white shadow-[0_12px_30px_-8px_rgba(18,140,74,0.7)] transition-transform hover:scale-105 sm:right-6 sm:bottom-6 sm:pr-5"
      >
        <WhatsApp className="size-7" />
        <span className="hidden text-sm font-semibold sm:inline">WhatsApp us</span>
      </a>
    </>
  );
}
