"use client";

import { ArrowRight, CircleNotch, Package, Phone, Warning } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { describe, Field } from "@/components/ui/Field";
import { deviceTypes, issueTypes, labelFor, ticketStatuses } from "@/lib/repairs";
import { site } from "@/lib/site";

type Ticket = {
  id: string;
  device: string;
  model: string | null;
  issues: string[];
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  events: { status: string; note: string | null; at: string }[];
};

const STAGES = [
  { key: "booked", label: "Booked" },
  { key: "received", label: "Checked in" },
  { key: "diagnosing", label: "Diagnosing" },
  { key: "repairing", label: "Repairing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "completed", label: "Picked up" },
];

const stageIndex = (status: string) => {
  if (status === "awaiting_parts") return 3;
  return Math.max(0, STAGES.findIndex((s) => s.key === status));
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: site.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function TrackForm({ initialId }: { initialId: string }) {
  const [id, setId] = useState(initialId);
  const [last4, setLast4] = useState("");
  const [errors, setErrors] = useState<{ id?: string; last4?: string }>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (id.trim().length < 5) found.id = "Enter your ticket ID, like CAD-7K2M9Q.";
    if (!/^\d{4}$/.test(last4)) found.last4 = "Enter the last 4 digits of your phone number.";
    setErrors(found);
    setError("");
    if (Object.keys(found).length) {
      document.getElementById(found.id ? "ticket-id" : "last4")?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, last4 }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTicket(data.ticket);
        requestAnimationFrame(() => resultRef.current?.focus());
      } else {
        setTicket(null);
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  const cancelled = ticket?.status === "cancelled";
  const current = ticket ? stageIndex(ticket.status) : 0;
  const statusInfo = ticket ? ticketStatuses.find((s) => s.key === ticket.status) : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
      <form onSubmit={submit} noValidate className="card h-fit space-y-5 p-6 sm:p-8 lg:sticky lg:top-28">
        <Package size={34} className="text-signal" aria-hidden />
        <Field id="ticket-id" label="Ticket ID" error={errors.id}>
          <input
            {...describe("ticket-id", errors.id)}
            className="input font-mono uppercase tracking-wider"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="CAD-XXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={20}
          />
        </Field>
        <Field id="last4" label="Last 4 digits of your phone" error={errors.last4}>
          <input
            {...describe("last4", errors.last4)}
            className="input font-mono tracking-[0.4em]"
            value={last4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
          />
        </Field>
        {error && (
          <p className="flex gap-2.5 rounded-lg border border-danger/40 bg-danger/10 p-3.5 text-sm text-danger" role="alert">
            <Warning size={18} className="mt-0.5 shrink-0" aria-hidden /> {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={sending}>
          {sending ? <CircleNotch size={18} className="animate-spin" aria-hidden /> : null}
          {sending ? "Checking…" : "Check status"}
          {!sending && <ArrowRight size={16} weight="bold" aria-hidden />}
        </button>
        <p className="text-sm text-fog">
          Lost your ticket?{" "}
          <a href={site.phone.href} className="font-semibold text-mist underline decoration-line-2 underline-offset-4 hover:text-signal-hot">
            Call {site.phone.display}
          </a>
        </p>
      </form>

      <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite">
        {!ticket ? (
          <div className="card pcb-grid flex h-full min-h-80 flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="grid size-16 place-items-center rounded-full border border-line-2 bg-ink">
              <Phone size={26} className="text-fog" aria-hidden />
            </div>
            <p className="max-w-sm text-fog">Your repair&apos;s progress will appear here, from check-in to ready for pickup.</p>
          </div>
        ) : (
          <div className="card overflow-hidden [animation:fade-up_0.6s_var(--ease-out-expo)_both]">
            <div className="border-b border-line p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm tracking-wider text-signal-hot">{ticket.id}</p>
                  <h2 className="display mt-2 text-3xl sm:text-4xl">
                    {labelFor(deviceTypes, ticket.device)}
                    {ticket.model ? ` · ${ticket.model}` : ""}
                  </h2>
                  <p className="mt-1 text-sm text-fog">{ticket.issues.map((i) => labelFor(issueTypes, i)).join(", ")}</p>
                </div>
                <span className={`badge ${cancelled ? "bg-danger/15 text-danger" : ticket.status === "ready" ? "bg-ok/15 text-ok" : "bg-signal/15 text-signal-hot"}`}>
                  {statusInfo?.label ?? ticket.status}
                </span>
              </div>
              <p className="mt-5 text-mist">{statusInfo?.detail}</p>
              {ticket.note && (
                <p className="mt-4 rounded-lg border border-line bg-ink-2 p-4 text-sm">
                  <span className="font-mono text-xs tracking-[0.14em] text-fog uppercase">Technician note</span>
                  <span className="mt-1 block">{ticket.note}</span>
                </p>
              )}
            </div>

            {!cancelled && (
              <ol className="relative p-6 sm:p-8">
                {STAGES.map((stage, i) => {
                  const done = i < current || (i === current && ticket.status === "completed");
                  const active = i === current && ticket.status !== "completed";
                  const event = [...ticket.events].reverse().find((e) => stageIndex(e.status) === i);
                  return (
                    <li key={stage.key} className="relative flex gap-5 pb-8 last:pb-0">
                      {i < STAGES.length - 1 && (
                        <span className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-line-2" aria-hidden>
                          <span
                            className="block h-full origin-top bg-signal transition-transform duration-700 ease-out-expo"
                            style={{ transform: `scaleY(${i < current ? 1 : 0})`, transitionDelay: `${i * 120}ms` }}
                          />
                        </span>
                      )}
                      <span
                        className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                          done ? "border-signal bg-signal text-ink" : active ? "border-signal bg-ink text-signal-hot" : "border-line-2 bg-ink text-fog"
                        }`}
                      >
                        {active && <span className="ping absolute inset-0 rounded-full text-signal/40" aria-hidden />}
                        <span className="relative">{String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <div className="pt-1.5">
                        <p className={`font-semibold ${done || active ? "text-white" : "text-fog"}`}>
                          {stage.key === "repairing" && ticket.status === "awaiting_parts" ? "Waiting on parts" : stage.label}
                          {active && <span className="sr-only"> (current step)</span>}
                        </p>
                        {event && <p className="mt-0.5 text-sm text-fog">{when(event.at)}</p>}
                        {event?.note && <p className="mt-1 text-sm text-mist">{event.note}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="border-t border-line px-6 py-4 text-xs text-fog sm:px-8">Last updated {when(ticket.updatedAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
