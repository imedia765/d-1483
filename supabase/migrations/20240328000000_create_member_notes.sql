-- Create enum for note types
CREATE TYPE note_type AS ENUM ('admin', 'payment', 'general');

-- Create member_notes table
CREATE TABLE member_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  note_text TEXT,
  note_type note_type DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_member_notes_member_id ON member_notes(member_id);

-- Migrate existing admin notes from members table
INSERT INTO member_notes (member_id, note_text, note_type, created_at, updated_at)
SELECT 
  id as member_id,
  admin_note as note_text,
  'admin'::note_type as note_type,
  created_at,
  updated_at
FROM members 
WHERE admin_note IS NOT NULL AND admin_note != '';

-- After successful migration, we can make admin_note nullable
-- but we'll keep it for now to ensure backward compatibility
-- ALTER TABLE members DROP COLUMN admin_note;