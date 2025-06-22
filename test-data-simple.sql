-- Complete test data for similarity search (with all required fields)
-- Run this in your Supabase SQL Editor

INSERT INTO ideas (title, description, category, status, priority, user_id) VALUES 
('AR Fidget Spinner App', 'An augmented reality fidget spinner app that lets you spin virtual fidget spinners in AR space. Perfect for stress relief and focus enhancement.', 'AR/VR', 'active', 'medium', (SELECT id FROM auth.users LIMIT 1)),
('Virtual Stress Ball Game', 'A mobile app that provides virtual stress relief tools including fidget toys, stress balls, and calming games.', 'Health & Wellness', 'active', 'medium', (SELECT id FROM auth.users LIMIT 1)),
('AR Gaming Platform Pro', 'Augmented reality platform for creating and playing immersive AR games using your smartphone camera.', 'AR/VR', 'active', 'high', (SELECT id FROM auth.users LIMIT 1)),
('Fidget Focus Helper', 'Digital fidget tools designed to help people with ADHD and anxiety focus better during work or study sessions.', 'Productivity', 'active', 'medium', (SELECT id FROM auth.users LIMIT 1)),
('AR Art Creator Studio', 'Create and share augmented reality art installations that others can view and interact with in real space.', 'AR/VR', 'active', 'low', (SELECT id FROM auth.users LIMIT 1)),
('Smart AI Writing Tool', 'An intelligent writing companion that helps you write better content using advanced AI technology.', 'AI/ML', 'active', 'high', (SELECT id FROM auth.users LIMIT 1)),
('Social Media Auto Scheduler', 'Automate your social media posting across multiple platforms with intelligent scheduling and content optimization.', 'Social Media', 'active', 'medium', (SELECT id FROM auth.users LIMIT 1)),
('Website Builder Ultimate', 'Drag-and-drop website builder with AI-powered design suggestions and automatic mobile optimization.', 'Web Development', 'active', 'high', (SELECT id FROM auth.users LIMIT 1)),
('E-commerce Analytics Pro', 'Advanced analytics dashboard for e-commerce businesses to track sales, customer behavior, and inventory.', 'E-commerce', 'active', 'medium', (SELECT id FROM auth.users LIMIT 1)),
('Task Management with AI', 'Smart task management app that uses AI to prioritize your work and optimize your daily schedule.', 'Productivity', 'active', 'high', (SELECT id FROM auth.users LIMIT 1)); 