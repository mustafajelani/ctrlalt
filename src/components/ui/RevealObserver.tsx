"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds `.is-in` to [data-reveal] elements as they scroll into view and pauses [data-anim] loops offscreen. */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            reveal.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const anim = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle("anim-off", !entry.isIntersecting);
    });

    const watch = (el: Element) => {
      if (el.matches("[data-reveal]:not(.is-in)")) reveal.observe(el);
      if (el.matches("[data-anim]")) anim.observe(el);
    };
    const scan = (root: Element | Document) => {
      root.querySelectorAll("[data-reveal]:not(.is-in), [data-anim]").forEach(watch);
    };

    scan(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            watch(node);
            scan(node);
          }
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      reveal.disconnect();
      anim.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
