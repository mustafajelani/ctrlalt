"use client";

import { ArrowLeft, ArrowRight, CircleNotch, ImageSquare, Star, Trash, UploadSimple, Warning } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveProduct, type SaveProductState } from "@/app/admin/product-actions";
import { categories, conditions, type Condition, type ProductImage } from "@/content/products";

const MAX_PHOTOS = 7;
const MAX_EDGE = 1600;

export type EditorProduct = {
  slug?: string;
  name: string;
  category: string;
  condition: Condition;
  summary: string;
  specs: string[];
  images: ProductImage[];
  price: number;
  quantity: number;
  inStock: boolean;
  featured: boolean;
};

type Tile = { id: string; src: string; alt: string; state: "ready" | "uploading" | "error"; error?: string };

/** Shrinks a photo to at most 1600px on its long edge, honouring phone camera rotation. WebP where supported, else JPEG. */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) throw new Error("That file isn't a photo we can read. Try a JPG or PNG.");
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  let blob = await encode("image/webp");
  // Older Safari silently returns PNG for WebP requests; JPEG keeps those photos small.
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error("Couldn't process that photo.");
  return blob;
}

async function upload(blob: Blob): Promise<string> {
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const body = new FormData();
  body.append("file", new File([blob], `photo.${ext}`, { type: blob.type }));
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed. Please try again.");
  return data.url as string;
}

export function ProductEditor({ mode, initial, uploadsEnabled }: { mode: "create" | "edit"; initial: EditorProduct; uploadsEnabled: boolean }) {
  const [state, action, saving] = useActionState<SaveProductState, FormData>(saveProduct, undefined);
  const [form, setForm] = useState({
    name: initial.name,
    category: initial.category,
    condition: initial.condition,
    summary: initial.summary,
    specs: initial.specs.join("\n"),
    price: String(initial.price),
    quantity: String(initial.quantity),
    inStock: initial.inStock,
    featured: initial.featured,
  });
  const [tiles, setTiles] = useState<Tile[]>(() => initial.images.map((img, i) => ({ id: `init-${i}`, src: img.src, alt: img.alt, state: "ready" })));
  // Everything uploaded in this session, so photos removed before saving can be cleaned up from storage.
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.error) errorRef.current?.focus();
  }, [state]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  const invalid = (field: string) => (state?.field === field ? { "aria-invalid": true, "aria-describedby": "editor-error" } : {});

  const uploading = tiles.some((t) => t.state === "uploading");
  const room = MAX_PHOTOS - tiles.filter((t) => t.state !== "error").length;

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const picked = [...files].slice(0, Math.max(0, room));
    const fresh: Tile[] = picked.map((f) => ({ id: crypto.randomUUID(), src: URL.createObjectURL(f), alt: "", state: "uploading" }));
    setTiles((t) => [...t, ...fresh]);
    await Promise.all(
      picked.map(async (file, i) => {
        const id = fresh[i].id;
        try {
          const url = await upload(await resize(file));
          setUploaded((u) => [...u, url]);
          setTiles((t) => t.map((x) => (x.id === id ? { ...x, src: url, state: "ready" } : x)));
        } catch (err) {
          setTiles((t) => t.map((x) => (x.id === id ? { ...x, state: "error", error: err instanceof Error ? err.message : "Upload failed." } : x)));
        } finally {
          URL.revokeObjectURL(fresh[i].src);
        }
      }),
    );
    if (fileInput.current) fileInput.current.value = "";
  }

  const move = (from: number, to: number) =>
    setTiles((t) => {
      if (to < 0 || to >= t.length) return t;
      const next = [...t];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const ready = tiles.filter((t) => t.state === "ready").map((t) => ({ src: t.src, alt: t.alt }));
  const discarded = uploaded.filter((src) => !ready.some((r) => r.src === src));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />
      {initial.slug && <input type="hidden" name="slug" value={initial.slug} />}
      <input type="hidden" name="images" value={JSON.stringify(ready)} />
      <input type="hidden" name="discarded" value={JSON.stringify(discarded)} />

      {state?.error && (
        <p ref={errorRef} id="editor-error" tabIndex={-1} className="flex gap-2 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger outline-none" role="alert">
          <Warning size={18} className="mt-0.5 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <fieldset className="card p-5 sm:p-6" {...invalid("images")}>
        <legend className="sr-only">Photos</legend>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg">Photos</h2>
          <p className="text-sm text-fog">First photo is the main one · up to {MAX_PHOTOS} · large photos are resized automatically</p>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t, i) => (
            <li key={t.id} className={`rounded-xl border p-2 ${i === 0 && t.state === "ready" ? "border-signal/60" : "border-line"}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-panel-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of freshly uploaded files */}
                <img src={t.src} alt="" className={`h-full w-full object-cover ${t.state === "uploading" ? "opacity-40" : ""}`} />
                {i === 0 && t.state === "ready" && <span className="badge absolute top-2 left-2 bg-signal text-ink">Main photo</span>}
                {t.state === "uploading" && (
                  <span className="absolute inset-0 grid place-items-center text-sm text-mist">
                    <span className="flex items-center gap-2">
                      <CircleNotch size={18} className="animate-spin" aria-hidden /> Uploading…
                    </span>
                  </span>
                )}
              </div>
              {t.state === "error" ? (
                <p className="mt-2 text-xs text-danger" role="alert">
                  {t.error}
                </p>
              ) : (
                <label className="mt-2 block">
                  <span className="sr-only">Describe photo {i + 1}</span>
                  <input
                    value={t.alt}
                    onChange={(e) => setTiles((all) => all.map((x) => (x.id === t.id ? { ...x, alt: e.target.value } : x)))}
                    placeholder="Describe this photo"
                    maxLength={150}
                    className="input !min-h-9 !px-2.5 !py-1.5 text-sm"
                  />
                </label>
              )}
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0 || t.state !== "ready"} aria-label={`Move photo ${i + 1} earlier`} className="grid size-9 place-items-center rounded-md text-fog hover:text-white disabled:opacity-30">
                    <ArrowLeft size={16} aria-hidden />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === tiles.length - 1 || t.state !== "ready"} aria-label={`Move photo ${i + 1} later`} className="grid size-9 place-items-center rounded-md text-fog hover:text-white disabled:opacity-30">
                    <ArrowRight size={16} aria-hidden />
                  </button>
                  {i > 0 && t.state === "ready" && (
                    <button type="button" onClick={() => move(i, 0)} aria-label={`Make photo ${i + 1} the main photo`} className="grid size-9 place-items-center rounded-md text-fog hover:text-signal-hot">
                      <Star size={16} aria-hidden />
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => setTiles((all) => all.filter((x) => x.id !== t.id))} disabled={t.state === "uploading"} aria-label={`Remove photo ${i + 1}`} className="grid size-9 place-items-center rounded-md text-fog hover:text-danger disabled:opacity-30">
                  <Trash size={16} aria-hidden />
                </button>
              </div>
            </li>
          ))}

          {room > 0 && (
            <li>
              <label
                className={`flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-2 p-4 text-center text-sm text-fog transition-colors has-focus-visible:outline-2 has-focus-visible:outline-signal-hot ${
                  uploadsEnabled ? "cursor-pointer hover:border-signal hover:text-signal-hot" : "cursor-not-allowed opacity-50"
                }`}
              >
                {tiles.length ? <UploadSimple size={26} aria-hidden /> : <ImageSquare size={26} aria-hidden />}
                <span>{tiles.length ? "Add photos" : "Add a main photo"}</span>
                <span className="text-xs">{room} left</span>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={!uploadsEnabled}
                  className="sr-only"
                  onChange={(e) => void addFiles(e.target.files)}
                />
              </label>
            </li>
          )}
        </ul>
        {!uploadsEnabled && (
          <p className="mt-4 text-sm text-danger">Photo uploads aren&apos;t set up yet: connect a Vercel Blob store to this project (see the setup notes).</p>
        )}
        <p className="sr-only" aria-live="polite">
          {uploading ? "Uploading photos" : ""}
        </p>
      </fieldset>

      <fieldset className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <legend className="sr-only">Details</legend>
        <h2 className="text-lg sm:col-span-2">Details</h2>
        <label className="block sm:col-span-2">
          <span className="field-label">Name</span>
          <input name="name" value={form.name} onChange={set("name")} required minLength={2} maxLength={120} className="input" {...invalid("name")} />
        </label>
        <label className="block">
          <span className="field-label">Category</span>
          <select name="category" value={form.category} onChange={set("category")} className="input" {...invalid("category")}>
            {categories
              .filter((c) => c.key !== "all")
              .map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Condition</span>
          <select name="condition" value={form.condition} onChange={set("condition")} className="input" {...invalid("condition")}>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="field-label">Short description</span>
          <textarea name="summary" value={form.summary} onChange={set("summary")} rows={3} maxLength={500} className="input" />
        </label>
        <label className="block sm:col-span-2">
          <span className="field-label">Specs (one per line)</span>
          <textarea name="specs" value={form.specs} onChange={set("specs")} rows={5} maxLength={2000} placeholder={"128GB storage\nUnlocked\nBattery health 85%+"} className="input" />
        </label>
      </fieldset>

      <fieldset className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <legend className="sr-only">Price and stock</legend>
        <h2 className="text-lg sm:col-span-2">Price & stock</h2>
        <label className="block">
          <span className="field-label">Price ($)</span>
          <input name="price" type="number" inputMode="decimal" min="0" max="100000" step="0.01" required value={form.price} onChange={set("price")} className="input" {...invalid("price")} />
        </label>
        <label className="block">
          <span className="field-label">Units on hand</span>
          <input name="quantity" type="number" inputMode="numeric" min="0" max="9999" step="1" required value={form.quantity} onChange={set("quantity")} className="input" {...invalid("quantity")} />
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input name="in_stock" type="checkbox" checked={form.inStock} onChange={set("inStock")} className="size-5 accent-[var(--color-signal)]" />
          <span>In stock (customers can reserve it)</span>
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input name="featured" type="checkbox" checked={form.featured} onChange={set("featured")} className="size-5 accent-[var(--color-signal)]" />
          <span>Feature on the home page</span>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving && <CircleNotch size={18} className="animate-spin" aria-hidden />}
          {uploading ? "Waiting for uploads…" : saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        <Link href="/admin?tab=products" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
