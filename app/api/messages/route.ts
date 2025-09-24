import { NextResponse } from "next/server"
import { messages } from "../webhook/route"

export async function GET() {
  try {
    // Convert timestamps to proper Date objects for serialization
    const serializedMessages = messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))

    return NextResponse.json(serializedMessages)
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}
