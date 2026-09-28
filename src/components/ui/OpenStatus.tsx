"use client";

import { useEffect, useState } from "react";
import { openStatus } from "@/lib/hours";

export function OpenStatus({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof openStatus> | null>(null);

  useEffect(() => {
    const tick = () => setStatus(openStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className={`relative size-2 rounded-full ${status?.open ? "ping bg-ok text-ok" : status ? "bg-fog/60" : "bg-line-2"}`}
      />
      <span>{status?.label ?? "Mon–Fri 10–5 · Sat 12–5"}</span>
    </span>
  );
}
