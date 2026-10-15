CREATE TABLE IF NOT EXISTS scores (
 id TEXT PRIMARY KEY,
 day TEXT NOT NULL,
 name TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 700),
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scores_day_score ON scores(day, score DESC);
