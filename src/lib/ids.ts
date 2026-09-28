const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function makeId(prefix: string, length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${out}`;
}
