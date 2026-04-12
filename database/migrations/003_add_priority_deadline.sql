-- Migration: Add priority and deadline to tasks
-- Run this in Supabase SQL Editor if you already have the table created

-- Add priority column with default value
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baixa'));

-- Add deadline column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline DATE;
