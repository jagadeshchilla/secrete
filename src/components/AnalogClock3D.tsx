"use client";

import { useEffect, useState } from "react";

const TICKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  const r = 42; // percent radius from center
  return {
    i,
    left: 50 + r * Math.sin(angle),
    top: 50 - r * Math.cos(angle),
    major: i % 3 === 0,
  };
});

function Hand({ deg, length, thickness, color, z }: { deg: number; length: number; thickness: number; color: string; z: number }) {
  return (
    <div
      className="absolute left-1/2 rounded-full"
      style={{
        bottom: "50%",
        width: thickness,
        height: length,
        background: color,
        transformOrigin: "bottom center",
        transform: `translateX(-50%) rotate(${deg}deg)`,
        zIndex: z,
        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}
    />
  );
}

// A real analog clock face with a glassy 3D bezel — built in CSS (perspective +
// layered gradients/shadows), not a decorative digital readout. Ticks client-side
// only so the server-rendered shell never mismatches the viewer's own time/timezone.
export default function AnalogClock3D({ size = 96 }: { size?: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 1000);
    const t = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourDeg = (hours + minutes / 60) * 30;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const secondDeg = seconds * 6;

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        perspective: 400,
      }}
    >
      <div
        className="absolute inset-0 rounded-full border border-[var(--border)]"
        style={{
          background:
            "radial-gradient(circle at 35% 28%, var(--surface) 0%, var(--surface-2) 65%, var(--border) 100%)",
          boxShadow:
            "var(--shadow-lg), inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.2)",
          transform: "rotateX(6deg)",
        }}
      >
        {TICKS.map((t) => (
          <div
            key={t.i}
            className="absolute rounded-full"
            style={{
              left: `${t.left}%`,
              top: `${t.top}%`,
              width: t.major ? Math.max(2.5, size * 0.03) : Math.max(1.5, size * 0.017),
              height: t.major ? Math.max(2.5, size * 0.03) : Math.max(1.5, size * 0.017),
              background: t.major ? "var(--text)" : "var(--muted)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        {now && (
          <>
            <Hand deg={hourDeg} length={size * 0.26} thickness={Math.max(2, size * 0.035)} color="var(--text)" z={2} />
            <Hand deg={minuteDeg} length={size * 0.36} thickness={Math.max(1.5, size * 0.025)} color="var(--text)" z={3} />
            <Hand deg={secondDeg} length={size * 0.4} thickness={1.5} color="var(--accent)" z={4} />
          </>
        )}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size * 0.07, height: size * 0.07, background: "var(--accent)", zIndex: 5, boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        />
      </div>
    </div>
  );
}
