import WebSocket from "ws";
import { config, getWsUrl } from "./utils.js";
import { insertChatEvent } from "./messages/db.js";

// Channel subscription data

const channels: { [key: string]: string } = {
  "48": "ice squad ❄️",
  "56": "noodle squad 🍜 ",
  "33": "roleplaying",
  "39": "moon squad 🌑",
  "38": "sun squad ☀️",
  "40": "conspiracy squad 👽",
  "34": "VIP ⭐",
  "51": "banana squad 🍌",
  "58": "sushi squad 🍣",
  "57": "pizza squad 🍕",
  "41": "film squad 🍿",
  "54": "dragon squad 🐉️",
  "37": "pie squad 🥧",
  "53": "magic squad 🔮️",
  "43": "cake squad 🍰",
  "42": "love squad 💘",
  "49": "strawberry squad 🍓",
  "55": "royal squad 👑",
  "59": "bomb squad 💣",
  "44": "earth squad 🌎",
  "46": "water squad 💧",
  "36": "brain squad 🧠",
  "60": "owl squad 🦉",
  "52": "cosmic squad 🌌",
  "32": "general",
  "50": "apple squad 🍎",
  "47": "lightning squad ⚡",
  "35": "air squad 🌪️",
  "45": "fire squad 🔥",
};

const connectJson = {
  command: "subscribe",
  identifier: '{"channel":"RoomChannel","room_id":"channel97"}',
};

const createConnectJson = (channelNumber: string) => ({
  command: "subscribe",
  identifier: `{"channel":"RoomChannel","room_id":"channel${channelNumber}"}`,
});
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
    // Subscribe to all channels
    Object.keys(channels).forEach((channelNumber) => {
      const channelJson = createConnectJson(channelNumber);
      ws.send(JSON.stringify(channelJson));
      console.log(`Subscribed to channel: ${channels[channelNumber]}`);
    });
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
