-- Test data for similarity search
-- Run this to add sample ideas to test the search functionality

INSERT INTO ideas (title, description, category, user_id) VALUES 
('AR Fidget Spinner', 'An augmented reality fidget spinner app that lets you spin virtual fidget spinners in AR space. Perfect for stress relief and focus enhancement.', 'AR/VR', (SELECT id FROM auth.users LIMIT 1)),
('Virtual Stress Ball', 'A mobile app that provides virtual stress relief tools including fidget toys, stress balls, and calming games.', 'Health & Wellness', (SELECT id FROM auth.users LIMIT 1)),
('AR Gaming Platform', 'Augmented reality platform for creating and playing immersive AR games using your smartphone camera.', 'AR/VR', (SELECT id FROM auth.users LIMIT 1)),
('Fidget Focus App', 'Digital fidget tools designed to help people with ADHD and anxiety focus better during work or study sessions.', 'Productivity', (SELECT id FROM auth.users LIMIT 1)),
('AR Art Creator', 'Create and share augmented reality art installations that others can view and interact with in real space.', 'AR/VR', (SELECT id FROM auth.users LIMIT 1)),
('AI Writing Assistant', 'An intelligent writing companion that helps you write better content using advanced AI technology.', 'AI/ML', (SELECT id FROM auth.users LIMIT 1)),
('Social Media Scheduler', 'Automate your social media posting across multiple platforms with intelligent scheduling and content optimization.', 'Social Media', (SELECT id FROM auth.users LIMIT 1)),
('Website Builder Pro', 'Drag-and-drop website builder with AI-powered design suggestions and automatic mobile optimization.', 'Web Development', (SELECT id FROM auth.users LIMIT 1)),
('E-commerce Analytics', 'Advanced analytics dashboard for e-commerce businesses to track sales, customer behavior, and inventory.', 'E-commerce', (SELECT id FROM auth.users LIMIT 1)),
('Task Management AI', 'Smart task management app that uses AI to prioritize your work and optimize your daily schedule.', 'Productivity', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (title) DO NOTHING;

-- Test the search
-- You can now search for:
-- "AR fidget spinner" - should find the AR Fidget Spinner and AR Gaming Platform
-- "AI writing" - should find AI Writing Assistant and Task Management AI  
-- "social media" - should find Social Media Scheduler
-- "website builder" - should find Website Builder Pro 