import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`

    // Check if github_events table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'github_events'
      ) as table_exists
    `

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "Raj Patil GitHub Webhook Dashboard",
        database: {
          connected: true,
          github_events_table: tableCheck[0].table_exists,
        },
        environment: {
          database_url_configured: !!process.env.DATABASE_URL,
          webhook_secret_configured: !!process.env.WEBHOOK_SECRET,
        },
      },
      {
        headers: {
          "X-Powered-By": "Raj Patil GitHub Webhook Dashboard",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "Raj Patil GitHub Webhook Dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
        database: {
          connected: false,
        },
      },
      {
        status: 500,
        headers: {
          "X-Powered-By": "Raj Patil GitHub Webhook Dashboard",
        },
      },
    )
  }
}
