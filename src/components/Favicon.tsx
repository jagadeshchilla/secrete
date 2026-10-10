"use client";

import { useState } from "react";
import { LinkIcon } from "@/components/icons";

function faviconUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return null;
  }
}

export default function Favicon({ url, className = "h-4 w-4" }: { url: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = url ? faviconUrl(url) : null;

  if (!src || failed) {
    return <LinkIcon className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${className} shrink-0`} onError={() => setFailed(true)} />
  );
}
