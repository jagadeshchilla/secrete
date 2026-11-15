"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAccess } from "@/context/AccessContext";
import HeroGate from "./HeroGate";
import RevealTransition from "./RevealTransition";
import ProfilePicker from "./ProfilePicker";

// Routes that are public and should never be stopped by the password/profile
// gate — e.g. a one-off page meant to be opened by a link, not logged into.
const PUBLIC_ROUTES = ["/birthday-wish"];

export default function Gate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, unlocked, profile } = useAccess();
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  if (PUBLIC_ROUTES.some((r) => pathname?.startsWith(r))) {
    return <>{children}</>;
  }

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
