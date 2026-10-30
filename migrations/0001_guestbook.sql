CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 180),
  post_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS guestbook_entries_created_at
  ON guestbook_entries (created_at DESC);

CREATE TABLE IF NOT EXISTS guestbook_daily_limits (
  device_hash TEXT NOT NULL,
  post_date TEXT NOT NULL,
  PRIMARY KEY (device_hash, post_date)
);
