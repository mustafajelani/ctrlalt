"use client";

import { ArrowCounterClockwise, CircleNotch, Trash, Warning } from "@phosphor-icons/react/dist/ssr";
import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

type Action = (formData: FormData) => Promise<void>;

function Submit({ label, pendingLabel, danger }: { label: string; pendingLabel: string; danger: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn-sm ${danger ? "bg-danger text-ink hover:bg-[#fca5a5]" : "btn-primary"}`}>
      {pending && <CircleNotch size={16} className="animate-spin" aria-hidden />}
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Button that opens a confirmation dialog before running a server action. Focus starts on Cancel. */
export function ConfirmAction({
  action,
  fields,
  trigger,
  triggerIcon,
  triggerLabel,
  title,
  body,
  confirmLabel,
  pendingLabel,
  danger = false,
}: {
  action: Action;
  fields: Record<string, string>;
  trigger: string;
  triggerIcon: "trash" | "release";
  triggerLabel: string;
  title: React.ReactNode;
  body: string;
  confirmLabel: string;
  pendingLabel: string;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => ref.current?.close();
  const Icon = triggerIcon === "trash" ? Trash : ArrowCounterClockwise;

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`btn btn-ghost btn-sm text-fog ${danger ? "hover:!border-danger hover:!text-danger" : ""}`}
        aria-label={triggerLabel}
      >
        <Icon size={16} aria-hidden /> {trigger}
      </button>

      <dialog
        ref={ref}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line-2 bg-panel p-0 text-[#ececef] backdrop:bg-black/70"
      >
        <form action={action} className="p-6">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex items-start gap-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-full ${danger ? "bg-danger/15 text-danger" : "bg-signal/15 text-signal-hot"}`}>
              <Warning size={22} weight="fill" aria-hidden />
            </span>
            <div>
              <h2 id={`${id}-title`} className="text-lg">
                {title}
              </h2>
              <p id={`${id}-body`} className="mt-2 text-sm text-fog">
                {body}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {/* Focus lands on Cancel so Enter never confirms by accident. */}
            <button type="button" autoFocus onClick={close} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <Submit label={confirmLabel} pendingLabel={pendingLabel} danger={danger} />
          </div>
        </form>
      </dialog>
    </>
  );
}

export function ConfirmDelete({ action, id, kind }: { action: Action; id: string; kind: "repair" | "order" }) {
  return (
    <ConfirmAction
      action={action}
      fields={{ id }}
      trigger="Delete"
      triggerIcon="trash"
      triggerLabel={`Delete ${kind} ${id}`}
      title={
        <>
          Delete {kind} <span className="font-mono text-signal-hot">{id}</span>?
        </>
      }
      body={`${
        kind === "repair"
          ? "This removes the ticket and its status history. The customer won't be able to track it anymore."
          : "This removes the order from the dashboard. If it was still reserved, its items go back on sale."
      } This can't be undone.`}
      confirmLabel="Delete permanently"
      pendingLabel="Deleting…"
      danger
    />
  );
}

export function ConfirmRelease({ action, id, back }: { action: Action; id: string; back: string }) {
  return (
    <ConfirmAction
      action={action}
      fields={{ id, back }}
      trigger="Release"
      triggerIcon="release"
      triggerLabel={`Release reservation for order ${id}`}
      title={
        <>
          Release reservation <span className="font-mono text-signal-hot">{id}</span>?
        </>
      }
      body="The order is marked cancelled and its items go back on sale in the shop right away. You can set it back to Reserved later if the items are still available."
      confirmLabel="Release items"
      pendingLabel="Releasing…"
    />
  );
}
