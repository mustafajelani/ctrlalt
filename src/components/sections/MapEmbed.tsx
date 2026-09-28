"use client";

import { ArrowUpRight, MapPin, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { fullAddress, site } from "@/lib/site";

/** Google's embed is ~1 MB of script: auto-load on desktop, tap-to-load on phones. */
export function MapEmbed() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 64rem)").matches) setLoad(true);
  }, []);

  if (load) {
    return (
      <iframe
        title={`Map showing CTRL ALT DEL at ${fullAddress}`}
        src={site.mapEmbedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full [filter:invert(92%)_hue-rotate(180deg)_saturate(0.55)_contrast(0.95)]"
      />
    );
  }

  return (
    <div className="pcb-grid absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="relative grid size-14 place-items-center rounded-full border border-signal/50 bg-ink text-signal">
        <span className="ping absolute inset-0 rounded-full text-signal/30" aria-hidden />
        <MapPin size={26} weight="fill" className="relative" aria-hidden />
      </span>
      <div>
        <p className="text-lg">{site.address.street}</p>
        <p className="text-sm text-fog">
          {site.address.city}, {site.address.region} {site.address.postal}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setLoad(true)} className="btn btn-ghost btn-sm">
          <MapTrifold size={16} aria-hidden /> Load map
        </button>
        <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Open in Google Maps <ArrowUpRight size={14} weight="bold" aria-hidden />
        </a>
      </div>
    </div>
  );
}
