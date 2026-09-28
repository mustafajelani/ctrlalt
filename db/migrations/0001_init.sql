-- CTRL ALT DEL database schema (Neon Postgres). Safe to run more than once.

CREATE TABLE IF NOT EXISTS tickets (
  id              TEXT PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  device_type     TEXT NOT NULL,
  device_model    TEXT,
  issues          TEXT[] NOT NULL DEFAULT '{}',
  details         TEXT,
  preferred_date  DATE,
  preferred_time  TEXT,
  source          TEXT NOT NULL DEFAULT 'online',
  status          TEXT NOT NULL DEFAULT 'booked',
  customer_note   TEXT
);

CREATE INDEX IF NOT EXISTS tickets_status_updated_idx ON tickets (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ticket_events (
  id          BIGSERIAL PRIMARY KEY,
  ticket_id   TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_events_ticket_idx ON ticket_events (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  items       JSONB NOT NULL,
  subtotal    NUMERIC(10, 2) NOT NULL,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'reserved'
);

CREATE TABLE IF NOT EXISTS messages (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  message     TEXT NOT NULL
);
