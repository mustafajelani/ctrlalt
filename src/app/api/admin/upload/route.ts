import { isAdmin } from "@/lib/auth";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, storeImage, uploadsAvailable } from "@/lib/images";

/** Staff-only photo upload. The browser has already resized the image to at most 1600px. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });

  // Reject cross-site posts even though the session cookie is SameSite=Lax.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return Response.json({ error: "Bad origin." }, { status: 403 });

  if (!uploadsAvailable()) {
    return Response.json({ error: "Photo uploads aren't set up yet. Connect a Vercel Blob store to this project." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  if (!ACCEPTED_TYPES[file.type]) return Response.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "That photo is too large (max 4 MB after resizing)." }, { status: 413 });

  try {
    return Response.json({ url: await storeImage(file) });
  } catch (err) {
    console.error("upload failed", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
