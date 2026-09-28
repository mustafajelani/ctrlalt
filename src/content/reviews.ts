// Paste real customer reviews here (with permission or from your Google Business Profile).
// Cards render automatically once this list has entries.
export type Review = { name: string; text: string; device?: string };

export const reviews: Review[] = [];

// What customers mention most across the shop's Google reviews.
export const reviewThemes = [
  { title: "Fast turnaround", body: "Screens swapped while customers wait." },
  { title: "Fair prices", body: "Repeat customers call out the prices." },
  { title: "MacBook screens", body: "A go-to spot for laptop screen repairs." },
  { title: "Great selection", body: "Electronics for sale, not just repairs." },
] as const;
