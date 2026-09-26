"use client";

import { useState } from "react";
import { useAccess } from "@/context/AccessContext";
import HeroGate from "./HeroGate";
import RevealTransition from "./RevealTransition";
import ProfilePicker from "./ProfilePicker";

export default function Gate({ children }: { children: React.ReactNode }) {
  const { hydrated, unlocked, profile } = useAccess();
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  if (!hydrated) {
    return <div className="min-h-screen bg-[#0b0f0d]" />;
  }

  if (!unlocked) {
    return <HeroGate onUnlocked={() => setJustUnlocked(true)} />;
  }

  if (justUnlocked && !revealDone) {
    return <RevealTransition onDone={() => setRevealDone(true)} />;
  }

  if (!profile) {
    return <ProfilePicker />;
  }

  return <>{children}</>;
}
