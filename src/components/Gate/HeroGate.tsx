"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAccess } from "@/context/AccessContext";
import TypingText from "@/components/TypingText";

// lottie-react touches the DOM at import time, so it can't render during SSR.
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

const PARTICLES = [
  { left: "18%", top: "28%", delay: "0s", duration: "7s" },
  { left: "82%", top: "22%", delay: "1.2s", duration: "9s" },
  { left: "12%", top: "72%", delay: "2.4s", duration: "8s" },
  { left: "88%", top: "68%", delay: "0.6s", duration: "10s" },
  { left: "50%", top: "15%", delay: "3s", duration: "8.5s" },
  { left: "60%", top: "85%", delay: "1.8s", duration: "9.5s" },
];

export default function HeroGate({ onUnlocked }: { onUnlocked: () => void }) {
  const { unlock } = useAccess();
  const [formOpen, setFormOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [headingDone, setHeadingDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await unlock(password)) {
      onUnlocked();
    } else {
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div className="relative flex h-screen flex-col items-center overflow-hidden bg-[#0b0f0d] px-6 pt-4 text-center md:pt-6">
      {/* Vignette — keeps the corners dark so the orb reads as a defined light source */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle, transparent 30%, #0b0f0d 85%)" }}
      />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-[#34d399]"
          style={{
            left: p.left,
            top: p.top,
            opacity: 0.5,
            animation: `drift ${p.duration} ${p.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Content flows top-to-bottom: orb first, then text below it — never overlapping */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-[clamp(360px,62vh,640px)] w-[clamp(360px,62vh,640px)] shrink-0">
          {/* Soft static backdrop glow — no pulsing */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "90%",
              height: "90%",
              background:
                "radial-gradient(circle, transparent 58%, rgba(52,211,153,0.28) 68%, rgba(242,195,104,0.16) 78%, transparent 88%)",
              filter: "blur(10px)",
            }}
          />

          <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2">
            <Lottie src="/lottie/study-discussion.json" autoplay loop className="pointer-events-none h-full w-full" />
          </div>
        </div>

        <div className="max-w-md">
          <div
            className="mx-auto mb-6 h-px w-16 origin-center bg-[#2a3630]"
            style={{ animation: "grow-line 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
          />
          <h1 className="min-h-[34px] text-[26px] font-light tracking-wide text-[#eef2ec]">
            <TypingText text="A quiet place for two." onComplete={() => setHeadingDone(true)} />
          </h1>
          {headingDone && (
            <>
              <p className="animate-text-reveal mt-3 text-[13px] italic text-[#8b988e]">
                Nothing to see here unless you already know what this is.
              </p>
              <div
                className="animate-grow-line mx-auto mt-6 h-px w-16 origin-center bg-[#2a3630]"
                style={{ animationDelay: "150ms" }}
              />
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="animate-fade-in-up border border-[#2a3630] px-4 py-2 text-xs font-medium tracking-wide text-[#8b988e] transition-colors hover:border-[#34d399] hover:text-[#34d399]"
            style={{ animationDelay: "300ms" }}
          >
            Enter
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`animate-scale-in flex items-center gap-2 border border-[#2a3630] bg-[#0f1512] p-2 ${
              shake ? "animate-[shake_0.4s_ease]" : ""
            }`}
          >
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-32 border-none bg-transparent px-2 py-1.5 text-sm text-[#eef2ec] outline-none placeholder:text-[#5a655e]"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#34d399] px-3 py-1.5 text-xs font-medium text-[#0b0f0d]"
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
