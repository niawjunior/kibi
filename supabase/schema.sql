-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for event attendees
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  event_id UUID REFERENCES events(id),
  registered BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by ref
CREATE INDEX idx_users_ref ON users(ref);

-- Create index for filtering users by event
CREATE INDEX idx_users_event_id ON users(event_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Allow anyone with the anon key to read events
CREATE POLICY "Allow anonymous read access to events" 
  ON events FOR SELECT 
  USING (true);

-- Allow anyone with the anon key to read users
CREATE POLICY "Allow anonymous read access to users" 
  ON users FOR SELECT 
  USING (true);

-- Allow anyone with the anon key to update users (for registration)
CREATE POLICY "Allow anonymous update access to users" 
  ON users FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp on record update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
