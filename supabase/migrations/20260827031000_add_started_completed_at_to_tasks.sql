-- Add started_at and completed_at columns to the tasks table for more precise activity tracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
