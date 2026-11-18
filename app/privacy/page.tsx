import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: `How ${site.name} collects and uses the information you send through our enquiry form.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="bg-paper pt-32 pb-24">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-ink/55">
            <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden>/</span> Privacy notice
          </nav>
          <h1 className="mt-6 font-display text-4xl font-medium text-primary sm:text-5xl">Privacy notice</h1>
          <div className="mt-10 space-y-8 text-[17px] leading-relaxed text-ink/75 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-primary">
            <p className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm text-ink/70">
              Draft — to be reviewed and approved by {site.name} for its jurisdiction before launch.
            </p>
            <section>
              <h2>What we collect</h2>
              <p className="mt-3">
                When you send an enquiry we collect the details you enter: your name, business name, email,
                phone/WhatsApp number, enquiry type, product of interest, quantity, delivery area and message — and,
                if you use our cost calculator, the options you selected and your estimate.
              </p>
              <p className="mt-3">
                To understand which channels bring enquiries, we also attach basic technical information to your
                submission: the page you first landed on, the referring website or campaign link (for example UTM
                tags), pages viewed, time on site, device type, browser, language, time zone, IP address and
                approximate country. This is stored in your browser only until you submit a form, and is not used for
                advertising profiles or sold to anyone. Enquiry notifications are delivered to our inbox through our
                email provider (Web3Forms or our mail server) solely to pass your message on to us.
              </p>
            </section>
            <section>
              <h2>How we use it</h2>
              <p className="mt-3">
                We use your details only to respond to your enquiry, prepare quotations and, where you ask
                us to, arrange supply or consulting services. We do not sell or share your details with third
                parties for marketing.
              </p>
            </section>
            <section>
              <h2>How long we keep it</h2>
              <p className="mt-3">
                We keep enquiry records for as long as needed to handle your request and any resulting business
                relationship, after which they are deleted.
              </p>
            </section>
            <section>
              <h2>Your choices</h2>
              <p className="mt-3">
                You can ask us to access, correct or delete your information at any time by{" "}
                <Link href="/#contact" className="font-semibold text-primary underline underline-offset-2">contacting us</Link>.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
