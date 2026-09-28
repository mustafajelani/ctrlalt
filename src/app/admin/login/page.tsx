import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Staff login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="card pcb-grid w-full max-w-md p-8">
        <p className="eyebrow">Staff only</p>
        <h1 className="display mt-4 text-4xl">Shop dashboard</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-lg border border-line-2 bg-ink-2 p-4 text-sm text-fog">
            Admin access isn&apos;t set up yet. Add <code className="font-mono text-mist">ADMIN_PASSWORD</code> and <code className="font-mono text-mist">SESSION_SECRET</code>{" "}
            (32+ characters) to your environment variables, then redeploy.
          </p>
        )}
      </div>
    </section>
  );
}
