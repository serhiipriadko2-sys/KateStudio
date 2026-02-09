-- Migration: Fix nullable user_id in subscriptions table
-- Priority: P1 (Task #18 from CURRENT_TASKS.md)
-- Purpose: Add NOT NULL constraint and foreign key to ensure data integrity

-- Step 1: Identify and document records with NULL user_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count 
  FROM subscriptions 
  WHERE user_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE NOTICE 'Found % subscription records with NULL user_id', null_count;
  END IF;
END $$;

-- Step 2: Delete orphaned records older than 7 days
-- (newer ones might be in-flight payment webhooks)
DELETE FROM subscriptions
WHERE user_id IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

-- Step 3: Delete all remaining NULL records (aggressive cleanup)
-- Safe for pre-production: per PRODUCTION_READINESS_AUDIT_2026.md
-- the project is not yet in production
DELETE FROM subscriptions WHERE user_id IS NULL;

-- Step 4: Add NOT NULL constraint
ALTER TABLE subscriptions
ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Add foreign key constraint to auth.users if not exists
-- This ensures referential integrity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_fkey'
  ) THEN
    ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Add comment for documentation
COMMENT ON COLUMN subscriptions.user_id IS 
  'User ID from auth.users. Required for all subscriptions. NOT NULL constraint enforced.';
