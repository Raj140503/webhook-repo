import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

// GitHub webhook signature verification
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false

  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
    const providedSignature = signature.replace("sha256=", "")

    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(providedSignature, "hex"))
  } catch (error) {
    console.error("GitHub signature verification error:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // GitHub webhook signature verification
    const signature = headers["x-hub-signature-256"]
    const webhookSecret = process.env.WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const isValid = verifyGitHubSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.log("❌ Invalid GitHub webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)
    const eventType = headers["x-github-event"]
    const deliveryId = headers["x-github-delivery"]

    console.log(`📨 Received GitHub event: ${eventType}`)

    // Process different GitHub events
    const eventData = await processGitHubEvent(eventType, payload, deliveryId)

    if (eventData) {
      // Store in database
      try {
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'github_events'
          ) as exists
        `

        if (tableExists[0].exists) {
          await sql`
            INSERT INTO github_events (
              id, action, author, from_branch, to_branch, timestamp, request_id
            ) VALUES (
              ${eventData.id}, ${eventData.action}, ${eventData.author}, 
              ${eventData.from_branch}, ${eventData.to_branch}, 
              ${eventData.timestamp}, ${eventData.request_id}
            )
          `
          console.log(`✅ GitHub event stored: ${eventData.action} by ${eventData.author}`)
        } else {
          console.log(`⚠️ Database not initialized, event processed but not stored`)
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "GitHub webhook processed successfully",
      eventType,
      deliveryId,
    })
  } catch (error) {
    console.error("❌ GitHub webhook processing error:", error)
    return NextResponse.json(
      {
        error: "GitHub webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function processGitHubEvent(eventType: string, payload: any, deliveryId: string) {
  const eventId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  switch (eventType) {
    case "push":
      // Handle push events
      const ref = payload.ref || ""
      const branch = ref.replace("refs/heads/", "")
      const author = payload.pusher?.name || payload.head_commit?.author?.name || "Unknown"

      return {
        id: eventId,
        action: "push" as const,
        author,
        from_branch: null,
        to_branch: branch,
        timestamp,
        request_id: deliveryId,
      }

    case "pull_request":
      // Handle pull request events
      if (payload.action === "opened" || payload.action === "synchronize") {
        const author = payload.pull_request?.user?.login || "Unknown"
        const fromBranch = payload.pull_request?.head?.ref || "Unknown"
        const toBranch = payload.pull_request?.base?.ref || "Unknown"

        return {
          id: eventId,
          action: "pull_request" as const,
          author,
          from_branch: fromBranch,
          to_branch: toBranch,
          timestamp,
          request_id: deliveryId,
        }
      }

      // Handle merge events (when PR is closed and merged)
      if (payload.action === "closed" && payload.pull_request?.merged) {
        const author = payload.pull_request?.merged_by?.login || payload.pull_request?.user?.login || "Unknown"
        const fromBranch = payload.pull_request?.head?.ref || "Unknown"
        const toBranch = payload.pull_request?.base?.ref || "Unknown"

        return {
          id: eventId,
          action: "merge" as const,
          author,
          from_branch: fromBranch,
          to_branch: toBranch,
          timestamp,
          request_id: deliveryId,
        }
      }
      break

    default:
      console.log(`Unhandled GitHub event type: ${eventType}`)
      return null
  }

  return null
}

export async function GET() {
  return NextResponse.json({
    message: "GitHub webhook endpoint is active",
    timestamp: new Date().toISOString(),
    methods: ["POST"],
    status: "healthy",
    supportedEvents: ["push", "pull_request"],
  })
}
