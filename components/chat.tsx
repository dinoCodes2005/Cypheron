"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, Shield, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  text: string
  sender: "user" | "peer"
  timestamp: Date
  encrypted: boolean
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! This is a demo of encrypted messaging.",
      sender: "peer",
      timestamp: new Date(Date.now() - 300000),
      encrypted: true,
    },
    {
      id: "2",
      text: "All messages are encrypted with AES-256!",
      sender: "user",
      timestamp: new Date(Date.now() - 240000),
      encrypted: true,
    },
    {
      id: "3",
      text: "And they never touch our servers - pure P2P!",
      sender: "peer",
      timestamp: new Date(Date.now() - 180000),
      encrypted: true,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isConnected, setIsConnected] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      encrypted: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate peer response
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const responses = [
          "Message received and decrypted!",
          "Your message is secure 🔒",
          "End-to-end encryption working perfectly!",
          "No servers can read this conversation!",
        ]
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "peer",
          timestamp: new Date(),
          encrypted: true,
        }
        setMessages((prev) => [...prev, response])
      }, 1500)
    }, 500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Encrypted Messaging</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience secure, peer-to-peer messaging with end-to-end encryption. Your conversations are private and
            never stored on servers.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="font-medium">{isConnected ? "Connected to peer" : "Disconnected"}</span>
              {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>AES-256</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>P2P</span>
              </Badge>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }
                  >
                    {message.sender === "user" ? "Y" : "P"}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-xs lg:max-w-md ${message.sender === "user" ? "text-right" : ""}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.encrypted && <Shield className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">P</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your encrypted message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Messages are encrypted end-to-end and never stored on servers</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
