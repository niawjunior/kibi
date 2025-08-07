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
INSERT INTO users (id, ref, name, email, company, position, event_id, registered, photo_url)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'TEST001',
    'John Doe',
    'john.doe@example.com',
    'Tech Innovations',
    'Software Engineer',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'TEST002',
    'Jane Smith',
    'jane.smith@example.com',
    'Design Solutions',
    'UX Designer',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'TEST003',
    'Alex Johnson',
    'alex.johnson@example.com',
    'Data Analytics Inc',
    'Data Scientist',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'QR7X9Y2Z',
    'Sarah Williams',
    'sarah.williams@example.com',
    'Cloud Solutions',
    'DevOps Engineer',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'QR8A3B7C',
    'Michael Brown',
    'michael.brown@example.com',
    'AI Research Lab',
    'AI Researcher',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  );
