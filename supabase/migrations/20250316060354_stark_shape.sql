/*
  # FUTBot Subscription System Schema

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `secret_code` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for admin access
*/

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  secret_code text NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow admin to perform all operations
CREATE POLICY "Admin full access"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@futbot.com')
  WITH CHECK (auth.email() = 'admin@futbot.com');

-- Allow public to verify subscription with email and secret code
CREATE POLICY "Public verify subscription"
  ON subscriptions
  FOR SELECT
  TO public
  USING (true);