-- Add additional indexes for better performance

-- Index for faster lookups by extension (if we ever filter by file type)
CREATE INDEX IF NOT EXISTS idx_items_extension ON items(extension);

-- Index for faster sorting by added date
CREATE INDEX IF NOT EXISTS idx_items_added ON items(added DESC);

-- Index for faster sorting by title (if we ever implement search)
CREATE INDEX IF NOT EXISTS idx_items_title ON items(title);

-- Composite index for common queries that might filter by extension and sort by date
CREATE INDEX IF NOT EXISTS idx_items_ext_added ON items(extension, added DESC);