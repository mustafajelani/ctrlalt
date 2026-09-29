"use client";

import { ArrowRight, CircleNotch, MagnifyingGlass, Package, Warning } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { describe, Field } from "@/components/ui/Field";
import { money } from "@/content/products";
import { deviceTypes, issueTypes, labelFor, ticketStatuses } from "@/lib/repairs";
import { fullAddress, site } from "@/lib/site";

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

type Order = {
  id: string;
  status: string;
  items: { name: string; condition: string; price: number; qty: number }[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
};

type Result = { kind: "ticket"; ticket: Ticket } | { kind: "order"; order: Order };

const STAGES = [
  { key: "booked", label: "Booked" },
  { key: "received", label: "Checked in" },
  { key: "diagnosing", label: "Diagnosing" },
  { key: "repairing", label: "Repairing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "completed", label: "Picked up" },
];

const ORDER_STAGES = [
  { key: "reserved", label: "Reserved" },
  { key: "ready", label: "Ready for pickup" },
  { key: "completed", label: "Picked up" },
];

const orderStatusInfo: Record<string, { label: string; detail: string }> = {
  reserved: { label: "Reserved", detail: "Your items are set aside for you. We'll call as soon as they're checked and ready for pickup." },
  ready: { label: "Ready for pickup", detail: `Your order is ready. Pick it up at ${fullAddress} and pay in store.` },
  completed: { label: "Picked up", detail: "You picked this order up. Thanks for shopping with us." },
  cancelled: { label: "Cancelled", detail: "This order was cancelled and the items were released. If that's unexpected, give us a call." },
};

const ID_HINT = "Starts with CAD- for repairs or ORD- for shop orders.";

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
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (id.trim().length < 5) found.id = "Enter your ticket or order number, like CAD-7K2M9Q or ORD-4H8P2X.";
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
        setResult(data.order ? { kind: "order", order: data.order } : { kind: "ticket", ticket: data.ticket });
        requestAnimationFrame(() => resultRef.current?.focus());
      } else {
        setResult(null);
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
      <form onSubmit={submit} noValidate className="card h-fit space-y-5 p-6 sm:p-8 lg:sticky lg:top-28">
        <Package size={34} className="text-signal" aria-hidden />
        <Field id="ticket-id" label="Ticket or order number" error={errors.id} hint={ID_HINT}>
          <input
            {...describe("ticket-id", errors.id, ID_HINT)}
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
          Lost your number?{" "}
          <a href={site.phone.href} className="font-semibold text-mist underline decoration-line-2 underline-offset-4 hover:text-signal-hot">
            Call {site.phone.display}
          </a>
        </p>
      </form>

      <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite">
        {!result ? (
          <div className="card pcb-grid flex h-full min-h-80 flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="grid size-16 place-items-center rounded-full border border-line-2 bg-ink">
              <MagnifyingGlass size={26} className="text-fog" aria-hidden />
            </div>
            <p className="max-w-sm text-fog">Your repair or order status will appear here, from check-in or reservation through to ready for pickup.</p>
          </div>
        ) : result.kind === "ticket" ? (
          <TicketResult ticket={result.ticket} />
        ) : (
          <OrderResult order={result.order} />
        )}
      </div>
    </div>
  );
}

function TicketResult({ ticket }: { ticket: Ticket }) {
  const statusInfo = ticketStatuses.find((s) => s.key === ticket.status);
  return (
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
          <StatusBadge status={ticket.status} label={statusInfo?.label ?? ticket.status} />
        </div>
        <p className="mt-5 text-mist">{statusInfo?.detail}</p>
        {ticket.note && (
          <p className="mt-4 rounded-lg border border-line bg-ink-2 p-4 text-sm">
            <span className="font-mono text-xs tracking-[0.14em] text-fog uppercase">Technician note</span>
            <span className="mt-1 block">{ticket.note}</span>
          </p>
        )}
      </div>

      {ticket.status !== "cancelled" && (
        <Timeline
          stages={STAGES.map((stage, i) => {
            const event = [...ticket.events].reverse().find((e) => stageIndex(e.status) === i);
            return {
              key: stage.key,
              label: stage.key === "repairing" && ticket.status === "awaiting_parts" ? "Waiting on parts" : stage.label,
              at: event?.at,
              note: event?.note,
            };
          })}
          current={stageIndex(ticket.status)}
          finished={ticket.status === "completed"}
        />
      )}
      <p className="border-t border-line px-6 py-4 text-xs text-fog sm:px-8">Last updated {when(ticket.updatedAt)}</p>
    </div>
  );
}

function OrderResult({ order }: { order: Order }) {
  const info = orderStatusInfo[order.status] ?? { label: order.status, detail: "" };
  const current = Math.max(0, ORDER_STAGES.findIndex((s) => s.key === order.status));
  const units = order.items.reduce((n, i) => n + i.qty, 0);
  return (
    <div className="card overflow-hidden [animation:fade-up_0.6s_var(--ease-out-expo)_both]">
      <div className="border-b border-line p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm tracking-wider text-signal-hot">{order.id}</p>
            <h2 className="display mt-2 text-3xl sm:text-4xl">Shop order</h2>
            <p className="mt-1 text-sm text-fog">
              {units} {units === 1 ? "item" : "items"} · {money(order.subtotal)} {order.status === "completed" ? "paid in store" : "due at pickup"}
            </p>
          </div>
          <StatusBadge status={order.status} label={info.label} />
        </div>
        <p className="mt-5 text-mist">{info.detail}</p>
        <ul className="mt-5 divide-y divide-line rounded-lg border border-line bg-ink-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <span>
                {item.name}
                <span className="text-fog">
                  {item.condition ? ` · ${item.condition}` : ""}
                  {item.qty > 1 ? ` · qty ${item.qty}` : ""}
                </span>
              </span>
              <span className="shrink-0 font-mono text-mist">{money(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
      </div>

      {order.status !== "cancelled" && (
        <Timeline
          stages={ORDER_STAGES.map((stage, i) => ({
            key: stage.key,
            label: stage.label,
            // Orders only record when they were placed and when they last changed status.
            at: i === 0 ? order.createdAt : i === current ? order.updatedAt : undefined,
          }))}
          current={current}
          finished={order.status === "completed"}
        />
      )}
      <p className="border-t border-line px-6 py-4 text-xs text-fog sm:px-8">Last updated {when(order.updatedAt)}</p>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone = status === "cancelled" ? "bg-danger/15 text-danger" : status === "ready" ? "bg-ok/15 text-ok" : "bg-signal/15 text-signal-hot";
  return <span className={`badge ${tone}`}>{label}</span>;
}

function Timeline({ stages, current, finished }: { stages: { key: string; label: string; at?: string; note?: string | null }[]; current: number; finished: boolean }) {
  return (
    <ol className="relative p-6 sm:p-8">
      {stages.map((stage, i) => {
        const done = i < current || (i === current && finished);
        const active = i === current && !finished;
        return (
          <li key={stage.key} className="relative flex gap-5 pb-8 last:pb-0">
            {i < stages.length - 1 && (
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
                {stage.label}
                {active && <span className="sr-only"> (current step)</span>}
              </p>
              {stage.at && <p className="mt-0.5 text-sm text-fog">{when(stage.at)}</p>}
              {stage.note && <p className="mt-1 text-sm text-mist">{stage.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
