/*
  # Create user subscriptions schema

  1. New Tables
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `subscription_type` (text)
      - `amount_paid` (numeric)
      - `payment_status` (text)
      - `payment_method` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_subscriptions` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  subscription_type text NOT NULL,
  amount_paid numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admin to manage all subscriptions
CREATE POLICY "Admin can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@futbot.com')
  WITH CHECK (auth.email() = 'admin@futbot.com');