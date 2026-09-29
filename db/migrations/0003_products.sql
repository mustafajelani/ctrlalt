-- Shop catalog + live inventory, managed from the admin Products tab.
-- Reserved units are not stored: they are derived from orders in 'reserved' or 'ready' status.
CREATE TABLE IF NOT EXISTS products (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  condition   TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  specs       TEXT[] NOT NULL DEFAULT '{}',
  images      JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{ "src", "alt" }], first is the main photo
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  in_stock    BOOLEAN NOT NULL DEFAULT true,
  featured    BOOLEAN NOT NULL DEFAULT false,
  archived    BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_listing_idx ON products (archived, sort_order);

-- Starter catalog (placeholder listings with stock photos). Edit, archive or delete them in admin.
INSERT INTO products (slug, name, category, condition, summary, specs, images, price, quantity, in_stock, featured, sort_order) VALUES
  ('iphone-13-128gb', 'iPhone 13 · 128GB', 'phones', 'Refurbished', 'Unlocked, fully tested, fresh battery health check and a new tempered-glass protector installed.', ARRAY['128GB storage', 'Unlocked', 'Battery health 85%+', 'Includes USB-C to Lightning cable']::text[], '[{"src":"https://images.unsplash.com/photo-1702184117235-56002cb13663?auto=format&fit=crop&w=1200&q=80","alt":"Black iPhone on a table"}]'::jsonb, 379.00, 3, true, true, 10),
  ('iphone-15-128gb', 'iPhone 15 · 128GB', 'phones', 'Pre-owned', 'Clean, unlocked iPhone 15 with USB-C. Inspected and tested in-house.', ARRAY['128GB storage', 'Unlocked', 'USB-C', 'Minor signs of use']::text[], '[{"src":"https://images.unsplash.com/photo-1695048132832-b41495f12eb4?auto=format&fit=crop&w=1200&q=80","alt":"Two iPhones side by side"}]'::jsonb, 599.00, 1, true, false, 20),
  ('galaxy-s23', 'Samsung Galaxy S23 · 128GB', 'phones', 'Refurbished', 'Flagship Android in excellent condition, unlocked for all major carriers.', ARRAY['128GB storage', 'Unlocked', '6.1" AMOLED display', 'Includes charger']::text[], '[{"src":"https://images.unsplash.com/photo-1707438095940-1eee18e85400?auto=format&fit=crop&w=1200&q=80","alt":"Four Samsung Galaxy phones in different colors"}]'::jsonb, 429.00, 2, true, true, 30),
  ('pixel-8', 'Google Pixel 8 · 128GB', 'phones', 'Pre-owned', 'Pixel camera, clean Android, tested and ready to go.', ARRAY['128GB storage', 'Unlocked', 'Google Tensor G3', 'Light wear on frame']::text[], '[{"src":"https://images.unsplash.com/photo-1628320281190-89b24da58b0f?auto=format&fit=crop&w=1200&q=80","alt":"Person holding a white Android smartphone"}]'::jsonb, 379.00, 1, true, false, 40),
  ('macbook-air-m1', 'MacBook Air 13" M1', 'laptops', 'Refurbished', 'Silent, fanless, all-day battery. Fresh macOS install and a full hardware check.', ARRAY['Apple M1 chip', '8GB memory', '256GB SSD', 'Charger included']::text[], '[{"src":"https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80","alt":"Silver MacBook on a white table"}]'::jsonb, 549.00, 2, true, true, 50),
  ('dell-latitude-7420', 'Dell Latitude 7420 14"', 'laptops', 'Refurbished', 'Business-grade build for school or work, with a fresh Windows 11 install.', ARRAY['Intel Core i5 (11th gen)', '16GB RAM', '256GB SSD', 'Windows 11 Pro']::text[], '[{"src":"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80","alt":"Dell laptop with a blue desktop screen"}]'::jsonb, 389.00, 4, true, false, 60),
  ('asus-gaming-laptop', 'ASUS Gaming Laptop 15.6"', 'laptops', 'Pre-owned', 'Dedicated graphics for gaming and creative work. Deep-cleaned with fresh thermal paste.', ARRAY['NVIDIA RTX graphics', '16GB RAM', '512GB SSD', '144Hz display']::text[], '[{"src":"https://images.unsplash.com/photo-1622286346003-c5c7e63b1088?auto=format&fit=crop&w=1200&q=80","alt":"Black and silver ASUS laptop"}]'::jsonb, 799.00, 1, true, false, 70),
  ('ipad-9th-gen', 'iPad (9th gen) · 64GB', 'tablets', 'Refurbished', 'The go-to iPad for school, streaming and everyday use.', ARRAY['10.2" Retina display', '64GB storage', 'Wi-Fi', 'Charger included']::text[], '[{"src":"https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=80","alt":"Black iPad on a table"}]'::jsonb, 229.00, 3, true, false, 80),
  ('playstation-5-disc', 'PlayStation 5 (Disc)', 'gaming', 'Pre-owned', 'Cleaned inside and out, fresh thermal check, one controller included.', ARRAY['825GB SSD', 'Disc edition', '1 DualSense controller', 'HDMI & power cables']::text[], '[{"src":"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80","alt":"White PlayStation 5 console with controller"}]'::jsonb, 399.00, 1, true, true, 90),
  ('nintendo-switch-oled', 'Nintendo Switch OLED', 'gaming', 'Pre-owned', 'Vivid 7" OLED screen, dock and Joy-Con included. Tested for drift.', ARRAY['64GB storage', 'Dock & Joy-Con included', 'Tested for stick drift', 'HDMI & power cables']::text[], '[{"src":"https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1200&q=80","alt":"Nintendo Switch console with Joy-Con controllers"}]'::jsonb, 259.00, 2, true, false, 100),
  ('xbox-wireless-controller', 'Xbox Wireless Controller', 'gaming', 'New', 'Works with Xbox, Windows PCs and phones over Bluetooth.', ARRAY['Bluetooth & USB-C', 'Xbox / PC / mobile', 'Textured grips']::text[], '[{"src":"https://images.unsplash.com/photo-1604586376807-f73185cf5867?auto=format&fit=crop&w=1200&q=80","alt":"White Xbox wireless controller"}]'::jsonb, 59.00, 6, true, false, 110),
  ('mechanical-keyboard', 'Mechanical Keyboard · Orange Keycaps', 'accessories', 'New', 'Tactile switches, USB-C, and keycaps that match our shop colors.', ARRAY['Hot-swappable switches', 'USB-C detachable cable', 'Windows & Mac layouts']::text[], '[{"src":"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80","alt":"Black mechanical keyboard with orange keycaps"}]'::jsonb, 69.00, 5, true, true, 120),
  ('airpods-3rd-gen', 'AirPods (3rd generation)', 'accessories', 'New', 'Spatial audio, sweat and water resistant, with charging case.', ARRAY['Spatial audio', 'Up to 30 hours with case', 'Lightning charging case']::text[], '[{"src":"https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?auto=format&fit=crop&w=1200&q=80","alt":"White AirPods charging case"}]'::jsonb, 149.00, 4, true, false, 130),
  ('usb-c-20w-charger', '20W USB-C Fast Charger', 'accessories', 'New', 'Fast-charges iPhone, Pixel, Galaxy and most USB-C devices.', ARRAY['20W Power Delivery', 'USB-C port', 'Compact wall plug']::text[], '[{"src":"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80","alt":"White USB-C charging adapter"}]'::jsonb, 19.00, 20, true, false, 140),
  ('braided-usb-c-cable', 'Braided USB-C Cable · 6ft', 'accessories', 'New', 'Tough braided cable that survives backpacks and bedside tables.', ARRAY['6ft / 1.8m', 'USB-C to USB-C', '60W charging']::text[], '[{"src":"https://images.unsplash.com/photo-1572721546624-05bf65ad7679?auto=format&fit=crop&w=1200&q=80","alt":"Orange braided USB cables"}]'::jsonb, 12.00, 30, true, false, 150),
  ('tempered-glass-protector', 'Tempered Glass Screen Protector', 'accessories', 'New', '9H tempered glass for most iPhone and Android models. We''ll install it for free.', ARRAY['9H hardness', 'Bubble-free install in store', 'Most iPhone & Android models']::text[], '[{"src":"https://images.unsplash.com/photo-1567428486597-8c5328fd3816?auto=format&fit=crop&w=1200&q=80","alt":"White smartphone with a clear screen"}]'::jsonb, 15.00, 50, true, false, 160),
  ('phone-case', 'Protective Phone Case', 'accessories', 'New', 'Slim, shock-absorbing cases for popular iPhone and Galaxy models.', ARRAY['Raised camera lip', 'Shock-absorbing corners', 'Multiple colors']::text[], '[{"src":"https://images.unsplash.com/photo-1535157412991-2ef801c1748b?auto=format&fit=crop&w=1200&q=80","alt":"Four phone cases in assorted colors"}]'::jsonb, 19.00, 25, true, false, 170)
ON CONFLICT (slug) DO NOTHING;
