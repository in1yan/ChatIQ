-- Migration: Add telegram_user_id column to customers table
-- Date: 2024
-- Description: Adds support for Telegram user identification

-- Add the telegram_user_id column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS telegram_user_id VARCHAR(50) UNIQUE;

-- Add index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_telegram_user_id 
ON customers(telegram_user_id) 
WHERE telegram_user_id IS NOT NULL;

-- Update the check constraint to include telegram_user_id
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS check_identifier;

ALTER TABLE customers 
ADD CONSTRAINT check_identifier 
CHECK (
    phone_number IS NOT NULL OR 
    email IS NOT NULL OR 
    telegram_user_id IS NOT NULL
);

-- Add comment explaining the column
COMMENT ON COLUMN customers.telegram_user_id IS 
'Telegram user ID (unique numeric identifier from Telegram Bot API). Used for customer identification in Telegram channel.';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers' AND column_name = 'telegram_user_id';
