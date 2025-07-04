-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    headers JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);

-- Create webhook_configs table
CREATE TABLE IF NOT EXISTS webhook_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample configurations only if table is empty
INSERT INTO webhook_configs (name, url, secret, active) 
SELECT 'Generic Webhook', '/api/webhooks/generic', 'your-webhook-secret-here', true
WHERE NOT EXISTS (SELECT 1 FROM webhook_configs WHERE name = 'Generic Webhook');

INSERT INTO webhook_configs (name, url, secret, active) 
SELECT 'Test Webhook', '/api/webhooks/test', null, true
WHERE NOT EXISTS (SELECT 1 FROM webhook_configs WHERE name = 'Test Webhook');
