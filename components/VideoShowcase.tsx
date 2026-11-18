"use client";

import { useState } from "react";

/**
 * Lightweight YouTube embed: shows the thumbnail + play button and only
 * loads YouTube's player (privacy-enhanced domain) when the visitor clicks.
 */
export default function VideoShowcase({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-primary-deep shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.2] object-cover transition-transform duration-700 group-hover:scale-[1.26]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-primary-deep/10 to-transparent" />
          <span className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-highlight text-primary shadow-[0_0_0_12px_rgba(184,224,74,0.25)] transition-transform duration-300 group-hover:scale-110 sm:size-24">
            <svg viewBox="0 0 24 24" className="ml-1 size-8 sm:size-10" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="absolute right-5 bottom-5 left-5 text-left text-white">
            <span className="block text-xs font-semibold tracking-[0.16em] text-highlight uppercase">Watch the film</span>
            <span className="mt-1 block font-display text-xl font-semibold sm:text-2xl">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
