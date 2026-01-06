-- Migration: Add status column and other missing columns to Users table
-- Run this if you get "Unknown column 'status' in 'field list'" error

USE web_news;

-- Add missing columns to Users table
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS years_of_experience INT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') DEFAULT 'male',
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

-- Note: If MySQL version doesn't support IF NOT EXISTS, run each ALTER separately:
-- ALTER TABLE Users ADD COLUMN name VARCHAR(100);
-- ALTER TABLE Users ADD COLUMN age INT;
-- ALTER TABLE Users ADD COLUMN years_of_experience INT;
-- ALTER TABLE Users ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE Users ADD COLUMN address TEXT;
-- ALTER TABLE Users ADD COLUMN dob DATE;
-- ALTER TABLE Users ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT 'male';
-- ALTER TABLE Users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

-- Update existing users to have 'approved' status (if they don't have status set)
UPDATE Users SET status = 'approved' WHERE status IS NULL;

