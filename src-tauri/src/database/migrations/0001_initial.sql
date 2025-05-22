CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    extension TEXT,
    title TEXT NOT NULL,
    description TEXT,
    added DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_verified DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_items_path ON items(path);

CREATE TABLE tag_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE INDEX idx_categories on tag_categories(id);
INSERT INTO tag_categories VALUES (0, 'Generic');

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
  	category INTEGER NOT NULL DEFAULT '0' REFERENCES tag_categories(id) ON DELETE SET DEFAULT
);

CREATE TABLE item_tags (
 	item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  	tag_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  	PRIMARY KEY(item_id, tag_id)
);
CREATE INDEX idx_tags ON item_tags(item_id, tag_id);