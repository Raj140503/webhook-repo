-- Create GitHub events table matching the MongoDB schema requirements
CREATE TABLE IF NOT EXISTS github_events (
    id VARCHAR(255) PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    author VARCHAR(255) NOT NULL,
    from_branch VARCHAR(255),
    to_branch VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    request_id VARCHAR(255) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_github_events_timestamp ON github_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_github_events_action ON github_events(action);
CREATE INDEX IF NOT EXISTS idx_github_events_author ON github_events(author);

-- Insert some sample data for testing
INSERT INTO github_events (id, action, author, from_branch, to_branch, timestamp, request_id) 
SELECT 
    'sample-1', 
    'push', 
    'Travis', 
    NULL, 
    'staging', 
    '2024-01-01 21:30:00'::timestamp, 
    'sample-delivery-1'
WHERE NOT EXISTS (SELECT 1 FROM github_events WHERE id = 'sample-1');

INSERT INTO github_events (id, action, author, from_branch, to_branch, timestamp, request_id) 
SELECT 
    'sample-2', 
    'pull_request', 
    'Travis', 
    'staging', 
    'master', 
    '2024-01-01 09:00:00'::timestamp, 
    'sample-delivery-2'
WHERE NOT EXISTS (SELECT 1 FROM github_events WHERE id = 'sample-2');

INSERT INTO github_events (id, action, author, from_branch, to_branch, timestamp, request_id) 
SELECT 
    'sample-3', 
    'merge', 
    'Travis', 
    'dev', 
    'master', 
    '2024-01-02 12:00:00'::timestamp, 
    'sample-delivery-3'
WHERE NOT EXISTS (SELECT 1 FROM github_events WHERE id = 'sample-3');
