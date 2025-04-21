import mongoose, { Schema, Document, Model } from "mongoose";
import {
  parseMessage,
  Message,
  PingMessage,
  ChatMessage,
  UserJoinedMessage,
  TypingMessage,
  UserLeftMessage,
  ConfirmSubscriptionMessage,
  WelcomeMessage,
} from "./parse.js";

// Define the ChatEvent document interface
interface IChatEvent extends Document {
  event_type: string;
  timestamp: Date;
  data:
    | PingMessage
    | ChatMessage
    | UserJoinedMessage
    | TypingMessage
    | UserLeftMessage
    | ConfirmSubscriptionMessage
    | WelcomeMessage;
}

// Define the main schema
const chatEventSchema = new Schema<IChatEvent>(
  {
    event_type: {
      type: String,
      required: true,
      enum: [
        "ping",
        "message",
        "user_joined",
        "typing",
        "user_left",
        "confirm_subscription",
        "welcome",
      ],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: "chat_events",
    timestamps: false,
  }
);

// Apply indexes
chatEventSchema.index({ event_type: 1 });
chatEventSchema.index({ timestamp: -1 });
chatEventSchema.index({ "data.message.user.id": 1 });
chatEventSchema.index({ "data.message.user.username": 1 });
chatEventSchema.index({ "data.identifier.room_id": 1 });
chatEventSchema.index({ "data.message.messages": "text" });
chatEventSchema.index({ "data.identifier.room_id": 1, timestamp: -1 });
chatEventSchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { event_type: "typing" },
  }
);

// Create the Mongoose model
const ChatEvent: Model<IChatEvent> = mongoose.model<IChatEvent>(
  "ChatEvent",
  chatEventSchema
);

// Function to insert a chat event
async function insertChatEvent(rawMessage: any): Promise<IChatEvent> {
  try {
    const parsed: Message = parseMessage(rawMessage);
    let timestamp = new Date();

    // Set timestamp based on event type
    switch (parsed.type) {
      case "message":
      case "user_joined":
      case "user_left":
        timestamp = new Date(parsed.message.user.last_logged_in_at);
        break;
      case "typing":
      case "ping":
      case "confirm_subscription":
      case "welcome":
        timestamp = new Date();
        break;
    }

    const event = new ChatEvent({
      event_type: parsed.type,
      timestamp,
      data: parsed,
    });

    return await event.save();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error inserting chat event:", errorMessage);
    throw new Error(`Failed to insert chat event: ${errorMessage}`);
  }
}

// Query functions
async function findMessagesByUsername(
  username: string,
  limit: number = 100
): Promise<IChatEvent[]> {
  return await ChatEvent.find({
    event_type: "message",
    "data.message.user.username": username,
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

async function findMessagesByUserId(
  user_id: number,
  limit: number = 100
): Promise<IChatEvent[]> {
  return await ChatEvent.find({
    event_type: "message",
    "data.message.user.id": user_id,
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

async function findMessagesBetweenTimestamps(
  start: Date,
  end: Date,
  room_id?: string,
  limit: number = 100
): Promise<IChatEvent[]> {
  const query: any = {
    event_type: "message",
    timestamp: { $gte: start, $lte: end },
  };
  if (room_id) {
    query["data.identifier.room_id"] = room_id;
  }
  return await ChatEvent.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

async function findMessagesByRegex(
  pattern: string,
  room_id?: string,
  limit: number = 100
): Promise<IChatEvent[]> {
  const query: any = {
    event_type: "message",
    $text: { $search: pattern },
  };
  if (room_id) {
    query["data.identifier.room_id"] = room_id;
  }
  return await ChatEvent.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

export {
  ChatEvent,
  IChatEvent,
  insertChatEvent,
  findMessagesByUsername,
  findMessagesByUserId,
  findMessagesBetweenTimestamps,
  findMessagesByRegex,
};
