"use client";

import dynamic from "next/dynamic";
import Loader from "../Loader";

// three.js is client-only and heavy: load it after hydration so it never
// blocks the server-rendered, indexable hero content.
const MushroomScene = dynamic(() => import("./MushroomScene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroScene() {
  return (
    <div className="relative h-full w-full">
      {/* Soft glow behind the canvas doubles as the loading state */}
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_55%,rgba(184,224,74,0.28),rgba(14,42,31,0)_68%)] blur-2xl"
      />
      <MushroomScene className="scene-fade relative h-full w-full" />
      <Loader label="Growing the 3D farm" watch className="scene-loader" />
    </div>
  );
}
