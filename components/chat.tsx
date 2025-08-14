"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wifi, WifiOff, Shield, Users, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "peer";
  timestamp: Date;
  encrypted: boolean;
  clientId?: string;
}

interface WebSocketMessage {
  type: "message" | "system" | "userCount";
  id?: string;
  text?: string;
  sender?: string;
  timestamp: string;
  encrypted?: boolean;
  clientId?: string;
  message?: string;
  count?: number;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [clientId, setClientId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = useCallback(() => {
    try {
      // Use WSS for production, WS for development
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/socket`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case "message":
              if (data.clientId !== clientId) {
                const message: Message = {
                  id: data.id || Date.now().toString(),
                  text: data.text || "",
                  sender: "peer",
                  timestamp: new Date(data.timestamp),
                  encrypted: data.encrypted || false,
                };
                setMessages((prev) => [...prev, message]);
              }
              break;

            case "system":
              if (data.clientId) {
                setClientId(data.clientId);
              }
              // Add system message
              const systemMessage: Message = {
                id: Date.now().toString(),
                text: data.message || "System message",
                sender: "peer",
                timestamp: new Date(data.timestamp),
                encrypted: false,
              };
              setMessages((prev) => [...prev, systemMessage]);
              break;

            case "userCount":
              setUserCount(data.count || 0);
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setIsConnected(false);
    }
  }, [clientId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      encrypted: true,
    };

    // Add to local messages immediately
    setMessages((prev) => [...prev, message]);

    // Send via WebSocket
    wsRef.current.send(
      JSON.stringify({
        type: "message",
        text: newMessage,
        sender: "user",
        clientId: clientId,
        encrypted: true,
      })
    );

    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Real-Time Messaging
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience live WebSocket-based messaging with real-time
            communication. Messages are delivered instantly to all connected
            users.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="font-medium">
                {isConnected
                  ? `Connected (${userCount} users online)`
                  : "Connecting..."}
              </span>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <Shield className="h-3 w-3" />
                <span>WebSocket</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Live Chat</span>
              </Badge>
            </div>
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
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
                    {message.sender === "user" ? "Y" : "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
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

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isConnected ? "Type your message..." : "Connecting..."
                }
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
              <Wifi className="h-3 w-3" />
              <span>
                {isConnected
                  ? `Connected via WebSocket • ${userCount} users online`
                  : "Connecting to chat server..."}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
