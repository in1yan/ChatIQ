-- Migration: Add profile_picture_url column to customers table
-- Date: 2024
-- Description: Adds support for storing WhatsApp profile picture URLs

-- Add the profile_picture_url column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);

-- Add index for faster lookups (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_customers_profile_picture 
ON customers(profile_picture_url) 
WHERE profile_picture_url IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN customers.profile_picture_url IS 
'WhatsApp profile picture URL from WAHA API. Fetched only on customer creation.';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers' AND column_name = 'profile_picture_url';
