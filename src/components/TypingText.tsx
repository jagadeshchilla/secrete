"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  text,
  speed = 55,
  onComplete,
  className,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= text.length) {
      onComplete?.();
      return;
    }
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span
        className="ml-0.5 inline-block w-[2px] translate-y-[2px] bg-current"
        style={{ height: "1em", animation: "blink 1s step-start infinite" }}
      />
    </span>
  );
}
