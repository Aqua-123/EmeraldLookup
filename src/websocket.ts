import WebSocket from "ws";
import { config, getWsUrl } from "./utils.js";
import { insertChatEvent } from "./messages/db.js";

// Channel subscription data
const connectJson = {
  command: "subscribe",
  identifier: '{"channel":"RoomChannel","room_id":"channel97"}',
};

export async function listenToMessages(): Promise<void> {
  const wsUrl = await getWsUrl();
  if (!wsUrl) {
    console.error("Failed to get WebSocket URL");
    return;
  }

  console.log(`Connecting to WebSocket: ${wsUrl}`);

  // Create WebSocket connection
  const ws = new WebSocket(wsUrl, {
    headers: {
      Cookie: config.main_cookie,
      Origin: config.origin,
    },
    origin: config.origin,
  });

  // Event handlers
  ws.on("open", () => {
    console.log("Connected to WebSocket");
    // Subscribe to the channel
    ws.send(JSON.stringify(connectJson));
  });

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const message = data.toString();
      const result = JSON.parse(message);
      insertChatEvent(result);
      // Process message here
      // You can add your message handling logic
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", (code, reason) => {
    console.log(`WebSocket closed with code ${code}, reason: ${reason}`);
    // Attempt to reconnect after a delay
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(() => {
      listenToMessages().catch((err) => {
        console.error("Failed to reconnect:", err);
      });
    }, 5000);
  });

  // Keep the process running
  process.on("SIGINT", () => {
    console.log("Closing WebSocket connection...");
    ws.close();
    process.exit(0);
  });
}
