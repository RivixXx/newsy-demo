-- Add missing TOTP columns to User table
-- Run in Supabase SQL Editor

-- Check if columns already exist
DO $$ 
BEGIN
  -- Add totp_enabled if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'totp_enabled'
  ) THEN
    ALTER TABLE "User" ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Added totp_enabled column';
  ELSE
    RAISE NOTICE 'totp_enabled column already exists';
  END IF;

  -- Add totp_secret if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'totp_secret'
  ) THEN
    ALTER TABLE "User" ADD COLUMN totp_secret TEXT;
    RAISE NOTICE 'Added totp_secret column';
  ELSE
    RAISE NOTICE 'totp_secret column already exists';
  END IF;

  -- Add totp_backup_codes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'totp_backup_codes'
  ) THEN
    ALTER TABLE "User" ADD COLUMN totp_backup_codes TEXT;
    RAISE NOTICE 'Added totp_backup_codes column';
  ELSE
    RAISE NOTICE 'totp_backup_codes column already exists';
  END IF;

  -- Add totp_verified_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'totp_verified_at'
  ) THEN
    ALTER TABLE "User" ADD COLUMN totp_verified_at TIMESTAMPTZ;
    RAISE NOTICE 'Added totp_verified_at column';
  ELSE
    RAISE NOTICE 'totp_verified_at column already exists';
  END IF;
END $$;
