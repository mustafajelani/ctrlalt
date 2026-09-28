import { SignOut } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ListControls, Pagination } from "@/components/admin/ListControls";
import { money } from "@/content/products";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatTime } from "@/lib/hours";
import { deviceTypes, issueTypes, labelFor, orderStatuses, ticketStatuses } from "@/lib/repairs";
import { site } from "@/lib/site";
import { formatPhone } from "@/lib/validate";
import { createWalkIn, deleteOrder, deleteTicket, logout, updateOrder, updateTicket } from "./actions";
import { orderList, PAGE_SIZE, parseList, ticketList, viewCounts, type ListState, type Search, type ViewKey } from "./list";

export const metadata: Metadata = { title: "Staff dashboard", robots: { index: false, follow: false } };

const fmt = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", { timeZone: site.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const statusTone: Record<string, string> = {
  completed: "bg-ok/12 text-ok",
  ready: "bg-ok/12 text-ok",
  cancelled: "bg-danger/12 text-danger",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`badge ${statusTone[status] ?? "bg-signal/12 text-signal-hot"}`}>{label}</span>;
}

async function countsByStatus(table: "tickets" | "orders") {
  const rows =
    table === "tickets"
      ? await sql!`SELECT status, count(*)::int AS n FROM tickets GROUP BY status`
      : await sql!`SELECT status, count(*)::int AS n FROM orders GROUP BY status`;
  return new Map(rows.map((r) => [r.status as string, r.n as number]));
}

/** Clamp the page so deleting the last row of the last page doesn't strand the viewer on an empty page. */
function clampPage(state: ListState, total: number): ListState {
  return { ...state, page: Math.min(state.page, Math.max(1, Math.ceil(total / PAGE_SIZE))) };
}

const totalFor = (state: ListState, byStatus: Map<string, number>) => state.statuses.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0);

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab === "orders" || params.tab === "messages" ? params.tab : "tickets";

  if (!sql) {
    return (
      <Shell tab={tab}>
        <p className="card mt-8 p-6 text-fog">
          The database isn&apos;t connected. Add <code className="font-mono text-mist">DATABASE_URL</code> and run{" "}
          <code className="font-mono text-mist">npm run db:migrate</code>.
        </p>
      </Shell>
    );
  }

  const [ticketCounts, orderCounts] = await Promise.all([countsByStatus("tickets"), countsByStatus("orders")]);
  const activeTickets = viewCounts(ticketList, ticketCounts).active;
  const activeOrders = viewCounts(orderList, orderCounts).active;

  return (
    <Shell tab={tab} badges={{ tickets: activeTickets, orders: activeOrders }}>
      {tab === "tickets" ? (
        <Tickets
          byStatus={ticketCounts}
          state={parseList(params, ticketList)}
          created={typeof params.created === "string" ? params.created : undefined}
          error={params.error === "walkin"}
        />
      ) : tab === "orders" ? (
        <Orders byStatus={orderCounts} state={parseList(params, orderList)} />
      ) : (
        <Messages />
      )}
    </Shell>
  );
}

function Shell({ tab, badges, children }: { tab: string; badges?: Record<string, number>; children: React.ReactNode }) {
  const tabs = [
    { key: "tickets", label: "Repairs" },
    { key: "orders", label: "Orders" },
    { key: "messages", label: "Messages" },
  ];
  return (
    <section className="container-x py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Staff dashboard</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Shop control panel</h1>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost btn-sm">
            <SignOut size={16} aria-hidden /> Sign out
          </button>
        </form>
      </div>

      <nav aria-label="Dashboard sections" className="mt-8 flex gap-2 border-b border-line pb-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className="chip aria-[current=page]:border-signal aria-[current=page]:bg-signal/12 aria-[current=page]:text-white"
          >
            {t.label}
            {badges?.[t.key] ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-signal px-1.5 font-mono text-xs text-ink" aria-label={`${badges[t.key]} active`}>
                {badges[t.key]}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      {children}
    </section>
  );
}

const emptyText: Record<ViewKey, string> = {
  active: "Nothing active right now.",
  completed: "Nothing completed yet.",
  cancelled: "Nothing cancelled.",
  all: "Nothing here yet.",
};

async function Tickets({ byStatus, state: requested, created, error }: { byStatus: Map<string, number>; state: ListState; created?: string; error: boolean }) {
  const total = totalFor(requested, byStatus);
  const state = clampPage(requested, total);
  const rows = await sql!`
    SELECT id, name, phone, email, device_type, device_model, issues, details,
           preferred_date::text AS preferred_date, preferred_time, source, status, customer_note, updated_at
    FROM tickets
    WHERE status = ANY(${state.statuses})
    ORDER BY
      CASE WHEN ${state.sort} = 'dropoff' THEN preferred_date END ASC NULLS LAST,
      CASE WHEN ${state.sort} = 'dropoff' THEN preferred_time END ASC NULLS LAST,
      CASE WHEN ${state.sort} = 'stale' THEN updated_at END ASC,
      CASE WHEN ${state.sort} = 'newest' THEN created_at END DESC,
      CASE WHEN ${state.sort} = 'oldest' THEN created_at END ASC,
      updated_at DESC, id
    LIMIT ${PAGE_SIZE} OFFSET ${(state.page - 1) * PAGE_SIZE}`;

  return (
    <div className="mt-8 space-y-6">
      {created && (
        <p className="rounded-lg border border-ok/40 bg-ok/10 p-4 text-sm text-ok" role="status">
          Walk-in ticket created: <span className="font-mono">{created}</span>. Give this ID to the customer so they can track their repair.
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger" role="alert">
          Couldn&apos;t create the ticket. Check the name, a 10-digit phone number, device and issue.
        </p>
      )}

      <details className="card group p-6">
        <summary className="flex items-center justify-between">
          New walk-in ticket <span className="text-signal-hot transition-transform group-open:rotate-45">+</span>
        </summary>
        <form action={createWalkIn} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="field-label">Customer name</span>
            <input name="name" required minLength={2} className="input" autoComplete="off" />
          </label>
          <label className="block">
            <span className="field-label">Phone</span>
            <input name="phone" required type="tel" className="input" autoComplete="off" />
          </label>
          <label className="block">
            <span className="field-label">Device</span>
            <select name="device" required className="input">
              {deviceTypes.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Make & model</span>
            <input name="model" className="input" autoComplete="off" />
          </label>
          <label className="block">
            <span className="field-label">Issue</span>
            <select name="issue" required className="input">
              {issueTypes.map((i) => (
                <option key={i.key} value={i.key}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Details</span>
            <input name="details" className="input" autoComplete="off" />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button className="btn btn-primary">Create ticket</button>
          </div>
        </form>
      </details>

      <ListControls tab="tickets" config={ticketList} state={state} counts={viewCounts(ticketList, byStatus)} />

      {rows.length === 0 ? (
        <p className="card p-6 text-fog">{state.status ? "No repairs with that status." : emptyText[state.view]}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((t) => (
            <li key={t.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-signal-hot">
                    {t.id} <span className="text-fog">· {t.source}</span>
                    <StatusBadge status={t.status} label={labelFor(ticketStatuses, t.status)} />
                  </p>
                  <p className="mt-1 text-lg">
                    {t.name} ·{" "}
                    <a href={`tel:+1${t.phone}`} className="font-mono text-mist hover:text-signal-hot">
                      {formatPhone(t.phone)}
                    </a>
                  </p>
                  <p className="text-sm text-fog">
                    {labelFor(deviceTypes, t.device_type)}
                    {t.device_model ? ` · ${t.device_model}` : ""} — {(t.issues as string[]).map((i) => labelFor(issueTypes, i)).join(", ")}
                  </p>
                  {t.details && <p className="mt-2 max-w-2xl text-sm text-mist">“{t.details}”</p>}
                </div>
                <div className="text-right text-sm text-fog">
                  {t.preferred_date && (
                    <p>
                      Drop-off: <span className="text-mist">{t.preferred_date}</span> {t.preferred_time ? formatTime(t.preferred_time) : ""}
                    </p>
                  )}
                  <p>Updated {fmt(t.updated_at)}</p>
                  {t.email && <p>{t.email}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center">
                <form action={updateTicket} className="grid flex-1 gap-3 sm:grid-cols-[12rem_1fr_auto]">
                  <input type="hidden" name="id" value={t.id} />
                  <label>
                    <span className="sr-only">Status for {t.id}</span>
                    <select name="status" defaultValue={t.status} className="input">
                      {ticketStatuses.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Note shown to customer for {t.id}</span>
                    <input name="note" defaultValue={t.customer_note ?? ""} placeholder="Note shown to the customer on the tracking page" className="input" maxLength={500} />
                  </label>
                  <button className="btn btn-primary">Save</button>
                </form>
                <ConfirmDelete action={deleteTicket} id={t.id} kind="repair" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination tab="tickets" state={state} total={total} />
    </div>
  );
}

async function Orders({ byStatus, state: requested }: { byStatus: Map<string, number>; state: ListState }) {
  const total = totalFor(requested, byStatus);
  const state = clampPage(requested, total);
  const rows = await sql!`
    SELECT id, name, phone, email, items, subtotal, notes, status, created_at, updated_at
    FROM orders
    WHERE status = ANY(${state.statuses})
    ORDER BY
      CASE WHEN ${state.sort} = 'newest' THEN created_at END DESC,
      CASE WHEN ${state.sort} = 'oldest' THEN created_at END ASC,
      CASE WHEN ${state.sort} = 'total_desc' THEN subtotal END DESC,
      CASE WHEN ${state.sort} = 'total_asc' THEN subtotal END ASC,
      updated_at DESC, id
    LIMIT ${PAGE_SIZE} OFFSET ${(state.page - 1) * PAGE_SIZE}`;

  return (
    <div className="mt-8 space-y-6">
      <ListControls tab="orders" config={orderList} state={state} counts={viewCounts(orderList, byStatus)} />

      {rows.length === 0 ? (
        <p className="card p-6 text-fog">{state.status ? "No orders with that status." : emptyText[state.view]}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-signal-hot">
                    {o.id}
                    <StatusBadge status={o.status} label={o.status[0].toUpperCase() + o.status.slice(1)} />
                  </p>
                  <p className="mt-1 text-lg">
                    {o.name} ·{" "}
                    <a href={`tel:+1${o.phone}`} className="font-mono text-mist hover:text-signal-hot">
                      {formatPhone(o.phone)}
                    </a>
                  </p>
                  {o.email && <p className="text-sm text-fog">{o.email}</p>}
                  <ul className="mt-3 space-y-1 text-sm">
                    {(o.items as { slug?: string; name: string; qty: number; price: number; condition: string }[]).map((i) => (
                      <li key={i.slug ?? i.name}>
                        {i.qty} × {i.name} <span className="text-fog">({i.condition})</span> · {money(i.price * i.qty)}
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="mt-2 text-sm text-mist">“{o.notes}”</p>}
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl">{money(Number(o.subtotal))}</p>
                  <p className="text-sm text-fog">Placed {fmt(o.created_at)}</p>
                  {String(o.updated_at) !== String(o.created_at) && <p className="text-sm text-fog">Updated {fmt(o.updated_at)}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <form action={updateOrder} className="flex flex-1 gap-3">
                  <input type="hidden" name="id" value={o.id} />
                  <label className="flex-1 sm:max-w-56">
                    <span className="sr-only">Status for order {o.id}</span>
                    <select name="status" defaultValue={o.status} className="input capitalize">
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="btn btn-primary">Save</button>
                </form>
                <ConfirmDelete action={deleteOrder} id={o.id} kind="order" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination tab="orders" state={state} total={total} />
    </div>
  );
}

async function Messages() {
  const rows = await sql!`SELECT * FROM messages ORDER BY created_at DESC LIMIT 100`;
  if (!rows.length) return <p className="card mt-8 p-6 text-fog">No messages yet.</p>;
  return (
    <ul className="mt-8 space-y-4">
      {rows.map((m) => (
        <li key={m.id} className="card p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <p>{m.name}</p>
            <p className="text-sm text-fog">{fmt(m.created_at)}</p>
          </div>
          <p className="mt-1 text-sm text-fog">
            {m.email && (
              <a href={`mailto:${m.email}`} className="hover:text-signal-hot">
                {m.email}
              </a>
            )}
            {m.email && m.phone && " · "}
            {m.phone && (
              <a href={`tel:+1${m.phone}`} className="font-mono hover:text-signal-hot">
                {formatPhone(m.phone)}
              </a>
            )}
          </p>
          <p className="mt-3 whitespace-pre-line text-mist">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}
