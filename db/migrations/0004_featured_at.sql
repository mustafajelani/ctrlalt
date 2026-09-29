-- The home page shows the most recently featured products, so remember when each one was featured.
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;

-- Existing featured products keep their current order (earlier in the shop = shown first).
UPDATE products SET featured_at = now() - sort_order * INTERVAL '1 second'
WHERE featured AND featured_at IS NULL;
