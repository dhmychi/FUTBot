/*
  # Add payment and auth columns to user_subscriptions

  1. Changes
    - Add auth_user_id column to link with auth.users
    - Add payment-related columns for tracking transactions
    - Add RLS policies for secure access

  2. Security
    - Enable RLS
    - Add policies for user access and admin management
*/

-- Add payment and auth columns to user_subscriptions
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_date timestamptz DEFAULT now();

-- Enable RLS if not already enabled
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own subscriptions" ON user_subscriptions;
  DROP POLICY IF EXISTS "Users can update own subscriptions" ON user_subscriptions;
  DROP POLICY IF EXISTS "Admin full access" ON user_subscriptions;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can read own subscriptions"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own subscriptions"
ON user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Admin full access"
ON user_subscriptions
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@futbot.com')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@futbot.com');