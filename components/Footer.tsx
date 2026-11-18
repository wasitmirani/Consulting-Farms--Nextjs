import Link from "next/link";
import { LogoMark, Instagram, Youtube } from "./Icons";
import { site, formatPhone, telHref, mapsLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary-deep text-white/75">
      <div aria-hidden className="absolute -top-40 right-0 size-[34rem] rounded-full bg-secondary/20 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/#top" className="inline-flex items-center gap-3">
            <LogoMark className="size-11 rounded-full ring-1 ring-white/15" />
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">{site.name}</span>
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-white/60">{site.description}</p>
          <div className="mt-6 flex gap-2">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
              aria-label="Consulting Farms on Instagram"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
              aria-label="Consulting Farms on YouTube"
            >
              <Youtube className="size-5" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold tracking-[0.14em] text-highlight uppercase">Explore</h2>
          <ul className="mt-5 space-y-3">
            {[
              ["About", "/#about"],
              ["Products", "/#products"],
              ["Services", "/#services"],
              ["Our Farm", "/#farm"],
              ["Greenhouse", "/#greenhouse"],
              ["Wholesale Supply", "/#wholesale"],
              ["Cost Calculator", "/calculator"],
              ["FAQs", "/#faq"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="transition-colors hover:text-white">{l}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-[0.14em] text-highlight uppercase">Get in touch</h2>
          <ul className="mt-5 space-y-3">
            <li><a href={telHref(site.phone)} className="hover:text-white">{formatPhone(site.phone)}</a></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            <li><a href={mapsLink(site.address)} target="_blank" rel="noopener noreferrer" className="hover:text-white">{site.address.office}, {site.address.area}, {site.address.city}, UAE</a></li>
            <li className="text-white/50">{site.hours}</li>
            <li><Link href="/#contact" className="hover:text-white">Send an enquiry</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-white/45 sm:px-6 lg:px-8">
          © {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
