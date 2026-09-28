-- Track when an order last changed status so completed orders can be sorted by completion time.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE orders SET updated_at = created_at;

CREATE INDEX IF NOT EXISTS orders_status_updated_idx ON orders (status, updated_at DESC);
