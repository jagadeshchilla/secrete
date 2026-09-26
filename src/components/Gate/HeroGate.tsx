"use client";

import { useEffect, useRef, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import TypingText from "@/components/TypingText";

const MAX_OFFSET = 55; // px the orb can drift from its resting position
const PULL_STRENGTH = 0.25; // fraction of cursor-from-center distance it reaches for
const EASE = 0.08; // lerp factor per frame — lower = smoother/laggier follow

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
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      target.x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx * PULL_STRENGTH));
      target.y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy * PULL_STRENGTH));
    }

    function tick() {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${current.x}px, ${current.y}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f0d] px-6 text-center">
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
        <div ref={orbRef} className="relative h-[300px] w-[300px] shrink-0">
          {/* Soft outer bloom */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "420px",
              height: "420px",
              background: "radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 62%)",
              filter: "blur(30px)",
              animation: "aura-pulse 7s ease-in-out infinite",
            }}
          />

          {/* Steady halo corona hugging the disc's edge */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, transparent 58%, rgba(52,211,153,0.32) 68%, rgba(242,195,104,0.18) 78%, transparent 88%)",
              filter: "blur(6px)",
              animation: "aura-pulse 5s ease-in-out infinite",
            }}
          />

          {/* Aura rings — expand outward from the disc and fade */}
          {[0, 1.3, 2.6].map((delay) => (
            <div
              key={delay}
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: "230px",
                height: "230px",
                border: "1px solid rgba(52,211,153,0.55)",
                animation: `aura-ring-pulse 4s ease-out ${delay}s infinite`,
              }}
            />
          ))}

          {/* Defined circular disc with a crisp edge, containing morphing flame-like blobs */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden rounded-full"
            style={{
              width: "230px",
              height: "230px",
              border: "1px solid rgba(52,211,153,0.45)",
              background: "#0d1512",
              boxShadow: "0 0 70px rgba(52,211,153,0.35), inset 0 0 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: "85%",
                height: "85%",
                background:
                  "radial-gradient(circle, rgba(129,236,197,0.9) 0%, rgba(52,211,153,0.7) 45%, transparent 75%)",
                filter: "blur(6px)",
                mixBlendMode: "screen",
                animation: "blob-morph-a 9s ease-in-out infinite",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: "70%",
                height: "70%",
                background:
                  "radial-gradient(circle, rgba(255,200,120,0.7) 0%, rgba(242,195,104,0.45) 40%, transparent 75%)",
                filter: "blur(8px)",
                mixBlendMode: "screen",
                animation: "blob-morph-b 11s ease-in-out infinite, flicker 2.4s ease-in-out infinite",
              }}
            />
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
