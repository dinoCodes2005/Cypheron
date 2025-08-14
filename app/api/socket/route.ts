import { randomUUID } from "crypto";

const clients = new Map<string, WebSocket>();

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  const clientId = randomUUID();

  server.accept();
  clients.set(clientId, server);

  server.send(
    JSON.stringify({
      type: "system",
      message: "Connected to chat server",
      timestamp: new Date().toISOString(),
      clientId,
    })
  );

  broadcastUserCount();

  server.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data as string);

      if (data.type === "message") {
        const messageData = {
          type: "message",
          id: randomUUID(),
          text: data.text,
          sender: data.sender || "anonymous",
          timestamp: new Date().toISOString(),
          encrypted: true,
          clientId: data.clientId,
        };

        clients.forEach((client, id) => {
          if (id !== clientId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageData));
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  server.addEventListener("close", () => {
    clients.delete(clientId);
    broadcastUserCount();
  });

  function broadcastUserCount() {
    const countMessage = {
      type: "userCount",
      count: clients.size,
      timestamp: new Date().toISOString(),
    };

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(countMessage));
      }
    });
  }

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
