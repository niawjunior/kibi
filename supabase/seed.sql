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
    'Pasupol',
    'Bunsaen',
    'iiG',
    'Software Engineer',
    'psb@ii.co.th',
    '0883204253',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'TEST002',
    'Monnapat',
    'Limrattanasilp',
    'iiG',
    'Manager',
    'mnl@ii.co.th',
    '0888888888',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    NULL
  )
