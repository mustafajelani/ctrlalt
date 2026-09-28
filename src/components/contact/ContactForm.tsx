"use client";

import { CheckCircle, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { describe, Field } from "@/components/ui/Field";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    if (form.name.trim().length < 2) found.name = "Enter your name.";
    if (!form.email && !form.phone) found.email = "Add an email or phone number so we can reply.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) found.email = "Enter a valid email.";
    if (form.message.trim().length < 10) found.message = "Tell us a bit more (at least 10 characters).";
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) {
      document.getElementById(`c-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok && data.ok) setSent(true);
      else if (data.errors) setErrors(data.errors);
      else setServerError(data.error ?? "Something went wrong. Please call us instead.");
    } catch {
      setServerError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center" role="status">
        <CheckCircle size={52} weight="fill" className="text-signal" aria-hidden />
        <h2 className="display text-3xl">Message sent</h2>
        <p className="max-w-sm text-fog">Thanks, {form.name.split(" ")[0]}. We&apos;ll get back to you during business hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
      <h2 className="display text-3xl">Send a message</h2>
      <Field id="c-name" label="Name" error={errors.name}>
        <input {...describe("c-name", errors.name)} className="input" autoComplete="name" value={form.name} onChange={set("name")} maxLength={100} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-email" label="Email" optional error={errors.email}>
          <input {...describe("c-email", errors.email)} className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} maxLength={200} />
        </Field>
        <Field id="c-phone" label="Phone" optional error={errors.phone}>
          <input {...describe("c-phone", errors.phone)} className="input" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} maxLength={20} />
        </Field>
      </div>
      <Field id="c-message" label="Message" error={errors.message}>
        <textarea {...describe("c-message", errors.message)} className="input" rows={5} value={form.message} onChange={set("message")} maxLength={3000} placeholder="Questions about a repair, a product, or anything tech." />
      </Field>
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="c-company">Company</label>
        <input id="c-company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} />
      </div>
      {serverError && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3.5 text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={sending}>
        {sending ? <CircleNotch size={18} className="animate-spin" aria-hidden /> : <PaperPlaneTilt size={18} aria-hidden />}
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
