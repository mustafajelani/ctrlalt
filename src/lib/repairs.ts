export const deviceTypes = [
  { key: "phone", label: "Phone" },
  { key: "laptop", label: "Laptop" },
  { key: "tablet", label: "Tablet" },
  { key: "console", label: "Game console" },
  { key: "desktop", label: "Desktop PC" },
  { key: "other", label: "Something else" },
] as const;

export const issueTypes = [
  { key: "screen", label: "Cracked or broken screen" },
  { key: "battery", label: "Battery / won't hold a charge" },
  { key: "charging", label: "Charging port" },
  { key: "keys", label: "Broken keys or keyboard" },
  { key: "power", label: "Won't turn on" },
  { key: "water", label: "Water damage" },
  { key: "software", label: "Slow, virus or software issue" },
  { key: "data", label: "Data recovery / transfer" },
  { key: "upgrade", label: "Upgrade (SSD, RAM, storage)" },
  { key: "other", label: "Something else" },
] as const;

export type DeviceKey = (typeof deviceTypes)[number]["key"];
export type IssueKey = (typeof issueTypes)[number]["key"];

export const ticketStatuses = [
  { key: "booked", label: "Booked", detail: "Your appointment request is in. We'll confirm by phone." },
  { key: "received", label: "Checked in", detail: "Your device is at the shop and in the queue." },
  { key: "diagnosing", label: "Diagnosing", detail: "A technician is pinpointing the fault and preparing your quote." },
  { key: "awaiting_parts", label: "Waiting on parts", detail: "We've ordered the part your repair needs." },
  { key: "repairing", label: "Repairing", detail: "Your device is on the bench being repaired." },
  { key: "ready", label: "Ready for pickup", detail: "All done and tested. Come grab it during business hours." },
  { key: "completed", label: "Picked up", detail: "Repair complete. Thanks for choosing CTRL ALT DEL." },
  { key: "cancelled", label: "Cancelled", detail: "This ticket was cancelled. Call us if that's unexpected." },
] as const;

export type TicketStatus = (typeof ticketStatuses)[number]["key"];

export const orderStatuses = ["reserved", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export function labelFor<T extends { key: string; label: string }>(list: readonly T[], key: string) {
  return list.find((i) => i.key === key)?.label ?? key;
}
