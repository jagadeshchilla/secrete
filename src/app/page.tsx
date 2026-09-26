"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Reached only once Gate (in the root layout) has let the request through —
// i.e. the site is unlocked and a profile is chosen. Send it on to /dashboard
// so the app's real routes never overlap with the lock-screen/profile-picker
// flow that owns "/".
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return <div className="min-h-screen bg-[var(--bg)]" />;
}
