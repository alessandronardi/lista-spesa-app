-- Row Level Security (RLS) Policies
-- Requirements: 7.4, 7.5

-- Enable RLS on all tables
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Lists: Anyone can read/create lists
CREATE POLICY "Anyone can create lists" ON lists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read lists" ON lists
  FOR SELECT USING (true);

-- Items: Access based on list existence
CREATE POLICY "Anyone can read items for existing lists" ON items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id)
  );

CREATE POLICY "Anyone can insert items for existing lists" ON items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id)
  );

CREATE POLICY "Anyone can update items for existing lists" ON items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id)
  );

CREATE POLICY "Anyone can delete items for existing lists" ON items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id)
  );

-- Categories: Same pattern as items
CREATE POLICY "Anyone can read categories for existing lists" ON categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = categories.list_id)
  );

CREATE POLICY "Anyone can insert categories for existing lists" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = categories.list_id)
    AND is_default = false
  );

CREATE POLICY "Anyone can delete custom categories" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = categories.list_id)
    AND is_default = false
  );
