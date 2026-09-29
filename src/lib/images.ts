import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

export const ACCEPTED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const BLOB_HOST = ".public.blob.vercel-storage.com";
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads", "products");

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Uploads work with a Blob store, or (dev only) by saving into public/uploads. */
export function uploadsAvailable() {
  return blobConfigured() || process.env.NODE_ENV !== "production";
}

/** Only images we host (Blob or dev uploads), bundled assets, or the starter Unsplash photos may be saved on a product. */
export function isAllowedImage(src: string) {
  if (/^\/(uploads\/products|brand)\/[\w.-]+$/.test(src)) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && (u.hostname.endsWith(BLOB_HOST) || u.hostname === "images.unsplash.com");
  } catch {
    return false;
  }
}

export async function storeImage(file: File): Promise<string> {
  const ext = ACCEPTED_TYPES[file.type];
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  if (blobConfigured()) {
    const blob = await put(`products/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/products/${name}`;
}

/** Best-effort removal of photos we host; starter/bundled images are left alone. */
export async function deleteImages(srcs: string[]) {
  const blobs = srcs.filter((s) => isAllowedImage(s) && s.startsWith("https://") && new URL(s).hostname.endsWith(BLOB_HOST));
  const local = srcs.filter((s) => /^\/uploads\/products\/[\w.-]+$/.test(s));
  try {
    if (blobs.length && blobConfigured()) await del(blobs);
    await Promise.all(local.map((s) => unlink(path.join(LOCAL_DIR, path.basename(s))).catch(() => {})));
  } catch (err) {
    console.error("image cleanup failed", err);
  }
}
