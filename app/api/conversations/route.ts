import { NextResponse } from "next/server"
import { messages } from "../webhook/route"

export async function GET() {
  try {
    // Group messages by phone number to create conversations
    const conversationMap = new Map()

    messages.forEach((message) => {
      const phoneNumber = message.isOutgoing ? message.to : message.from

      if (!conversationMap.has(phoneNumber)) {
        conversationMap.set(phoneNumber, {
          phoneNumber,
          lastMessage: message.body,
          timestamp: new Date(message.timestamp),
          unreadCount: message.isOutgoing ? 0 : 1,
        })
      } else {
        const conversation = conversationMap.get(phoneNumber)
        if (new Date(message.timestamp) > conversation.timestamp) {
          conversation.lastMessage = message.body
          conversation.timestamp = new Date(message.timestamp)
        }
        if (!message.isOutgoing) {
          conversation.unreadCount += 1
        }
      }
    })

    // Convert to array and sort by timestamp (most recent first)
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Failed to get conversations" }, { status: 500 })
  }
}
