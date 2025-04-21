import { IChatEvent } from "../messages/db.js";

// Base query params interface
export interface BaseQueryParams {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Specific query params for different endpoints
export interface MessageQueryParams extends BaseQueryParams {
  _id?: string;
  event_type?: string | string[];
  user_id?: number;
  username?: string;
  room_id?: string;
  start_date?: string;
  end_date?: string;
  search_text?: string;
  include_user_details?: boolean;
}

// Response interfaces
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_more: boolean;
  };
}

// API response for messages
export type MessageResponse = PaginatedResponse<IChatEvent>;

// Stats interfaces
export interface MessageStats {
  total_messages: number;
  messages_per_room: Record<string, number>;
  messages_per_user: Record<string, number>;
  active_users: {
    user_id: number;
    username: string;
    message_count: number;
  }[];
  message_frequency: {
    hour: number;
    count: number;
  }[];
}

// Error response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
