"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { adminConfigured, createSession, destroySession, passwordMatches, requireAdmin } from "@/lib/auth";
import { sql, transaction } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { HOLDING_STATUSES, lockProducts, PRODUCTS_TAG } from "@/lib/catalog";
import { deviceTypes, issueTypes, orderStatuses, ticketStatuses, type OrderStatus } from "@/lib/repairs";
import { text, usPhone } from "@/lib/validate";
import { safeBack, withParam } from "./nav";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  if (!adminConfigured()) return { error: "Admin access isn't configured. Set ADMIN_PASSWORD and SESSION_SECRET (32+ characters)." };
  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Incorrect password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateTicket(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const id = text(formData.get("id"), 20);
  const status = text(formData.get("status"), 20);
  const note = text(formData.get("note"), 500);
  if (!ticketStatuses.some((s) => s.key === status)) return;

  const [prev] = await sql`SELECT status FROM tickets WHERE id = ${id}`;
  if (!prev) return;
  await sql`UPDATE tickets SET status = ${status}, customer_note = ${note || null}, updated_at = now() WHERE id = ${id}`;
  if (prev.status !== status) {
    await sql`INSERT INTO ticket_events (ticket_id, status, note) VALUES (${id}, ${status}, ${note || null})`;
  }
  revalidatePath("/admin");
}

export async function createWalkIn(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const name = text(formData.get("name"), 100);
  const phone = usPhone(formData.get("phone"));
  const device = text(formData.get("device"), 20);
  const issue = text(formData.get("issue"), 20);
  const model = text(formData.get("model"), 120);
  const details = text(formData.get("details"), 2000);
  if (name.length < 2 || !phone || !deviceTypes.some((d) => d.key === device) || !issueTypes.some((i) => i.key === issue)) {
    redirect("/admin?error=walkin");
  }

  const id = makeId("CAD");
  await sql`
    INSERT INTO tickets (id, name, phone, device_type, device_model, issues, details, status, source)
    VALUES (${id}, ${name}, ${phone}, ${device}, ${model || null}, ${[issue]}, ${details || null}, 'received', 'walk-in')`;
  await sql`INSERT INTO ticket_events (ticket_id, status) VALUES (${id}, 'received')`;
  redirect(`/admin?created=${id}`);
}

const HOLD = new Set<string>(HOLDING_STATUSES);

/**
 * Moves an order between statuses and keeps inventory consistent, all under row locks:
 * leaving "completed" puts units back on the shelf, entering it takes them off (sold),
 * and holds follow the status automatically. Refuses any change that would oversell.
 */
async function transitionOrder(id: string, next: OrderStatus): Promise<"ok" | "stock" | "missing"> {
  return transaction(async (tx) => {
    const { rows } = await tx.query("SELECT status, items FROM orders WHERE id = $1 FOR UPDATE", [id]);
    const order = rows[0];
    if (!order) return "missing";
    const prev = order.status as string;
    if (prev === next) return "ok";

    const qtyBySlug = new Map<string, number>();
    for (const i of order.items as { slug: string; qty: number }[]) {
      qtyBySlug.set(i.slug, (qtyBySlug.get(i.slug) ?? 0) + Number(i.qty));
    }
    const wasHeld = HOLD.has(prev);
    const willHold = HOLD.has(next);
    const wasSold = prev === "completed";
    const willSold = next === "completed";

    if (qtyBySlug.size) {
      const stock = await lockProducts(tx, [...qtyBySlug.keys()]);
      for (const [slug, qty] of qtyBySlug) {
        const s = stock.get(slug);
        if (!s) continue; // product deleted since the order was placed
        const quantity = s.quantity + (wasSold ? qty : 0) - (willSold ? qty : 0);
        const held = s.held - (wasHeld ? qty : 0) + (willHold ? qty : 0);
        if (quantity < 0 || quantity < held) return "stock";
      }
      for (const [slug, qty] of qtyBySlug) {
        const delta = (wasSold ? qty : 0) - (willSold ? qty : 0);
        if (delta && stock.has(slug)) await tx.query("UPDATE products SET quantity = quantity + $2, updated_at = now() WHERE slug = $1", [slug, delta]);
      }
    }
    await tx.query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1", [id, next]);
    return "ok";
  });
}

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const id = text(formData.get("id"), 20);
  const status = text(formData.get("status"), 20) as OrderStatus;
  if (!orderStatuses.includes(status)) return;
  const back = safeBack(formData.get("back"), "/admin?tab=orders");

  const result = await transitionOrder(id, status);
  updateTag(PRODUCTS_TAG);
  revalidatePath("/admin");
  // Always land on a clean URL so a stale error/saved banner never lingers.
  redirect(result === "stock" ? withParam(back, "error", "stock") : back);
}

export async function releaseOrder(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const id = text(formData.get("id"), 20);
  const back = safeBack(formData.get("back"), "/admin?tab=orders");
  const [order] = await sql`SELECT status FROM orders WHERE id = ${id}`;
  if (order && HOLD.has(order.status)) await transitionOrder(id, "cancelled");
  updateTag(PRODUCTS_TAG);
  revalidatePath("/admin");
  redirect(back);
}

export async function deleteTicket(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  // ticket_events rows are removed by ON DELETE CASCADE.
  await sql`DELETE FROM tickets WHERE id = ${text(formData.get("id"), 20)}`;
  revalidatePath("/admin");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  await sql`DELETE FROM orders WHERE id = ${text(formData.get("id"), 20)}`;
  // A deleted reservation frees its items; a deleted completed sale doesn't restock.
  updateTag(PRODUCTS_TAG);
  revalidatePath("/admin");
}
