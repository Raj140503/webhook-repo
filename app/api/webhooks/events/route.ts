import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'webhook_events'
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

    // Fetch events if table exists
    const events = await sql`
      SELECT * FROM webhook_events 
      ORDER BY created_at DESC 
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
        ...event,
        payload: typeof event.payload === "string" ? JSON.parse(event.payload) : event.payload,
        headers: typeof event.headers === "string" ? JSON.parse(event.headers) : event.headers,
      })),
      needsInit: false,
    })
  } catch (error) {
    console.error("Failed to fetch webhook events:", error)

    // Check if it's a table doesn't exist error
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
