// Define common interfaces for shared structures
export interface Flair {
  color: string;
}

export interface User {
  badge: null | string;
  badges: string[];
  bio: string;
  created_at: string;
  display_name: string;
  display_picture: string;
  flair: Flair;
  gender: string;
  gold: boolean;
  has_premium_badge: boolean;
  id: number;
  interests: string[];
  karma: number;
  last_logged_in_at: string;
  master: boolean;
  mod: boolean;
  online: boolean;
  platinum: boolean;
  temp: boolean;
  thumbnail_picture: string | null;
  username: string;
  verified: boolean;
  video_chats_verified: boolean;
}

export interface Identifier {
  channel: string;
  room_id: string;
}

// Define specific message types
export interface PingMessage {
  type: "ping";
  message: number;
}

export interface ChatMessage {
  type: "message";
  identifier: string; // Stringified Identifier
  message: {
    messages: string[];
    picture: null | string;
    user: User;
  };
}

export interface UserJoinedMessage {
  type: "user_joined";
  identifier: string;
  message: {
    user: User;
    user_connected: true;
  };
}

export interface TypingMessage {
  type: "typing";
  identifier: string;
  message: {
    typing: true;
    user: User;
  };
}

export interface UserLeftMessage {
  type: "user_left";
  identifier: string;
  message: {
    user: User;
    user_disconnected: true;
  };
}

export interface ConfirmSubscriptionMessage {
  type: "confirm_subscription";
  identifier: string;
}

export interface WelcomeMessage {
  type: "welcome";
}

// Union type for all possible messages
export type Message =
  | PingMessage
  | ChatMessage
  | UserJoinedMessage
  | TypingMessage
  | UserLeftMessage
  | ConfirmSubscriptionMessage
  | WelcomeMessage;
