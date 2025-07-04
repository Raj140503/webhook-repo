import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

// Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false

  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
    const providedSignature = signature.replace("sha256=", "")

    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(providedSignature, "hex"))
  } catch (error) {
    console.error("Signature verification error:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Get webhook signature from headers
    const signature = headers["x-webhook-signature"] || headers["x-hub-signature-256"]
    const webhookSecret = process.env.WEBHOOK_SECRET

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.log("❌ Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      payload = { raw: body }
    }

    // Determine event type
    const eventType = payload.type || payload.event_type || payload.event || "unknown"
    const eventId = crypto.randomUUID()

    // Try to store webhook event in database
    try {
      // Check if table exists first
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'webhook_events'
        ) as exists
      `

      if (tableExists[0].exists) {
        await sql`
          INSERT INTO webhook_events (
            id, event_type, payload, headers, status, created_at
          ) VALUES (
            ${eventId}, ${eventType}, ${JSON.stringify(payload)}, 
            ${JSON.stringify(headers)}, 'success', NOW()
          )
        `
        console.log(`✅ Webhook stored in database: ${eventType} (${eventId})`)
      } else {
        console.log(`⚠️ Database not initialized, webhook processed but not stored: ${eventType} (${eventId})`)
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      // Continue processing even if DB operation fails
    }

    console.log(`✅ Webhook processed: ${eventType} (${eventId})`)

    // Process specific event types
    await processWebhookEvent(eventType, payload)

    return NextResponse.json({
      success: true,
      eventId,
      eventType,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function processWebhookEvent(eventType: string, payload: any) {
  try {
    // Add your custom event processing logic here
    switch (eventType) {
      case "user.created":
        console.log("Processing user creation:", payload.user?.email)
        break

      case "payment.completed":
        console.log("Processing payment:", payload.payment?.id)
        break

      case "order.created":
        console.log("Processing order:", payload.order?.id)
        break

      case "test.event":
        console.log("Processing test event:", payload)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }
  } catch (error) {
    console.error(`Error processing event ${eventType}:`, error)
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    methods: ["POST"],
    status: "healthy",
  })
}
