import { Message, Identifier, User } from "./types.js";

/**
 * Parses raw message data into typed message objects
 */
export function parseMessage(rawMessage: any): Message {
  // Handle welcome message
  if (rawMessage.type === "welcome") {
    return { type: "welcome" };
  }

  // Handle ping message
  if (rawMessage.type === "ping" && typeof rawMessage.message === "number") {
    return { type: "ping", message: rawMessage.message };
  }

  // Handle confirm_subscription message
  if (rawMessage.type === "confirm_subscription" && rawMessage.identifier) {
    return { type: "confirm_subscription", identifier: rawMessage.identifier };
  }

  // Parse identifier for messages with identifier and message fields
  if (rawMessage.identifier && rawMessage.message) {
    // Parse the identifier string
    let parsedIdentifier: Identifier;
    try {
      parsedIdentifier = JSON.parse(rawMessage.identifier);
      if (!parsedIdentifier.channel || !parsedIdentifier.room_id) {
        throw new Error("Invalid identifier structure");
      }
    } catch (e: unknown) {
      throw new Error(
        "Failed to parse identifier: " +
          (e instanceof Error ? e.message : String(e))
      );
    }

    // Handle chat message
    if (Array.isArray(rawMessage.message.messages) && rawMessage.message.user) {
      return {
        type: "message",
        identifier: rawMessage.identifier,
        message: {
          messages: rawMessage.message.messages,
          picture: rawMessage.message.picture,
          user: rawMessage.message.user as User,
        },
      };
    }

    // Handle user joined
    if (rawMessage.message.user && rawMessage.message.user_connected === true) {
      return {
        type: "user_joined",
        identifier: rawMessage.identifier,
        message: {
          user: rawMessage.message.user as User,
          user_connected: true,
        },
      };
    }

    // Handle typing
    if (rawMessage.message.typing === true && rawMessage.message.user) {
      return {
        type: "typing",
        identifier: rawMessage.identifier,
        message: {
          typing: true,
          user: rawMessage.message.user as User,
        },
      };
    }

    // Handle user left
    if (
      rawMessage.message.user &&
      rawMessage.message.user_disconnected === true
    ) {
      return {
        type: "user_left",
        identifier: rawMessage.identifier,
        message: {
          user: rawMessage.message.user as User,
          user_disconnected: true,
        },
      };
    }
  }

  throw new Error("Unknown or malformed message type");
}
