"use client";

import { useState } from "react";

const VIDEO_EMBED_URL = "https://drive.google.com/file/d/1JOA_6Wq0unLCbYgrC7bHN50-UOn1Fhmi/preview";

export default function BirthdayWishPage() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, #fde2e4 0%, transparent 45%), radial-gradient(circle at 85% 20%, #e2d6f9 0%, transparent 50%), radial-gradient(circle at 50% 90%, #fff3d6 0%, transparent 55%), #fff9f5",
      }}
    >
      <div className="animate-fade-in-up w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">
          🎂
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#3a2e2a] sm:text-4xl">
          Happy Birthday, Harshita!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#6b5c56]">
          A little something made just for you. Hope it brings a smile. 💛
        </p>
      </div>

      <div className="animate-fade-in-up mt-10 w-full max-w-2xl" style={{ animationDelay: "120ms" }}>
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="group mx-auto flex w-full flex-col items-center gap-4 rounded-3xl border border-[#f0d9d4] bg-white/80 px-8 py-16 shadow-xl backdrop-blur transition-transform hover:scale-[1.01]"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f6a6b2] to-[#f3c98a] text-4xl shadow-md transition-transform group-hover:scale-110">
              🎁
            </span>
            <span className="text-lg font-semibold text-[#3a2e2a]">Tap to open your surprise</span>
            <span className="text-sm text-[#9a8b85]">A short video, made with love</span>
          </button>
        ) : (
          <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-[#f0d9d4] bg-white shadow-2xl">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={VIDEO_EMBED_URL}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="A birthday surprise for Harshita"
              />
            </div>
          </div>
        )}
      </div>

      {revealed && (
        <div
          className="animate-fade-in-up mt-6 w-full max-w-2xl rounded-2xl border border-[#f0d9d4] bg-white/70 px-5 py-4 text-center text-sm leading-relaxed text-[#6b5c56] backdrop-blur"
          style={{ animationDelay: "80ms" }}
        >
          💛 If anything isn&apos;t perfect, sorry for that — it&apos;s just a cartoon video made with love, so please don&apos;t mind the little imperfections!
        </div>
      )}
    </div>
  );
}
