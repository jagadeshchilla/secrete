"use client";

import { useEffect } from "react";
import WalkerLoader from "@/components/WalkerLoader";

const DURATION_MS = 5500;

export default function RevealTransition({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      {/* Fixed, generously sized box — the loader's internal transforms/scale render
          well beyond its 200x200 layout box, so this reserves enough room that
          "Welcome back." below never overlaps the figure. */}
      <div className="flex h-[300px] w-[300px] items-center justify-center overflow-visible">
        <WalkerLoader />
      </div>
    </div>
  );
}
