-- Add profile_image_data column to florist_auth table
ALTER TABLE florist_auth ADD COLUMN IF NOT EXISTS profile_image_data TEXT;

-- Add comment for clarity
COMMENT ON COLUMN florist_auth.profile_image_data IS 'Base64 encoded image data for profile photos';