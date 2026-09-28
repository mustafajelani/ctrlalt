import { DB_OFFLINE_MESSAGE, sql } from "@/lib/db";
import { badRequest, isEmail, readJson, text, usPhone, type Errors } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  if (text(body.company, 100)) return Response.json({ ok: true });

  const errors: Errors = {};
  const name = text(body.name, 100);
  if (name.length < 2) errors.name = "Enter your name.";
  const email = text(body.email, 200);
  const rawPhone = text(body.phone, 40);
  const phone = rawPhone ? usPhone(rawPhone) : null;
  if (email && !isEmail(email)) errors.email = "Enter a valid email.";
  if (rawPhone && !phone) errors.phone = "Enter a valid 10-digit phone number.";
  if (!email && !rawPhone) errors.email = "Add an email or phone number so we can reply.";
  const message = text(body.message, 3000);
  if (message.length < 10) errors.message = "Tell us a bit more (at least 10 characters).";

  if (Object.keys(errors).length) return badRequest(errors);
  if (!sql) return Response.json({ ok: false, error: DB_OFFLINE_MESSAGE }, { status: 503 });

  try {
    await sql`INSERT INTO messages (name, email, phone, message) VALUES (${name}, ${email || null}, ${phone}, ${message})`;
  } catch (err) {
    console.error("message insert failed", err);
    return Response.json({ ok: false, error: "We couldn't send your message. Please call us instead." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
