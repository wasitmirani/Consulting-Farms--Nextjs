import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { site, services } from "@/lib/site";
import FootprintTracker from "@/components/FootprintTracker";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const seoTitle = "Mushroom Farm & Greenhouse Consulting in Dubai, UAE";
const seoDescription =
  "Dubai-based Consulting Farms grows fresh mushrooms and helps you set up profitable mushroom farms, greenhouses and hydroponic systems in the UAE. Free cost calculator & expert consultation.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${seoTitle} | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: seoDescription,
  applicationName: site.name,
  category: "agriculture",
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "mushroom farm Dubai",
    "mushroom farming UAE",
    "mushroom farm consultant",
    "mushroom farm setup cost",
    "greenhouse consulting UAE",
    "greenhouse management Dubai",
    "hydroponic farm setup Dubai",
    "vertical farming UAE",
    "fresh mushrooms supplier Dubai",
    "wholesale mushrooms UAE",
    "oyster mushrooms UAE",
    "button mushrooms Dubai",
    "agriculture consultancy Dubai",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${seoTitle} | ${site.name}`,
    description: seoDescription,
    url: "/",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: `${seoTitle} | ${site.name}`,
    description: seoDescription,
  },
  formatDetection: { telephone: true, email: true, address: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: {
    "geo.region": "AE-DU",
    "geo.placename": "Dubai",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e2a1f",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Office in Dubai → a LocalBusiness subtype is appropriate
      "@type": "ProfessionalService",
      "@id": `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      description: site.description,
      email: site.email,
      telephone: site.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.office,
        addressLocality: `${site.address.area}, ${site.address.city}`,
        addressRegion: site.address.city,
        addressCountry: site.address.countryCode,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: site.phone,
        email: site.email,
        availableLanguage: ["English"],
      },
      sameAs: [site.social.instagram, site.social.youtube],
      image: `${site.url}/images/farm/grow-room-rack.jpg`,
      logo: `${site.url}/icon.svg`,
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
      knowsAbout: ["Mushroom cultivation", "Greenhouse management", "Hydroponics", "Vertical farming", "Grow-room design", "Agricultural consulting"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Consulting services",
        itemListElement: services.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.body, areaServed: "United Arab Emirates" },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
        />
        <FootprintTracker />
        {children}
      </body>
    </html>
  );
}
