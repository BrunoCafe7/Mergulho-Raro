-- Rode uma única vez no console D1 do banco existente.
-- IMPORTANTE: esta migração mantém os recordes, mas remova o limite antigo de 700.
CREATE TABLE IF NOT EXISTS scores_v7 (
 id TEXT PRIMARY KEY,
 day TEXT NOT NULL,
 name TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 2000),
 created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO scores_v7 (id, day, name, score, created_at)
 SELECT id, day, name, score, created_at FROM scores;
DROP TABLE scores;
ALTER TABLE scores_v7 RENAME TO scores;
CREATE INDEX IF NOT EXISTS idx_scores_day_score ON scores(day, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_name_day ON scores(name, day);
CREATE TABLE IF NOT EXISTS answer_suggestions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 question TEXT NOT NULL,
 answer TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON answer_suggestions(status, created_at);
