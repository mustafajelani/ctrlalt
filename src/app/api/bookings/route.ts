import { DB_OFFLINE_MESSAGE, sql } from "@/lib/db";
import { shopNow, slotsFor, toMinutes } from "@/lib/hours";
import { makeId } from "@/lib/ids";
import { deviceTypes, issueTypes } from "@/lib/repairs";
import { badRequest, isEmail, readJson, text, usPhone, type Errors } from "@/lib/validate";

const MAX_DAYS_AHEAD = 60;

function isRealDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  if (text(body.company, 100)) return Response.json({ ok: true, id: makeId("CAD") });

  const errors: Errors = {};
  const device = text(body.device, 20);
  if (!deviceTypes.some((d) => d.key === device)) errors.device = "Choose the type of device.";

  const issues = Array.isArray(body.issues)
    ? [...new Set(body.issues.filter((i): i is string => typeof i === "string" && issueTypes.some((t) => t.key === i)))]
    : [];
  if (!issues.length) errors.issues = "Pick at least one issue.";

  const model = text(body.model, 120);
  const details = text(body.details, 2000);
  if (issues.includes("other") && details.length < 5) errors.details = "Tell us a little about the problem.";

  const name = text(body.name, 100);
  if (name.length < 2) errors.name = "Enter your name.";
  const phone = usPhone(body.phone);
  if (!phone) errors.phone = "Enter a valid 10-digit US phone number.";
  const email = text(body.email, 200);
  if (email && !isEmail(email)) errors.email = "Enter a valid email or leave it blank.";

  const date = text(body.date, 10);
  const time = text(body.time, 5);
  const now = shopNow();
  const latest = new Date(Date.parse(`${now.isoDate}T00:00:00Z`) + MAX_DAYS_AHEAD * 86_400_000).toISOString().slice(0, 10);
  if (!isRealDate(date) || date < now.isoDate) errors.date = "Choose today or a future date.";
  else if (date > latest) errors.date = `Bookings open up to ${MAX_DAYS_AHEAD} days ahead.`;
  else if (!slotsFor(date).length) errors.date = "We're closed that day. Please pick another date.";
  else if (!slotsFor(date).includes(time)) errors.time = "Choose an available time.";
  else if (date === now.isoDate && toMinutes(time) <= now.minutes) errors.time = "That time has passed. Choose a later slot.";

  if (Object.keys(errors).length) return badRequest(errors);
  if (!sql) return Response.json({ ok: false, error: DB_OFFLINE_MESSAGE }, { status: 503 });

  const id = makeId("CAD");
  try {
    await sql`
      INSERT INTO tickets (id, name, phone, email, device_type, device_model, issues, details, preferred_date, preferred_time, status, source)
      VALUES (${id}, ${name}, ${phone}, ${email || null}, ${device}, ${model || null}, ${issues}, ${details || null}, ${date}, ${time}, 'booked', 'online')`;
    await sql`INSERT INTO ticket_events (ticket_id, status) VALUES (${id}, 'booked')`;
  } catch (err) {
    console.error("booking insert failed", err);
    return Response.json({ ok: false, error: "We couldn't save your booking. Please try again or call us." }, { status: 500 });
  }

  return Response.json({ ok: true, id });
}
