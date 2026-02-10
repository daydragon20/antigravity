-- Add category column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'other';

-- Update existing rows to have default value
UPDATE tasks 
SET category = 'other' 
WHERE category IS NULL;
