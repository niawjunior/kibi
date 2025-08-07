-- Insert a mock event
INSERT INTO events (id, name, description, start_date, end_date, location)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'AI Conference 2025',
  'Annual conference for AI researchers and practitioners',
  '2025-09-15 09:00:00+00',
  '2025-09-17 18:00:00+00',
  'Tech Convention Center'
);

-- Insert mock users for the event
INSERT INTO users (id, ref, name, last_name, company, position, email, phone, event_id, registered, photo_url)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'TEST001',
    'John',
    'Doe',
    'Tech Innovations',
    'Software Engineer',
    'john.doe@example.com',
    '+1-555-123-4567',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'TEST002',
    'Jane',
    'Smith',
    'Design Solutions',
    'UX Designer',
    'jane.smith@example.com',
    '+1-555-234-5678',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'TEST003',
    'Alex',
    'Johnson',
    'Data Analytics Inc',
    'Data Scientist',
    'alex.johnson@example.com',
    '+1-555-345-6789',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'QR7X9Y2Z',
    'Sarah',
    'Williams',
    'Cloud Solutions',
    'DevOps Engineer',
    'sarah.williams@example.com',
    '+1-555-456-7890',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'QR8A3B7C',
    'Michael',
    'Brown',
    'AI Research Lab',
    'AI Researcher',
    'michael.brown@example.com',
    '+1-555-567-8901',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  );
