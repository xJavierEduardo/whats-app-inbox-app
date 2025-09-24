import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for messages (in production, use a database)
const messages: Array<{
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  isOutgoing: boolean
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)

    const from = params.get("From") || ""
    const to = params.get("To") || ""
    const messageBody = params.get("Body") || ""
    const messageSid = params.get("MessageSid") || ""

    // Clean phone numbers (remove whatsapp: prefix)
    const cleanFrom = from.replace("whatsapp:", "")
    const cleanTo = to.replace("whatsapp:", "")

    // Store the incoming message
    const newMessage = {
      id: messageSid,
      from: cleanFrom,
      to: cleanTo,
      body: messageBody,
      timestamp: new Date(),
      isOutgoing: false,
    }

    messages.push(newMessage)

    console.log("Received message:", newMessage)

    // Respond with TwiML (empty response is fine for WhatsApp)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Export messages for other API routes to access
export { messages }
