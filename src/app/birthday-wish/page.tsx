"use client";

import { useEffect, useState } from "react";
import { LockIcon, CakeIcon, GiftIcon, HeartIcon } from "@/components/icons";

// Self-hosted instead of embedding Google Drive's preview iframe — that iframe
// renders Drive's own unstylable player chrome (progress bar, settings gear,
// volume) which is cross-origin and can't be restyled or removed. A native
// <video> gives clean browser controls and lets the file display at its real
// aspect ratio with no forced box that could crop it.
const VIDEO_URL = "/birthday/wish.mp4";

// Fixed instant in time (explicit +05:30 offset) — unlocks tomorrow 7:00 AM
// IST regardless of the viewer's own device timezone/clock settings.
const UNLOCK_AT = new Date("2026-11-16T07:00:00+05:30").getTime();

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold tabular-nums text-white shadow-lg backdrop-blur sm:h-20 sm:w-20 sm:text-3xl">
        {pad(value)}
      </div>
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/50 sm:text-xs">{label}</span>
    </div>
  );
}

function CountdownScreen({ msLeft }: { msLeft: number }) {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
      style={{ background: "radial-gradient(circle at 50% 0%, #1a1f2e 0%, #0b0e16 55%, #060709 100%)" }}
    >
      <div className="animate-fade-in-up flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Unlocks soon</p>
        <p className="mt-2 max-w-xs text-sm text-white/60">Something has been made for you. Check back when it&apos;s ready.</p>

        <div className="mt-8 flex flex-wrap items-start justify-center gap-1.5 sm:gap-4">
          <CountdownUnit value={days} label="Days" />
          <span className="pt-3 text-base font-bold text-white/20 sm:pt-5 sm:text-2xl">:</span>
          <CountdownUnit value={hours} label="Hours" />
          <span className="pt-3 text-base font-bold text-white/20 sm:pt-5 sm:text-2xl">:</span>
          <CountdownUnit value={minutes} label="Minutes" />
          <span className="pt-3 text-base font-bold text-white/20 sm:pt-5 sm:text-2xl">:</span>
          <CountdownUnit value={seconds} label="Seconds" />
        </div>
      </div>
    </div>
  );
}

export default function BirthdayWishPage() {
  const [now, setNow] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    const t = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  if (now === null) {
    return <div className="min-h-screen" style={{ background: "#0b0e16" }} />;
  }

  if (now < UNLOCK_AT) {
    return <CountdownScreen msLeft={UNLOCK_AT - now} />;
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, #fde2e4 0%, transparent 45%), radial-gradient(circle at 85% 20%, #e2d6f9 0%, transparent 50%), radial-gradient(circle at 50% 90%, #fff3d6 0%, transparent 55%), #fff9f5",
      }}
    >
      <div className="animate-fade-in-up w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#e7897a] shadow-lg">
          <CakeIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#3a2e2a] sm:text-4xl">
          Happy Birthday, Harshu!
        </h1>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-base leading-relaxed text-[#6b5c56]">
          <span>A little something made just for you. Hope it brings a smile.</span>
          <HeartIcon className="h-4 w-4 shrink-0 text-[#e7897a]" />
        </p>
      </div>

      <div className="animate-fade-in-up mt-10 w-full max-w-4xl" style={{ animationDelay: "120ms" }}>
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="group mx-auto flex w-full flex-col items-center gap-3 rounded-3xl border border-[#f0d9d4] bg-white/80 px-5 py-10 shadow-xl backdrop-blur transition-transform hover:scale-[1.01] sm:gap-4 sm:px-8 sm:py-16"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f6a6b2] to-[#f3c98a] text-white shadow-md transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
              <GiftIcon className="h-7 w-7 sm:h-9 sm:w-9" />
            </span>
            <span className="text-base font-semibold text-[#3a2e2a] sm:text-lg">Tap to open your surprise</span>
            <span className="text-xs text-[#9a8b85] sm:text-sm">A short video, made with love</span>
          </button>
        ) : (
          <div className="animate-fade-in-up overflow-hidden rounded-3xl bg-black shadow-2xl">
            <video
              src={VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              className="block w-full"
              title="A birthday surprise for Harshu"
            />
          </div>
        )}
      </div>

      {revealed && (
        <div
          className="animate-fade-in-up mt-6 flex w-full max-w-4xl items-start justify-center gap-2 rounded-2xl border border-[#f0d9d4] bg-white/70 px-5 py-4 text-center text-sm leading-relaxed text-[#6b5c56] backdrop-blur"
          style={{ animationDelay: "80ms" }}
        >
          <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e7897a]" />
          <span>
            If anything isn&apos;t perfect, sorry for that — it&apos;s just a cartoon video made with love, so please
            don&apos;t mind the little imperfections!
          </span>
        </div>
      )}
    </div>
  );
}
