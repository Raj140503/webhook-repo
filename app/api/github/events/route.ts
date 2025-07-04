import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'github_events'
      ) as exists
    `

    if (!tableExists[0].exists) {
      return NextResponse.json({
        success: true,
        events: [],
        message: "Database tables not initialized. Please initialize the database first.",
        needsInit: true,
      })
    }

    // Fetch GitHub events if table exists
    const events = await sql`
      SELECT * FROM github_events 
      ORDER BY timestamp DESC 
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      events: events,
      needsInit: false,
    })
  } catch (error) {
    console.error("Failed to fetch GitHub events:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const needsInit = errorMessage.includes("does not exist") || errorMessage.includes("relation")

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
        message: errorMessage,
        events: [],
        needsInit,
      },
      { status: needsInit ? 200 : 500 },
    )
  }
}
