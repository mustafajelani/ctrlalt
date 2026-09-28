import { sql } from "@/lib/db";
import { readJson, text } from "@/lib/validate";

const NOT_FOUND = "We couldn't find a repair matching that ticket ID and phone number. Double-check both, or call us.";

type TicketRow = {
  id: string;
  device_type: string;
  device_model: string | null;
  issues: string[];
  status: string;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  last4: string;
};

export async function POST(req: Request) {
  const body = await readJson(req);
  let id = text(body?.id, 20).toUpperCase().replace(/\s+/g, "");
  if (id && !id.startsWith("CAD-")) id = `CAD-${id.replace(/^CAD/, "")}`;
  const last4 = text(body?.last4, 4);

  if (!/^CAD-[A-Z0-9]{4,10}$/.test(id) || !/^\d{4}$/.test(last4)) {
    return Response.json({ ok: false, error: "Enter your ticket ID (like CAD-7K2M9Q) and the last 4 digits of your phone." }, { status: 422 });
  }

  if (!sql) {
    // Preview mode before a database is connected: lets you see the tracking UI.
    if (id === "CAD-DEMO42" && last4 === "7222") return Response.json({ ok: true, ticket: demoTicket() });
    return Response.json({ ok: false, error: "Online tracking isn't connected yet. Please call us at (215) 279-7222." }, { status: 503 });
  }

  try {
    const rows = (await sql`
      SELECT id, device_type, device_model, issues, status, customer_note, created_at, updated_at, right(phone, 4) AS last4
      FROM tickets WHERE id = ${id} LIMIT 1`) as TicketRow[];
    const t = rows[0];
    if (!t || t.last4 !== last4) return Response.json({ ok: false, error: NOT_FOUND }, { status: 404 });

    const events = await sql`SELECT status, note, created_at FROM ticket_events WHERE ticket_id = ${id} ORDER BY created_at ASC`;
    return Response.json({
      ok: true,
      ticket: {
        id: t.id,
        device: t.device_type,
        model: t.device_model,
        issues: t.issues,
        status: t.status,
        note: t.customer_note,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        events: events.map((e) => ({ status: e.status, note: e.note, at: e.created_at })),
      },
    });
  } catch (err) {
    console.error("tracking lookup failed", err);
    return Response.json({ ok: false, error: "Tracking is temporarily unavailable. Please call us." }, { status: 500 });
  }
}

function demoTicket() {
  const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600_000).toISOString();
  return {
    id: "CAD-DEMO42",
    device: "laptop",
    model: "MacBook Air 13\"",
    issues: ["screen"],
    status: "repairing",
    note: "New display panel arrived. Installing it now, ready later today.",
    createdAt: h(28),
    updatedAt: h(1),
    events: [
      { status: "booked", note: null, at: h(28) },
      { status: "received", note: null, at: h(25) },
      { status: "diagnosing", note: "Cracked LCD, backlight OK.", at: h(24) },
      { status: "awaiting_parts", note: null, at: h(23) },
      { status: "repairing", note: null, at: h(1) },
    ],
  };
}
