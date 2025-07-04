import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    const eventId = crypto.randomUUID()
    const eventType = "test.event"

    const payload = {
      ...body,
      test: true,
      eventId,
      timestamp: new Date().toISOString(),
    }

    await sql`
      INSERT INTO webhook_events (
        id, event_type, payload, headers, status, created_at, processed_at
      ) VALUES (
        ${eventId}, ${eventType}, ${JSON.stringify(payload)}, 
        ${JSON.stringify(headers)}, 'success', NOW(), NOW()
      )
    `

    console.log(`✅ Test webhook created: ${eventId}`)

    return NextResponse.json({
      success: true,
      eventId,
      eventType,
      message: "Test webhook event created successfully",
    })
  } catch (error) {
    console.error("❌ Test webhook error:", error)
    return NextResponse.json({ error: "Failed to create test webhook" }, { status: 500 })
  }
}
