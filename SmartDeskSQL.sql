use smartdesk;
create database smartdesk;
drop database smartdesk;

select * from users;
select * from tickets;
INSERT INTO categories (name, description, created_at) VALUES ('Network', 'Network connectivity issues', NOW());
select * from categories;

UPDATE users SET role = 'ADMIN' WHERE email = 'jamhab35@gmail.com';

-- Categories
INSERT INTO categories (name, description, created_at) VALUES
('Network', 'Network connectivity issues', NOW()),
('Software', 'Software installation and issues', NOW()),
('Hardware', 'Physical equipment issues', NOW()),
('Account', 'Account access and permissions', NOW()),
('Security', 'Security-related concerns', NOW()),
('Other', 'Anything else', NOW());

-- Users (password hash below = "password123")
INSERT INTO users (name, email, password, role, created_at, active, email_verified) VALUES
('Ahmed Hassan', 'ahmed.agent@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'IT_AGENT', NOW(), True, True),
('Sarah Morales', 'sarah.agent@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'IT_AGENT', NOW(), True, True),
('David Chen', 'david@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'EMPLOYEE', NOW(), True, True),
('Emily Taylor', 'emily@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'EMPLOYEE', NOW(), True, True),
('Marcus Cole', 'marcus@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'EMPLOYEE', NOW(), True, True),
('Rachel Hayes', 'rachel@smartdesk.com', '$2b$10$ZQKLVHT1iPkDPCGQdVqdfOu0Be68ZxwR38EB.BCoZm98055.E7qvK', 'EMPLOYEE', NOW(), True, True);

-- Tickets — mix of statuses, priorities, categories, assigned/unassigned
-- category_id: 1=Network 2=Software 3=Hardware 4=Account 5=Security 6=Other
-- created_by/assigned_to reference the user IDs inserted above (1=Admin, 2=Ahmed, 3=Sarah, 4=David, 5=Emily, 6=Marcus, 7=Rachel)

INSERT INTO tickets (title, description, status, priority, category_id, created_by, assigned_to, created_at, updated_at, resolved_at) VALUES
('Cannot connect to office WiFi', 'My laptop won''t connect to the corporate WiFi network after the recent update.', 'OPEN', 'HIGH', 1, 4, NULL, NOW(), NOW(), NULL),
('Need Photoshop license', 'Requesting a license for Adobe Photoshop for design work.', 'IN_PROGRESS', 'MEDIUM', 2, 5, 2, NOW(), NOW(), NULL),
('Laptop screen flickering', 'The screen on my company laptop flickers intermittently, especially on battery power.', 'OPEN', 'CRITICAL', 3, 6, NULL, NOW(), NOW(), NULL),
('Password reset request', 'Locked out of my account after too many failed login attempts.', 'RESOLVED', 'HIGH', 4, 4, 3, NOW(), NOW(), NOW()),
('Suspicious email received', 'Received a phishing-looking email asking for my credentials, want it verified.', 'IN_PROGRESS', 'CRITICAL', 5, 5, 2, NOW(), NOW(), NULL),
('Printer not working on 3rd floor', 'The shared printer is showing an offline error and won''t print any jobs.', 'OPEN', 'LOW', 6, 7, NULL, NOW(), NOW(), NULL),
('VPN keeps disconnecting', 'VPN connection drops every 10-15 minutes while working from home.', 'OPEN', 'MEDIUM', 1, 6, NULL, NOW(), NOW(), NULL),
('New employee laptop setup', 'Need a laptop configured and provisioned for a new hire starting Monday.', 'RESOLVED', 'MEDIUM', 3, 4, 3, NOW(), NOW(), NOW()),
('Excel crashes on large files', 'Excel crashes whenever I open spreadsheets larger than 10MB.', 'IN_PROGRESS', 'LOW', 2, 7, 3, NOW(), NOW(), NULL),
('Two-factor authentication not working', 'Not receiving MFA codes on my phone, cannot log into email.', 'OPEN', 'HIGH', 5, 5, NULL, NOW(), NOW(), NULL);

-- Comments — ticket_id and user_id reference IDs from above
INSERT INTO comments (content, ticket_id, user_id, created_at, updated_at) VALUES
('I tried restarting my laptop but the issue persists.', 1, 4, NOW(), NOW()),
('Can you try forgetting the network and reconnecting?', 2, 2, NOW(), NOW()),
('License has been requested from procurement, should be ready in 2-3 days.', 2, 2, NOW(), NOW()),
('Password has been reset, please check your email for the temporary password.', 4, 3, NOW(), NOW()),
('Confirmed working now, thank you!', 4, 4, NOW(), NOW()),
('This does look like a phishing attempt, do not click any links in that email.', 5, 2, NOW(), NOW()),
('Laptop has been fully configured and is ready for pickup.', 8, 3, NOW(), NOW());


