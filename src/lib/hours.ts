import { site, type DayHours } from "./site";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function hoursFor(day: number): DayHours {
  return site.hours.find((h) => h.day === day)!;
}

export function hoursLabel(h: DayHours) {
  return h.open && h.close ? `${formatTime(h.open)} – ${formatTime(h.close)}` : "Closed";
}

/** Current weekday, minutes and ISO date in the shop's time zone. */
export function shopNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: WEEKDAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export function openStatus(date = new Date()) {
  const now = shopNow(date);
  const today = hoursFor(now.day);
  if (today.open && today.close) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (now.minutes >= open && now.minutes < close) {
      return { open: true, label: `Open now · closes ${formatTime(today.close)}` };
    }
    if (now.minutes < open) {
      return { open: false, label: `Closed · opens ${formatTime(today.open)} today` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const next = hoursFor((now.day + i) % 7);
    if (next.open) {
      const when = i === 1 ? "tomorrow" : next.name;
      return { open: false, label: `Closed · opens ${formatTime(next.open)} ${when}` };
    }
  }
  return { open: false, label: "Closed" };
}

/** Weekday (0 = Sunday) of a YYYY-MM-DD date string, independent of the viewer's time zone. */
export function weekdayOf(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 30-minute appointment slots for a date, ending 30 minutes before close. */
export function slotsFor(isoDate: string) {
  const h = hoursFor(weekdayOf(isoDate));
  if (!h.open || !h.close) return [];
  const slots: string[] = [];
  for (let t = toMinutes(h.open); t <= toMinutes(h.close) - 30; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
}
