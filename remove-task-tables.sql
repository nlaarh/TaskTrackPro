-- Remove Task Management System from TaskTrackPro
-- This script removes all task-related tables and updates the quote_requests table

-- First, remove all task-related tables (in order due to foreign key constraints)
DROP TABLE IF EXISTS task_notifications CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;
DROP TABLE IF EXISTS admin_tasks CASCADE;

-- Add the assigned_florist_id column to quote_requests table if it doesn't exist
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS assigned_florist_id INTEGER;

-- Add foreign key constraint to florist_auth table (optional, for data integrity)
-- ALTER TABLE quote_requests 
-- ADD CONSTRAINT fk_quote_requests_florist 
-- FOREIGN KEY (assigned_florist_id) REFERENCES florist_auth(id);

-- Update any existing quote requests to use the new status values
-- Convert old status values to new ones:
-- 'reviewed' -> 'in-progress'
-- 'quoted' -> 'in-progress'
-- 'rejected' -> 'cancelled'
UPDATE quote_requests 
SET status = CASE 
    WHEN status = 'reviewed' THEN 'in-progress'
    WHEN status = 'quoted' THEN 'in-progress'
    WHEN status = 'rejected' THEN 'cancelled'
    ELSE status
END
WHERE status IN ('reviewed', 'quoted', 'rejected');

-- Verify the changes
SELECT 'Quote requests with new status values:' as info;
SELECT status, COUNT(*) as count 
FROM quote_requests 
GROUP BY status 
ORDER BY status;

SELECT 'Task management tables removed successfully' as result;
