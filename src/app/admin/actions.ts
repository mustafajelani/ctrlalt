"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminConfigured, createSession, destroySession, passwordMatches, requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { deviceTypes, issueTypes, orderStatuses, ticketStatuses } from "@/lib/repairs";
import { text, usPhone } from "@/lib/validate";

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

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  if (!sql) return;
  const id = text(formData.get("id"), 20);
  const status = text(formData.get("status"), 20);
  if (!(orderStatuses as readonly string[]).includes(status)) return;
  await sql`UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id}`;
  revalidatePath("/admin");
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
  revalidatePath("/admin");
}
