-- Create table
CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  user_id UUID,
  isbooked BOOLEAN DEFAULT FALSE
);

-- Insert initial seats
INSERT INTO seats (isbooked)
SELECT FALSE FROM generate_series(1, 40);
