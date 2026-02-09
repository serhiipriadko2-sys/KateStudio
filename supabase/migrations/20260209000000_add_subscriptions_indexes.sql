-- Migration: Add indexes for subscriptions table
-- Date: 2026-02-09
-- Priority: P1 (Task #16 from CURRENT_TASKS.md)
-- Purpose: Optimize Edge Functions queries (gemini-proxy, create-payment, payment-webhook)

-- Index for fast user_id lookups (used in all 3 Edge Functions)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON subscriptions(user_id);

-- Composite index for active subscription checks
-- (used in gemini-proxy to check plan + status + expiry)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status, current_period_end);

-- Index for status filtering (useful for admin queries and cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(status) 
WHERE status IN ('active', 'trialing', 'pending');

-- Index for subscription_id lookups in webhook handler
CREATE INDEX IF NOT EXISTS idx_subscriptions_id 
ON subscriptions(id);

-- Add comments for documentation
COMMENT ON INDEX idx_subscriptions_user_id IS 
  'Fast user_id lookups for Edge Functions';
COMMENT ON INDEX idx_subscriptions_user_status IS 
  'Composite index for active subscription checks';
COMMENT ON INDEX idx_subscriptions_status IS 
  'Status filtering for admin queries and cleanup jobs';
