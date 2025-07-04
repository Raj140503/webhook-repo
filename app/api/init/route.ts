import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("🚀 Initializing GitHub webhook database tables...")

    // Create github_events table (matching the MongoDB schema requirements)
    await sql`
      CREATE TABLE IF NOT EXISTS github_events (
        id VARCHAR(255) PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        author VARCHAR(255) NOT NULL,
        from_branch VARCHAR(255),
        to_branch VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        request_id VARCHAR(255) NOT NULL
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_github_events_timestamp ON github_events(timestamp DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_github_events_action ON github_events(action)`
    await sql`CREATE INDEX IF NOT EXISTS idx_github_events_author ON github_events(author)`

    // Also create the original webhook_events table for compatibility
    await sql`
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
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type)`

    console.log("✅ GitHub webhook database tables initialized successfully")

    return NextResponse.json({
      success: true,
      message: "GitHub webhook database tables initialized successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GitHub webhook database initialization endpoint",
    usage: "Send POST request to initialize database tables",
    timestamp: new Date().toISOString(),
  })
}
