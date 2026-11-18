import Link from "next/link";
import { LogoMark } from "@/components/Icons";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-cream px-4 text-center">
      <div>
        <LogoMark className="mx-auto size-14" />
        <p className="mt-8 font-display text-7xl text-primary">404</p>
        <h1 className="mt-3 font-display text-2xl text-primary">This page hasn&apos;t sprouted yet</h1>
        <p className="mt-3 text-ink/65">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </main>
  );
}
