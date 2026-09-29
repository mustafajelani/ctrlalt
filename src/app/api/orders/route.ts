import { revalidateTag } from "next/cache";
import { DB_OFFLINE_MESSAGE, sql, transaction } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { lockProducts, PRODUCTS_TAG } from "@/lib/catalog";
import { badRequest, isEmail, readJson, text, usPhone, type Errors } from "@/lib/validate";

const MAX_PER_ITEM = 5;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  if (text(body.company, 100)) return Response.json({ ok: true, id: makeId("ORD"), subtotal: 0 });

  const errors: Errors = {};
  const name = text(body.name, 100);
  if (name.length < 2) errors.name = "Enter your name.";
  const phone = usPhone(body.phone);
  if (!phone) errors.phone = "Enter a valid 10-digit US phone number.";
  const email = text(body.email, 200);
  if (email && !isEmail(email)) errors.email = "Enter a valid email or leave it blank.";
  const notes = text(body.notes, 1000);

  // Merge duplicate lines so one product can't dodge the per-item cap across two lines.
  const qtyBySlug = new Map<string, number>();
  for (const i of Array.isArray(body.items) ? body.items.slice(0, 30) : []) {
    const slug = typeof i?.slug === "string" ? i.slug.slice(0, 80) : "";
    const qty = Math.floor(Number(i?.qty));
    if (slug && qty > 0) qtyBySlug.set(slug, (qtyBySlug.get(slug) ?? 0) + qty);
  }
  if (!qtyBySlug.size) errors.items = "Your cart is empty.";
  const overCap = [...qtyBySlug].find(([, qty]) => qty > MAX_PER_ITEM);
  if (overCap) errors.items = `You can reserve up to ${MAX_PER_ITEM} of each item online.`;

  if (Object.keys(errors).length) return badRequest(errors);
  if (!sql) return Response.json({ ok: false, error: DB_OFFLINE_MESSAGE }, { status: 503 });

  try {
    const result = await transaction(async (tx) => {
      const stock = await lockProducts(tx, [...qtyBySlug.keys()]);

      const unavailable: { slug: string; name: string; available: number }[] = [];
      const lineItems = [...qtyBySlug].map(([slug, qty]) => {
        const s = stock.get(slug);
        // Unknown, deleted or archived products can't be reserved.
        const available = s && s.inStock && !s.archived ? Math.max(0, s.quantity - s.held) : 0;
        if (qty > available) unavailable.push({ slug, name: s?.name ?? "An item in your cart", available });
        return { slug, name: s?.name ?? slug, condition: s?.condition ?? "", price: s?.price ?? 0, qty };
      });
      if (unavailable.length) return { ok: false as const, unavailable };

      const subtotal = lineItems.reduce((n, i) => n + i.price * i.qty, 0);
      const id = makeId("ORD");
      await tx.query(
        "INSERT INTO orders (id, name, phone, email, items, subtotal, notes) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)",
        [id, name, phone, email || null, JSON.stringify(lineItems), subtotal, notes || null],
      );
      return { ok: true as const, id, subtotal };
    });

    if (!result.ok) {
      const names = result.unavailable.map((u) => (u.available ? `${u.name} (only ${u.available} left)` : u.name)).join(", ");
      return Response.json(
        { ok: false, error: `Just reserved by another customer or out of stock: ${names}. Update your cart and try again.`, unavailable: result.unavailable },
        { status: 409 },
      );
    }

    revalidateTag(PRODUCTS_TAG, { expire: 0 });
    return Response.json(result);
  } catch (err) {
    console.error("order failed", err);
    return Response.json({ ok: false, error: "We couldn't save your order. Please try again or call us." }, { status: 500 });
  }
}
