/*
  # Add Two-Factor Authentication Support

  1. New Tables
    - `admin_2fa`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `secret` (text)
      - `is_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_2fa` table
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS admin_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  secret text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_2fa ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage their own 2FA settings
CREATE POLICY "Admin can manage own 2FA"
  ON admin_2fa
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);