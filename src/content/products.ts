// Once a database is connected, products live in the `products` table and are managed from the
// admin Products tab (see src/lib/catalog.ts). `seedProducts` below is only the starter catalog:
// migration 0003 copies it into the database, and it's shown as a demo when no database is configured.
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export type Category = "phones" | "laptops" | "tablets" | "gaming" | "accessories";
export type Condition = "New" | "Refurbished" | "Pre-owned";
export type StockStatus = "available" | "reserved" | "sold-out";
export type ProductImage = { src: string; alt: string };

export type Product = {
  slug: string;
  name: string;
  category: Category;
  condition: Condition;
  price: number;
  /** Units that can be reserved right now (after other customers' holds). */
  stock: number;
  /** Set once live inventory is merged in; absent on raw catalog entries. */
  status?: StockStatus;
  featured?: boolean;
  /** When it was last featured (ms since epoch); the home page shows the most recent ones. */
  featuredAt?: number;
  /** Main photo (always set; a placeholder when a listing has no photos). */
  image: ProductImage;
  /** Main photo first, then up to 6 gallery photos. */
  images: ProductImage[];
  summary: string;
  specs: string[];
};

export type SeedProduct = Omit<Product, "images" | "status">;

export const conditions: Condition[] = ["New", "Refurbished", "Pre-owned"];

/** How many featured products the home page shows. */
export const HOME_FEATURED = 4;

export const PLACEHOLDER_IMAGE: ProductImage = { src: "/brand/product-placeholder.svg", alt: "" };

/** The few fields the cart stores with a line (keeps client payloads small). */
export function cartSnapshot(p: Product) {
  return { slug: p.slug, name: p.name, condition: p.condition, image: p.image, price: p.price };
}

export const categories: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "phones", label: "Phones" },
  { key: "laptops", label: "Laptops" },
  { key: "tablets", label: "Tablets" },
  { key: "gaming", label: "Gaming" },
  { key: "accessories", label: "Accessories" },
];

export const seedProducts: SeedProduct[] = [
  {
    slug: "iphone-13-128gb",
    name: "iPhone 13 · 128GB",
    category: "phones",
    condition: "Refurbished",
    price: 379,
    stock: 3,
    featured: true,
    image: { src: u("photo-1702184117235-56002cb13663"), alt: "Black iPhone on a table" },
    summary: "Unlocked, fully tested, fresh battery health check and a new tempered-glass protector installed.",
    specs: ["128GB storage", "Unlocked", "Battery health 85%+", "Includes USB-C to Lightning cable"],
  },
  {
    slug: "iphone-15-128gb",
    name: "iPhone 15 · 128GB",
    category: "phones",
    condition: "Pre-owned",
    price: 599,
    stock: 1,
    image: { src: u("photo-1695048132832-b41495f12eb4"), alt: "Two iPhones side by side" },
    summary: "Clean, unlocked iPhone 15 with USB-C. Inspected and tested in-house.",
    specs: ["128GB storage", "Unlocked", "USB-C", "Minor signs of use"],
  },
  {
    slug: "galaxy-s23",
    name: "Samsung Galaxy S23 · 128GB",
    category: "phones",
    condition: "Refurbished",
    price: 429,
    stock: 2,
    featured: true,
    image: { src: u("photo-1707438095940-1eee18e85400"), alt: "Four Samsung Galaxy phones in different colors" },
    summary: "Flagship Android in excellent condition, unlocked for all major carriers.",
    specs: ["128GB storage", "Unlocked", "6.1\" AMOLED display", "Includes charger"],
  },
  {
    slug: "pixel-8",
    name: "Google Pixel 8 · 128GB",
    category: "phones",
    condition: "Pre-owned",
    price: 379,
    stock: 1,
    image: { src: u("photo-1628320281190-89b24da58b0f"), alt: "Person holding a white Android smartphone" },
    summary: "Pixel camera, clean Android, tested and ready to go.",
    specs: ["128GB storage", "Unlocked", "Google Tensor G3", "Light wear on frame"],
  },
  {
    slug: "macbook-air-m1",
    name: "MacBook Air 13\" M1",
    category: "laptops",
    condition: "Refurbished",
    price: 549,
    stock: 2,
    featured: true,
    image: { src: u("photo-1611186871348-b1ce696e52c9"), alt: "Silver MacBook on a white table" },
    summary: "Silent, fanless, all-day battery. Fresh macOS install and a full hardware check.",
    specs: ["Apple M1 chip", "8GB memory", "256GB SSD", "Charger included"],
  },
  {
    slug: "dell-latitude-7420",
    name: "Dell Latitude 7420 14\"",
    category: "laptops",
    condition: "Refurbished",
    price: 389,
    stock: 4,
    image: { src: u("photo-1588872657578-7efd1f1555ed"), alt: "Dell laptop with a blue desktop screen" },
    summary: "Business-grade build for school or work, with a fresh Windows 11 install.",
    specs: ["Intel Core i5 (11th gen)", "16GB RAM", "256GB SSD", "Windows 11 Pro"],
  },
  {
    slug: "asus-gaming-laptop",
    name: "ASUS Gaming Laptop 15.6\"",
    category: "laptops",
    condition: "Pre-owned",
    price: 799,
    stock: 1,
    image: { src: u("photo-1622286346003-c5c7e63b1088"), alt: "Black and silver ASUS laptop" },
    summary: "Dedicated graphics for gaming and creative work. Deep-cleaned with fresh thermal paste.",
    specs: ["NVIDIA RTX graphics", "16GB RAM", "512GB SSD", "144Hz display"],
  },
  {
    slug: "ipad-9th-gen",
    name: "iPad (9th gen) · 64GB",
    category: "tablets",
    condition: "Refurbished",
    price: 229,
    stock: 3,
    image: { src: u("photo-1561154464-82e9adf32764"), alt: "Black iPad on a table" },
    summary: "The go-to iPad for school, streaming and everyday use.",
    specs: ["10.2\" Retina display", "64GB storage", "Wi-Fi", "Charger included"],
  },
  {
    slug: "playstation-5-disc",
    name: "PlayStation 5 (Disc)",
    category: "gaming",
    condition: "Pre-owned",
    price: 399,
    stock: 1,
    featured: true,
    image: { src: u("photo-1606144042614-b2417e99c4e3"), alt: "White PlayStation 5 console with controller" },
    summary: "Cleaned inside and out, fresh thermal check, one controller included.",
    specs: ["825GB SSD", "Disc edition", "1 DualSense controller", "HDMI & power cables"],
  },
  {
    slug: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "gaming",
    condition: "Pre-owned",
    price: 259,
    stock: 2,
    image: { src: u("photo-1578303512597-81e6cc155b3e"), alt: "Nintendo Switch console with Joy-Con controllers" },
    summary: "Vivid 7\" OLED screen, dock and Joy-Con included. Tested for drift.",
    specs: ["64GB storage", "Dock & Joy-Con included", "Tested for stick drift", "HDMI & power cables"],
  },
  {
    slug: "xbox-wireless-controller",
    name: "Xbox Wireless Controller",
    category: "gaming",
    condition: "New",
    price: 59,
    stock: 6,
    image: { src: u("photo-1604586376807-f73185cf5867"), alt: "White Xbox wireless controller" },
    summary: "Works with Xbox, Windows PCs and phones over Bluetooth.",
    specs: ["Bluetooth & USB-C", "Xbox / PC / mobile", "Textured grips"],
  },
  {
    slug: "mechanical-keyboard",
    name: "Mechanical Keyboard · Orange Keycaps",
    category: "accessories",
    condition: "New",
    price: 69,
    stock: 5,
    featured: true,
    image: { src: u("photo-1618384887929-16ec33fab9ef"), alt: "Black mechanical keyboard with orange keycaps" },
    summary: "Tactile switches, USB-C, and keycaps that match our shop colors.",
    specs: ["Hot-swappable switches", "USB-C detachable cable", "Windows & Mac layouts"],
  },
  {
    slug: "airpods-3rd-gen",
    name: "AirPods (3rd generation)",
    category: "accessories",
    condition: "New",
    price: 149,
    stock: 4,
    image: { src: u("photo-1606841837239-c5a1a4a07af7"), alt: "White AirPods charging case" },
    summary: "Spatial audio, sweat and water resistant, with charging case.",
    specs: ["Spatial audio", "Up to 30 hours with case", "Lightning charging case"],
  },
  {
    slug: "usb-c-20w-charger",
    name: "20W USB-C Fast Charger",
    category: "accessories",
    condition: "New",
    price: 19,
    stock: 20,
    image: { src: u("photo-1583863788434-e58a36330cf0"), alt: "White USB-C charging adapter" },
    summary: "Fast-charges iPhone, Pixel, Galaxy and most USB-C devices.",
    specs: ["20W Power Delivery", "USB-C port", "Compact wall plug"],
  },
  {
    slug: "braided-usb-c-cable",
    name: "Braided USB-C Cable · 6ft",
    category: "accessories",
    condition: "New",
    price: 12,
    stock: 30,
    image: { src: u("photo-1572721546624-05bf65ad7679"), alt: "Orange braided USB cables" },
    summary: "Tough braided cable that survives backpacks and bedside tables.",
    specs: ["6ft / 1.8m", "USB-C to USB-C", "60W charging"],
  },
  {
    slug: "tempered-glass-protector",
    name: "Tempered Glass Screen Protector",
    category: "accessories",
    condition: "New",
    price: 15,
    stock: 50,
    image: { src: u("photo-1567428486597-8c5328fd3816"), alt: "White smartphone with a clear screen" },
    summary: "9H tempered glass for most iPhone and Android models. We'll install it for free.",
    specs: ["9H hardness", "Bubble-free install in store", "Most iPhone & Android models"],
  },
  {
    slug: "phone-case",
    name: "Protective Phone Case",
    category: "accessories",
    condition: "New",
    price: 19,
    stock: 25,
    image: { src: u("photo-1535157412991-2ef801c1748b"), alt: "Four phone cases in assorted colors" },
    summary: "Slim, shock-absorbing cases for popular iPhone and Galaxy models.",
    specs: ["Raised camera lip", "Shock-absorbing corners", "Multiple colors"],
  },
];

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}
