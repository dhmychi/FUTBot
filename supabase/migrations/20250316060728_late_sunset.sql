/*
  # Set up Admin Access Policies (Safe Version)

  1. Changes
    - Safely create admin access policy if it doesn't exist
    - Safely create public verification policy if it doesn't exist
    
  Note: Uses DO blocks to check for policy existence before creation
*/

DO $$ 
BEGIN
  -- Check and create admin full access policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Admin full access'
  ) THEN
    CREATE POLICY "Admin full access"
    ON subscriptions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@futbot.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@futbot.com');
  END IF;

  -- Check and create public verification policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Public verify subscription'
  ) THEN
    CREATE POLICY "Public verify subscription"
    ON subscriptions
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;