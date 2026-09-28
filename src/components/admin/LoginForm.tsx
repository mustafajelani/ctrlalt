"use client";

import { CircleNotch, LockKey } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? "password-error" : undefined}
        />
        {state?.error && (
          <p id="password-error" className="field-error" role="alert">
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <CircleNotch size={18} className="animate-spin" aria-hidden /> : <LockKey size={18} aria-hidden />}
        Sign in
      </button>
    </form>
  );
}
