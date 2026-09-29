/** Only same-site admin URLs are accepted as "return to" targets. */
export function safeBack(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/admin") && !v.startsWith("//") ? v : fallback;
}

export function withParam(url: string, key: string, value: string) {
  const u = new URL(url, "http://local");
  u.searchParams.set(key, value);
  return `${u.pathname}${u.search}`;
}
