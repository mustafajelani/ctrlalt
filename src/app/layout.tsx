import type { Metadata, Viewport } from "next";
import { Electrolize, IBM_Plex_Mono, Saira_Condensed } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartProvider } from "@/components/shop/CartProvider";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { serviceAreas, site } from "@/lib/site";
import "./globals.css";

const display = Saira_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-saira", display: "swap" });
const sans = Electrolize({ subsets: ["latin"], weight: "400", variable: "--font-electrolize", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CTRL ALT DEL | Phone, Laptop & Console Repair in Philadelphia",
    template: "%s | CTRL ALT DEL Philadelphia",
  },
  description: site.description,
  keywords: [
    "phone repair Philadelphia",
    "laptop repair Philadelphia",
    "iPhone screen repair Kensington",
    "computer repair 19134",
    "game console repair Philadelphia",
    "refurbished laptops Philadelphia",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: "CTRL ALT DEL | Your local tech experts",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  "@id": `${site.url}/#business`,
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone.e164,
  image: `${site.url}/brand/logo-horizontal.png`,
  logo: `${site.url}/brand/logo-horizontal.png`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postal,
    addressCountry: site.address.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  openingHoursSpecification: site.hours
    .filter((h) => h.open)
    .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.name, opens: h.open, closes: h.close })),
  areaServed: [...serviceAreas.map((name) => ({ "@type": "Place", name: `${name}, Philadelphia` })), { "@type": "City", name: "Philadelphia" }],
  hasMap: site.mapsUrl,
  sameAs: [site.mapsUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-dvh">
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
