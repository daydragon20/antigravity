-- Add theme column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system';

-- Update existing rows to have default value
UPDATE profiles
SET theme = 'system'
WHERE theme IS NULL;
