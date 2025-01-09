/*
  # Add CV field to profiles

  1. Changes
    - Add cv_url column to profiles table to store the CV file path
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cv_url text;