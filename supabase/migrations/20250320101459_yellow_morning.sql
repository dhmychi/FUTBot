/*
  # Sync subscriptions and user_subscriptions tables

  1. Changes
    - Add payment_id column to subscriptions table
    - Add payment_status column to subscriptions table
    - Add subscription_type column to subscriptions table
    - Add amount_paid column to subscriptions table
    - Add payment_method column to subscriptions table
    - Add trigger to sync user_subscriptions with subscriptions

  2. Security
    - Maintain existing RLS policies
    - Add trigger for automatic syncing
*/

-- Add payment-related columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subscription_type text,
ADD COLUMN IF NOT EXISTS amount_paid numeric,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Create function to generate random secret code
CREATE OR REPLACE FUNCTION generate_secret_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to sync subscriptions
CREATE OR REPLACE FUNCTION sync_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscriptions (
      email,
      secret_code,
      start_date,
      end_date,
      is_active,
      payment_id,
      payment_status,
      subscription_type,
      amount_paid,
      payment_method
    ) VALUES (
      NEW.email,
      generate_secret_code(),
      NEW.start_date,
      NEW.end_date,
      CASE 
        WHEN NEW.payment_status = 'completed' THEN true
        ELSE false
      END,
      NEW.id::text,
      NEW.payment_status,
      NEW.subscription_type,
      NEW.amount_paid,
      NEW.payment_method
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE subscriptions
    SET is_active = CASE 
          WHEN NEW.payment_status = 'completed' THEN true
          ELSE false
        END,
        payment_status = NEW.payment_status
    WHERE email = NEW.email
    AND payment_id = NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for syncing
DROP TRIGGER IF EXISTS sync_subscription_trigger ON user_subscriptions;
CREATE TRIGGER sync_subscription_trigger
AFTER INSERT OR UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_user_subscription();