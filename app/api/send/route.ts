import { type NextRequest, NextResponse } from "next/server"
import { messages } from "../webhook/route"

const twilio = require("twilio")

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    })

    // Store the outgoing message
    const newMessage = {
      id: twilioMessage.sid,
      from: process.env.TWILIO_WHATSAPP_NUMBER || "",
      to: to,
      body: message,
      timestamp: new Date(),
      isOutgoing: true,
    }

    messages.push(newMessage)

    console.log("Sent message:", newMessage)

    return NextResponse.json({
      success: true,
      messageSid: twilioMessage.sid,
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
