-- Migration: Remove 'assigned' column and add 'created_by' column
-- Run this in Supabase SQL Editor if you already have the table created

-- Remove the 'assigned' column
ALTER TABLE tasks DROP COLUMN IF EXISTS assigned;

-- Add 'created_by' column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Update completed_by constraint to allow 'both'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_completed_by_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_completed_by_check 
  CHECK (completed_by IN ('player1', 'player2', 'both') OR completed_by IS NULL);

-- Update existing 'ambos' values in completed_by to 'both'
UPDATE tasks SET completed_by = 'both' WHERE completed_by = 'ambos';
