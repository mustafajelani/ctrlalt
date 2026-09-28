"use client";

import { ArrowRight, Phone } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const HIDDEN_ON = /^\/(book|checkout|admin)(\/|$)/;

/** Phone-only Call / Book bar that slides in once the hero's own buttons have scrolled away. */
export function MobileActionBar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN_ON.test(pathname)) return null;

  return (
    <nav
      aria-label="Quick actions"
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg transition-transform duration-500 ease-out-expo lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-md gap-3">
        <a href={site.phone.href} aria-label={`Call ${site.phone.display}`} className="btn btn-ghost flex-1">
          <Phone size={18} aria-hidden /> Call
        </a>
        <Link href="/book" className="btn btn-primary flex-[1.4]">
          Book a repair <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
