"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, MoreVertical } from "lucide-react"

interface Message {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  isOutgoing: boolean
}

interface Conversation {
  phoneNumber: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
}

export default function WhatsAppInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations and messages on component mount
  useEffect(() => {
    loadConversations()
    loadMessages()

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages()
      loadConversations()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedConversation,
          message: newMessage,
        }),
      })

      if (response.ok) {
        const sentMessage: Message = {
          id: Date.now().toString(),
          from: "me",
          to: selectedConversation,
          body: newMessage,
          timestamp: new Date(),
          isOutgoing: true,
        }

        setMessages((prev) => [...prev, sentMessage])
        setNewMessage("")
        loadConversations() // Refresh conversations to update last message
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return formatTime(date)
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    } else {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(date)
    }
  }

  const getConversationMessages = (phoneNumber: string) => {
    return messages
      .filter((msg) => msg.from === phoneNumber || msg.to === phoneNumber)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  const getInitials = (phoneNumber: string) => {
    return phoneNumber.slice(-2).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-sidebar flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-sidebar-foreground">WhatsApp Inbox</h1>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No hay conversaciones aún</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.phoneNumber}
                className={`p-4 border-b border-border cursor-pointer hover:bg-sidebar-hover transition-colors ${
                  selectedConversation === conversation.phoneNumber ? "bg-sidebar-active" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.phoneNumber)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(conversation.phoneNumber)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sidebar-foreground truncate">{conversation.phoneNumber}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(conversation.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(selectedConversation)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-medium text-card-foreground">{selectedConversation}</h2>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {getConversationMessages(selectedConversation).map((message) => (
                  <div key={message.id} className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOutgoing
                          ? "bg-[var(--color-message-sent)] text-[var(--color-message-sent-foreground)]"
                          : "bg-[var(--color-message-received)] text-[var(--color-message-received-foreground)] border border-border"
                      }`}
                    >
                      <p className="text-sm">{message.body}</p>
                      <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 opacity-20">
                <svg viewBox="0 0 303 172" className="w-full h-full">
                  <defs>
                    <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity=".05" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity=".1" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#a)"
                    d="M229.565 160.229c-6.429-6.429-6.429-16.846 0-23.275l15.137-15.137c6.429-6.429 16.846-6.429 23.275 0l15.137 15.137c6.429 6.429 6.429 16.846 0 23.275l-15.137 15.137c-6.429 6.429-16.846 6.429-23.275 0l-15.137-15.137z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-muted-foreground mb-2">WhatsApp Inbox</h3>
              <p className="text-muted-foreground">Selecciona una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
