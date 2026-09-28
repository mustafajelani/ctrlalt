"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  CircleNotch,
  Copy,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  GameController,
  Laptop,
  Phone,
  Question,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { describe, Field } from "@/components/ui/Field";
import { formatTime, hoursFor, shopNow, slotsFor, toMinutes, weekdayOf } from "@/lib/hours";
import { deviceTypes, issueTypes, labelFor, type DeviceKey, type IssueKey } from "@/lib/repairs";
import { site } from "@/lib/site";

const deviceIcons: Record<DeviceKey, typeof Laptop> = {
  phone: DeviceMobile,
  laptop: Laptop,
  tablet: DeviceTablet,
  console: GameController,
  desktop: Desktop,
  other: Question,
};

const STEPS = ["Device", "Issue", "Time & contact"] as const;
type Errors = Partial<Record<"device" | "issues" | "details" | "date" | "time" | "name" | "phone" | "email", string>>;
const stepOf: Record<keyof Errors, number> = { device: 0, issues: 1, details: 1, date: 2, time: 2, name: 2, phone: 2, email: 2 };

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

export function BookingForm({ initialDevice, initialIssue, initialDetails = "" }: { initialDevice?: DeviceKey; initialIssue?: IssueKey; initialDetails?: string }) {
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<DeviceKey | "">(initialDevice ?? "");
  const [model, setModel] = useState("");
  const [issues, setIssues] = useState<IssueKey[]>(initialIssue ? [initialIssue] : []);
  const [details, setDetails] = useState(initialDetails);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState<{ isoDate: string; minutes: number } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => setNow(shopNow()), []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, ticket]);

  const slots = date
    ? slotsFor(date).filter((t) => !now || date !== now.isoDate || toMinutes(t) > now.minutes + 30)
    : [];
  const closedDay = date ? !hoursFor(weekdayOf(date)).open : false;

  function validate(upTo: number) {
    const e: Errors = {};
    if (upTo >= 0 && !device) e.device = "Choose the type of device.";
    if (upTo >= 1) {
      if (!issues.length) e.issues = "Pick at least one issue.";
      if (issues.includes("other") && details.trim().length < 5) e.details = "Tell us a little about the problem.";
    }
    if (upTo >= 2) {
      if (!date) e.date = "Choose a date.";
      else if (now && date < now.isoDate) e.date = "Choose today or a future date.";
      else if (closedDay) e.date = "We're closed that day. Please pick another date.";
      if (date && !closedDay && !slots.includes(time)) e.time = slots.length ? "Choose a time." : "No times left that day. Please pick another date.";
      if (name.trim().length < 2) e.name = "Enter your name.";
      if (phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "").length !== 10) e.phone = "Enter a 10-digit phone number so we can confirm.";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Enter a valid email or leave it blank.";
    }
    return e;
  }

  function focusFirstError(e: Errors) {
    const key = (Object.keys(e) as (keyof Errors)[])[0];
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-field="${key}"]`)?.focus());
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError(e);
    setStep((s) => s + 1);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (step < 2) return next();
    const e = validate(2);
    setErrors(e);
    setServerError("");
    if (Object.keys(e).length) {
      setStep(Math.min(...(Object.keys(e) as (keyof Errors)[]).map((k) => stepOf[k])));
      return focusFirstError(e);
    }
    setSending(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device, model, issues, details, date, time, name, phone, email, company }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTicket(data.id);
        window.scrollTo({ top: 0 });
      } else if (data.errors) {
        const errs = data.errors as Errors;
        setErrors(errs);
        setStep(Math.min(2, ...(Object.keys(errs) as (keyof Errors)[]).map((k) => stepOf[k] ?? 2)));
        focusFirstError(errs);
      } else {
        setServerError(data.error ?? "Something went wrong. Please try again or call us.");
      }
    } catch {
      setServerError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (ticket) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12" role="status">
        <CheckCircle size={60} weight="fill" className="mx-auto text-signal" aria-hidden />
        <h2 ref={headingRef} tabIndex={-1} className="display mt-6 text-4xl outline-none sm:text-5xl">
          You&apos;re booked in
        </h2>
        <p className="mt-3 text-mist">
          {prettyDate(date)} at {formatTime(time)}. We&apos;ll call {phone} to confirm.
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-signal/40 bg-signal/5 p-6">
          <p className="font-mono text-xs tracking-[0.18em] text-fog uppercase">Your ticket ID</p>
          <p className="mt-2 font-mono text-3xl tracking-wider text-signal-hot">{ticket}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(ticket);
                setCopied(true);
              } catch {
                /* clipboard blocked: the ID is still visible to copy manually */
              }
            }}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm text-fog hover:text-white"
          >
            {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            <span aria-live="polite">{copied ? "Copied" : "Copy ID"}</span>
          </button>
        </div>
        <p className="mx-auto mt-6 max-w-md text-sm text-fog">Save this ID. You&apos;ll use it with the last 4 digits of your phone number to track your repair.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/track?id=${ticket}`} className="btn btn-primary">
            Track this repair <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
      <form onSubmit={submit} noValidate className="min-w-0">
        <ol className="relative mb-10 grid grid-cols-3" aria-label="Booking progress">
          <span className="absolute top-5 right-[16.66%] left-[16.66%] h-px bg-line-2" aria-hidden />
          <span
            className="absolute top-5 left-[16.66%] h-px origin-left bg-signal shadow-[0_0_10px_rgb(255_122_31/0.7)] transition-transform duration-700 ease-out-expo"
            style={{ width: "66.66%", transform: `scaleX(${step / 2})` }}
            aria-hidden
          />
          {STEPS.map((label, i) => (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center" aria-current={i === step ? "step" : undefined}>
              <span
                className={`grid size-10 place-items-center rounded-full border font-mono text-sm transition-colors duration-500 ${
                  i < step ? "border-signal bg-signal text-ink" : i === step ? "border-signal bg-ink text-signal-hot" : "border-line-2 bg-ink text-fog"
                }`}
              >
                {i < step ? <Check size={16} weight="bold" aria-hidden /> : i + 1}
              </span>
              <span className={`text-xs sm:text-sm ${i === step ? "text-white" : "text-fog"}`}>
                <span className="sr-only">Step {i + 1} of 3: </span>
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div key={step} className="[animation:fade-up_0.5s_var(--ease-out-expo)_both]">
          {step === 0 && (
            <fieldset>
              <legend>
                <h2 ref={headingRef} tabIndex={-1} className="display text-3xl outline-none sm:text-4xl">
                  What needs fixing?
                </h2>
              </legend>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {deviceTypes.map((d, i) => {
                  const Icon = deviceIcons[d.key];
                  return (
                    <label
                      key={d.key}
                      className="card relative flex cursor-pointer flex-col items-start gap-5 p-5 transition-colors hover:border-line-2 has-checked:border-signal has-checked:bg-signal/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal-hot"
                    >
                      <input
                        type="radio"
                        name="device"
                        value={d.key}
                        checked={device === d.key}
                        onChange={() => setDevice(d.key)}
                        className="peer sr-only"
                        data-field={i === 0 ? "device" : undefined}
                      />
                      <Icon size={30} className="text-fog peer-checked:text-signal-hot" aria-hidden />
                      <span className="font-semibold">{d.label}</span>
                      <Check size={16} weight="bold" className="absolute top-4 right-4 text-signal-hot opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden />
                    </label>
                  );
                })}
              </div>
              {errors.device && (
                <p id="device-error" className="field-error" role="alert">
                  {errors.device}
                </p>
              )}
              <div className="mt-6">
                <Field id="model" label="Make & model" optional hint="For example: iPhone 14 Pro, Dell XPS 13, PS5.">
                  <input {...describe("model", undefined, "For example: iPhone 14 Pro, Dell XPS 13, PS5.")} className="input" value={model} onChange={(e) => setModel(e.target.value)} maxLength={120} />
                </Field>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend>
                <h2 ref={headingRef} tabIndex={-1} className="display text-3xl outline-none sm:text-4xl">
                  What&apos;s going on?
                </h2>
              </legend>
              <p className="mt-2 text-fog">Select everything that applies.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {issueTypes.map((t, i) => (
                  <label key={t.key} className="chip has-checked:border-signal has-checked:bg-signal/12 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal-hot">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={issues.includes(t.key)}
                      onChange={(e) => setIssues((prev) => (e.target.checked ? [...prev, t.key] : prev.filter((k) => k !== t.key)))}
                      data-field={i === 0 ? "issues" : undefined}
                    />
                    <Check size={14} weight="bold" className="hidden text-signal-hot peer-checked:block" aria-hidden />
                    {t.label}
                  </label>
                ))}
              </div>
              {errors.issues && (
                <p id="issues-error" className="field-error" role="alert">
                  {errors.issues}
                </p>
              )}
              <div className="mt-6">
                <Field id="details" label="Describe the problem" optional={!issues.includes("other")} error={errors.details}>
                  <textarea
                    {...describe("details", errors.details)}
                    data-field="details"
                    className="input"
                    rows={4}
                    maxLength={2000}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="When did it start? Was it dropped or exposed to water? Anything else we should know?"
                  />
                </Field>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend>
                <h2 ref={headingRef} tabIndex={-1} className="display text-3xl outline-none sm:text-4xl">
                  Pick a time
                </h2>
              </legend>
              <p className="mt-2 text-fog">Choose when you&apos;ll drop off your device. We&apos;ll call to confirm.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id="date" label="Date" error={errors.date} hint="Mon–Fri 10–5 · Sat 12–5 · Closed Sun">
                  <input
                    {...describe("date", errors.date, "Mon–Fri 10–5 · Sat 12–5 · Closed Sun")}
                    data-field="date"
                    type="date"
                    className="input [color-scheme:dark]"
                    min={now?.isoDate}
                    max={now ? addDays(now.isoDate, 60) : undefined}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime("");
                      setErrors(({ date: _d, time: _t, ...rest }) => rest);
                    }}
                  />
                </Field>
                <Field id="time" label="Drop-off time" error={errors.time}>
                  <select {...describe("time", errors.time)} data-field="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || closedDay || !slots.length}>
                    <option value="">{!date ? "Pick a date first" : closedDay ? "Closed this day" : slots.length ? "Select a time" : "No times left"}</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {formatTime(s)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {closedDay && !errors.date && (
                <p className="field-error" role="alert">
                  We&apos;re closed on {hoursFor(weekdayOf(date)).name}s. Please choose another day.
                </p>
              )}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Full name" error={errors.name}>
                  <input {...describe("name", errors.name)} data-field="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
                </Field>
                <Field id="phone" label="Phone" error={errors.phone}>
                  <input {...describe("phone", errors.phone)} data-field="phone" className="input" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
                </Field>
              </div>
              <div className="mt-5">
                <Field id="email" label="Email" optional error={errors.email}>
                  <input {...describe("email", errors.email)} data-field="email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
                </Field>
              </div>
              <div className="absolute -left-[9999px]" aria-hidden>
                <label htmlFor="company">Company</label>
                <input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </fieldset>
          )}
        </div>

        {serverError && (
          <p className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger" role="alert">
            {serverError}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} weight="bold" aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="submit" className="btn btn-primary">
              Continue <ArrowRight size={16} weight="bold" aria-hidden />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending && <CircleNotch size={18} className="animate-spin" aria-hidden />}
              {sending ? "Booking…" : "Confirm booking"}
            </button>
          )}
        </div>
      </form>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card pcb-grid overflow-hidden">
          <div className="border-b border-line bg-panel/90 p-6">
            <p className="font-mono text-xs tracking-[0.18em] text-fog uppercase">Repair summary</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-fog">Device</dt>
                <dd className="text-right">{device ? `${labelFor(deviceTypes, device)}${model ? ` · ${model}` : ""}` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fog">Issue</dt>
                <dd className="text-right">{issues.length ? issues.map((k) => labelFor(issueTypes, k)).join(", ") : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fog">Drop-off</dt>
                <dd className="text-right">{date && time ? `${prettyDate(date)}, ${formatTime(time)}` : "—"}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-panel/90 p-6">
            <p className="font-semibold">What happens next</p>
            <ul className="mt-3 space-y-2.5 text-sm text-fog">
              {["We call to confirm your time", "Track progress online with your ticket ID", "Upfront quote before any work"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check size={14} weight="bold" className="mt-1 shrink-0 text-signal" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <a href={site.phone.href} className="btn btn-ghost btn-sm mt-6 w-full">
              <Phone size={16} aria-hidden /> Prefer to call? {site.phone.display}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
