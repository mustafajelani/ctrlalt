import { productBySlug } from "@/content/products";
import { DB_OFFLINE_MESSAGE, sql } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { badRequest, isEmail, readJson, text, usPhone, type Errors } from "@/lib/validate";

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

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  const items = rawItems.flatMap((i: { slug?: unknown; qty?: unknown }) => {
    const product = typeof i?.slug === "string" ? productBySlug(i.slug) : undefined;
    const qty = Math.floor(Number(i?.qty));
    if (!product || !(qty > 0)) return [];
    return [{ slug: product.slug, name: product.name, condition: product.condition, price: product.price, qty, stock: product.stock }];
  });
  if (!items.length) errors.items = "Your cart is empty.";
  const unavailable = items.find((i) => i.qty > Math.min(i.stock, 5));
  if (unavailable) errors.items = `Only ${Math.min(unavailable.stock, 5)} of ${unavailable.name} can be reserved online.`;

  if (Object.keys(errors).length) return badRequest(errors);
  if (!sql) return Response.json({ ok: false, error: DB_OFFLINE_MESSAGE }, { status: 503 });

  const lineItems = items.map(({ stock: _stock, ...rest }) => rest);
  const subtotal = lineItems.reduce((n, i) => n + i.price * i.qty, 0);
  const id = makeId("ORD");

  try {
    await sql`
      INSERT INTO orders (id, name, phone, email, items, subtotal, notes)
      VALUES (${id}, ${name}, ${phone}, ${email || null}, ${JSON.stringify(lineItems)}::jsonb, ${subtotal}, ${notes || null})`;
  } catch (err) {
    console.error("order insert failed", err);
    return Response.json({ ok: false, error: "We couldn't save your order. Please try again or call us." }, { status: 500 });
  }

  return Response.json({ ok: true, id, subtotal });
}
