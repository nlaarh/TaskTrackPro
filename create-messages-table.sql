-- Create messages table for admin-florist communication
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('admin', 'florist')),
  recipient_id VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('admin', 'florist')),
  subject VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Add some sample admin-florist messages
INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, subject, message_body, is_read, created_at) VALUES
('admin-1', 'admin', '143', 'florist', 'Welcome to FloriHub', 'Welcome to our platform! We''re excited to have you as part of our florist community. Please let us know if you need any assistance setting up your profile.', false, NOW() - INTERVAL '2 days'),
('143', 'florist', 'admin-1', 'admin', 'Profile Setup Question', 'Hi, I need help updating my business hours and service offerings. Could you please guide me through the process?', true, NOW() - INTERVAL '1 day'),
('admin-1', 'admin', '142', 'florist', 'Featured Listing Opportunity', 'We have an opportunity for you to become a featured florist on our homepage. This would increase your visibility significantly. Would you be interested?', false, NOW() - INTERVAL '3 hours'),
('142', 'florist', 'admin-1', 'admin', 'Re: Featured Listing Opportunity', 'Yes, I''m very interested in the featured listing opportunity. What are the requirements and next steps?', false, NOW() - INTERVAL '1 hour');