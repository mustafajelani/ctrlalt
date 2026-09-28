"use client";

import { CircleNotch, Trash, Warning } from "@phosphor-icons/react/dist/ssr";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-sm bg-danger text-ink hover:bg-[#fca5a5]">
      {pending ? <CircleNotch size={16} className="animate-spin" aria-hidden /> : <Trash size={16} aria-hidden />}
      {pending ? "Deleting…" : "Delete permanently"}
    </button>
  );
}

export function ConfirmDelete({ action, id, kind }: { action: (formData: FormData) => Promise<void>; id: string; kind: "repair" | "order" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="btn btn-ghost btn-sm text-fog hover:!border-danger hover:!text-danger"
        aria-label={`Delete ${kind} ${id}`}
      >
        <Trash size={16} aria-hidden /> Delete
      </button>

      <dialog
        ref={ref}
        aria-labelledby={`delete-${id}-title`}
        aria-describedby={`delete-${id}-body`}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line-2 bg-panel p-0 text-[#ececef] backdrop:bg-black/70"
      >
        <form action={action} className="p-6">
          <input type="hidden" name="id" value={id} />
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-danger/15 text-danger">
              <Warning size={22} weight="fill" aria-hidden />
            </span>
            <div>
              <h2 id={`delete-${id}-title`} className="text-lg">
                Delete {kind} <span className="font-mono text-signal-hot">{id}</span>?
              </h2>
              <p id={`delete-${id}-body`} className="mt-2 text-sm text-fog">
                {kind === "repair"
                  ? "This removes the ticket and its status history. The customer won't be able to track it anymore."
                  : "This removes the order and its items from the dashboard."}{" "}
                This can&apos;t be undone.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {/* Focus lands on Cancel so Enter never deletes by accident. */}
            <button type="button" autoFocus onClick={close} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <DeleteSubmit />
          </div>
        </form>
      </dialog>
    </>
  );
}
