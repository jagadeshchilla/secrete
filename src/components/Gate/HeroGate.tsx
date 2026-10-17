"use client";

import { useState } from "react";
import { useAccess } from "@/context/AccessContext";
import Sanctuary3DHero from "./Sanctuary3DHero";

export default function HeroGate({ onUnlocked }: { onUnlocked: () => void }) {
  const { unlock } = useAccess();
  const [formOpen, setFormOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);

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
    <>
      <Sanctuary3DHero />

      <div className="fixed bottom-6 right-6 z-20">
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="border border-[#2a3630] px-4 py-2 text-xs font-medium tracking-wide text-[#8b988e] transition-colors hover:border-[#34d399] hover:text-[#34d399]"
          >
            Enter
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 border border-[#2a3630] bg-[#0f1512] p-2 ${
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
    </>
  );
}
