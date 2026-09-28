"use client";

import { ArrowRight, CheckCircle, CircleNotch, ShoppingBagOpen, Storefront } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { describe, Field } from "@/components/ui/Field";
import { money } from "@/content/products";
import { fullAddress, site } from "@/lib/site";
import { useCart } from "./CartProvider";

type Errors = Record<string, string>;

export function CheckoutForm() {
  const { lines, subtotal, ready, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", company: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [order, setOrder] = useState<{ id: string; total: number } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Enter your name.";
    if (form.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "").length !== 10) next.phone = "Enter a 10-digit phone number so we can confirm your order.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = "Enter a valid email or leave it blank.";
    return next;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: lines.map((l) => ({ slug: l.slug, qty: l.qty })) }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOrder({ id: data.id, total: data.subtotal });
        clear();
        window.scrollTo({ top: 0 });
      } else if (data.errors) {
        setErrors(data.errors);
        setServerError(data.errors.items ?? "");
      } else {
        setServerError(data.error ?? "Something went wrong. Please try again or call us.");
      }
    } catch {
      setServerError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12" role="status">
        <CheckCircle size={56} weight="fill" className="mx-auto text-signal" aria-hidden />
        <h2 className="display mt-6 text-4xl">Items reserved</h2>
        <p className="mt-3 text-mist">
          Order <span className="font-mono text-signal-hot">{order.id}</span> · {money(order.total)} due at pickup
        </p>
        <p className="mx-auto mt-4 max-w-md text-fog">
          We&apos;ll call you to confirm and let you know when your items are set aside. Pick up at {fullAddress}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Get directions
          </a>
          <Link href="/shop" className="btn btn-ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <div className="card mx-auto flex max-w-2xl flex-col items-center gap-4 px-8 py-16 text-center">
        <ShoppingBagOpen size={52} className="text-line-2" aria-hidden />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <Link href="/shop" className="btn btn-primary">
          Browse the shop <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
      <div className="space-y-6">
        <h2 className="display text-3xl">Your details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name}>
            <input {...describe("name", errors.name)} className="input" autoComplete="name" value={form.name} onChange={set("name")} />
          </Field>
          <Field id="phone" label="Phone" error={errors.phone}>
            <input {...describe("phone", errors.phone)} className="input" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
          </Field>
        </div>
        <Field id="email" label="Email" optional error={errors.email} hint="For your order confirmation.">
          <input {...describe("email", errors.email, "For your order confirmation.")} className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field id="notes" label="Notes" optional>
          <textarea id="notes" className="input" rows={3} value={form.notes} onChange={set("notes")} placeholder="Preferred pickup time, questions about a device…" />
        </Field>
        <div className="absolute -left-[9999px]" aria-hidden>
          <label htmlFor="company">Company</label>
          <input id="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} />
        </div>

        <div className="card flex gap-4 p-5">
          <Storefront size={26} className="shrink-0 text-signal" aria-hidden />
          <div>
            <p className="font-semibold">In-store pickup · pay at the shop</p>
            <p className="mt-1 text-sm text-fog">
              {fullAddress}. We&apos;ll call to confirm before setting items aside.
            </p>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <h2 className="display text-2xl">Order summary</h2>
          <ul className="mt-5 divide-y divide-line">
            {lines.map(({ product, qty }) => (
              <li key={product.slug} className="flex items-center gap-4 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-panel-2">
                  <Image src={product.image.src} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-fog">Qty {qty}</p>
                </div>
                <span className="font-mono text-sm tabular-nums">{money(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-fog">Total due at pickup</span>
            <span className="font-mono text-2xl tabular-nums">{money(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-fog">Plus applicable sales tax, paid in store.</p>
          {serverError && (
            <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={sending || !ready}>
            {sending ? <CircleNotch size={18} className="animate-spin" aria-hidden /> : null}
            {sending ? "Reserving…" : "Reserve for pickup"}
          </button>
        </div>
      </aside>
    </form>
  );
}
