/*
  # Add social links to profiles

  1. Changes
    - Add social_links JSONB column to profiles table
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;