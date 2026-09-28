export type DayHours = { day: number; name: string; open: string | null; close: string | null };

export const site = {
  name: "CTRL ALT DEL",
  shortName: "Ctrl Alt Del",
  tagline: "Your local tech experts",
  description:
    "Phone, laptop, tablet and game console repair in Kensington, Philadelphia. Screen replacements, batteries, broken keys, upgrades and tech advice, plus laptops, phones and electronics for sale.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ctrlaltdelllc.com").replace(/\/$/, ""),
  phone: { display: "(215) 279-7222", href: "tel:+12152797222", e164: "+12152797222" },
  address: {
    street: "319 E Allegheny Ave",
    city: "Philadelphia",
    region: "PA",
    postal: "19134",
    country: "US",
    neighborhood: "Kensington",
  },
  geo: { lat: 39.998138, lng: -75.1246747 },
  mapsUrl: "https://maps.app.goo.gl/SoziSWANBiZw2ieY7",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Ctrl+Alt+Del,+319+E+Allegheny+Ave,+Philadelphia,+PA+19134&z=15&output=embed",
  rating: { value: 4.7, count: 10, source: "Google" },
  timeZone: "America/New_York",
  hours: [
    { day: 1, name: "Monday", open: "10:00", close: "17:00" },
    { day: 2, name: "Tuesday", open: "10:00", close: "17:00" },
    { day: 3, name: "Wednesday", open: "10:00", close: "17:00" },
    { day: 4, name: "Thursday", open: "10:00", close: "17:00" },
    { day: 5, name: "Friday", open: "10:00", close: "17:00" },
    { day: 6, name: "Saturday", open: "12:00", close: "17:00" },
    { day: 0, name: "Sunday", open: null, close: null },
  ],
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track Repair" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const serviceAreas = [
  "Kensington",
  "Port Richmond",
  "Fishtown",
  "Harrowgate",
  "Fairhill",
  "Juniata Park",
  "Frankford",
  "Bridesburg",
  "Northern Liberties",
  "Hunting Park",
  "Feltonville",
  "Olney",
];
