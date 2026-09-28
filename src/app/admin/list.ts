import { orderStatuses, ticketStatuses } from "@/lib/repairs";

export const PAGE_SIZE = 25;

export type Search = Record<string, string | string[] | undefined>;
export type Option = { key: string; label: string };
export type ViewKey = "active" | "completed" | "cancelled" | "all";
export type ListConfig = {
  views: Record<ViewKey, { label: string; statuses: string[] }>;
  statusLabels: Option[];
  sorts: Option[];
};

const allTicketStatuses = ticketStatuses.map((s) => s.key as string);

export const ticketList: ListConfig = {
  views: {
    active: { label: "Active", statuses: allTicketStatuses.filter((s) => s !== "completed" && s !== "cancelled") },
    completed: { label: "Completed", statuses: ["completed"] },
    cancelled: { label: "Cancelled", statuses: ["cancelled"] },
    all: { label: "All", statuses: allTicketStatuses },
  },
  statusLabels: ticketStatuses.map((s) => ({ key: s.key, label: s.label })),
  sorts: [
    { key: "updated", label: "Recently updated" },
    { key: "stale", label: "Least recently updated" },
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
    { key: "dropoff", label: "Drop-off date (soonest)" },
  ],
};

export const orderList: ListConfig = {
  views: {
    active: { label: "Active", statuses: ["reserved", "ready"] },
    completed: { label: "Completed", statuses: ["completed"] },
    cancelled: { label: "Cancelled", statuses: ["cancelled"] },
    all: { label: "All", statuses: [...orderStatuses] },
  },
  statusLabels: orderStatuses.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) })),
  sorts: [
    { key: "updated", label: "Recently updated" },
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
    { key: "total_desc", label: "Total: high to low" },
    { key: "total_asc", label: "Total: low to high" },
  ],
};

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export type ListState = { view: ViewKey; status?: string; sort: string; page: number; statuses: string[] };

export function parseList(params: Search, config: ListConfig): ListState {
  const view = (Object.keys(config.views) as ViewKey[]).find((v) => v === one(params.view)) ?? "active";
  const inView = config.views[view].statuses;
  const status = inView.includes(one(params.status) ?? "") ? one(params.status) : undefined;
  const sort = config.sorts.find((s) => s.key === one(params.sort))?.key ?? config.sorts[0].key;
  const page = Math.max(1, Math.floor(Number(one(params.page)) || 1));
  return { view, status, sort, page, statuses: status ? [status] : inView };
}

export function listHref(tab: string, state: ListState, changes: Partial<Omit<ListState, "statuses">> = {}) {
  const next = { ...state, ...changes };
  const q = new URLSearchParams({ tab });
  if (next.view !== "active") q.set("view", next.view);
  if (next.status) q.set("status", next.status);
  if (next.sort !== "updated") q.set("sort", next.sort);
  if (next.page > 1) q.set("page", String(next.page));
  return `/admin?${q}`;
}

/** Count rows per view from a `status -> count` map. */
export function viewCounts(config: ListConfig, byStatus: Map<string, number>) {
  const sum = (statuses: string[]) => statuses.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0);
  return Object.fromEntries(Object.entries(config.views).map(([k, v]) => [k, sum(v.statuses)])) as Record<ViewKey, number>;
}
