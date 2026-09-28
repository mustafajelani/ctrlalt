"use client";

import { ArrowRight, List, MapPin, Phone, ShoppingCartSimple, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/components/shop/CartProvider";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const { count, ready, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    menuRef.current?.close();
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-signal px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      <div className="border-b border-line bg-ink-2 font-mono text-xs text-fog">
        <div className="container-x flex h-9 items-center justify-between gap-4">
          <OpenStatus />
          <div className="flex items-center gap-5">
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 hover:text-white md:inline-flex">
              <MapPin size={14} aria-hidden /> {site.address.street}, {site.address.city}
            </a>
            <a href={site.phone.href} className="inline-flex items-center gap-1.5 text-mist hover:text-signal-hot">
              <Phone size={14} aria-hidden /> {site.phone.display}
            </a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? "border-line bg-ink/85 backdrop-blur-lg" : "border-transparent bg-ink"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
          <Logo priority className="h-7 w-auto sm:h-8" />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="relative rounded-md px-3 py-2 text-[0.95rem] text-mist transition-colors hover:text-white aria-[current=page]:text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={open} className="relative grid size-11 place-items-center rounded-full text-mist transition-colors hover:text-signal-hot" aria-label={`Open cart, ${ready ? count : 0} items`}>
              <ShoppingCartSimple size={24} aria-hidden />
              {ready && count > 0 && (
                <span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-signal px-1 font-mono text-[0.7rem] font-semibold text-ink">
                  {count}
                </span>
              )}
            </button>
            <Link href="/book" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Book a repair
            </Link>
            <button type="button" onClick={() => menuRef.current?.showModal()} className="grid size-11 place-items-center rounded-full text-mist hover:text-white lg:hidden" aria-label="Open menu">
              <List size={26} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <dialog ref={menuRef} className="sheet" aria-label="Menu" onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}>
        <div className="pcb-grid flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-xs tracking-[0.2em] text-fog uppercase">Menu</span>
            <button type="button" onClick={() => menuRef.current?.close()} className="grid size-11 place-items-center rounded-full text-fog hover:text-white" aria-label="Close menu">
              <X size={24} aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5">
            <ul>
              {[...nav, { href: "/faq", label: "FAQ" }].map((item, i) => (
                <li key={item.href} data-stagger style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={item.href}
                    onClick={() => menuRef.current?.close()}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="display flex items-center justify-between border-b border-line py-4 text-4xl transition-colors hover:text-signal-hot aria-[current=page]:text-signal-hot"
                  >
                    {item.label}
                    <ArrowRight size={22} aria-hidden className="text-line-2" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-line p-5">
            <Link href="/book" onClick={() => menuRef.current?.close()} className="btn btn-primary w-full">
              Book a repair
            </Link>
            <a href={site.phone.href} className="btn btn-ghost w-full">
              <Phone size={18} aria-hidden /> Call {site.phone.display}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
