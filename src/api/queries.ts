import { FilterQuery, SortOrder } from "mongoose";
import { IChatEvent, ChatEvent } from "../messages/db.js";
import { MessageQueryParams } from "./types.js";

/**
 * Builds a MongoDB query object based on provided parameters
 */
export function buildMessageQuery(
  params: MessageQueryParams
): FilterQuery<IChatEvent> {
  const query: FilterQuery<IChatEvent> = {};

  // Filter by ID if provided
  if (params._id) {
    query._id = params._id;
  }

  // Filter by event type
  if (params.event_type) {
    if (Array.isArray(params.event_type)) {
      query.event_type = { $in: params.event_type };
    } else {
      query.event_type = params.event_type;
    }
  }

  // Filter by user ID
  if (params.user_id) {
    query["data.message.user.id"] = params.user_id;
  }

  // Filter by username (case insensitive)
  if (params.username) {
    query["data.message.user.username"] = {
      $regex: new RegExp(params.username, "i"),
    };
  }

  // Filter by room ID
  if (params.room_id) {
    query["data.identifier.room_id"] = params.room_id;
  }

  // Filter by date range
  if (params.start_date || params.end_date) {
    query.timestamp = {};

    if (params.start_date) {
      query.timestamp.$gte = new Date(params.start_date);
    }

    if (params.end_date) {
      query.timestamp.$lte = new Date(params.end_date);
    }
  }

  // Text search if provided
  if (params.search_text) {
    query.$text = { $search: params.search_text };
  }

  return query;
}

/**
 * Executes a query with pagination and returns results
 */
export async function executeQuery(
  params: MessageQueryParams
): Promise<{ data: IChatEvent[]; total: number }> {
  const query = buildMessageQuery(params);
  const limit = params.limit || 50;
  const offset = params.offset || 0;
  const sortField = params.sort_by || "timestamp";
  const sortOrder: SortOrder = params.sort_order === "asc" ? 1 : -1;

  // Create sort object
  const sort: Record<string, SortOrder | { $meta: string }> = {};
  sort[sortField] = sortOrder;

  // If using text search, add text score to sort
  if (params.search_text) {
    sort.score = { $meta: "textScore" };
  }

  // Execute query with pagination
  const data = await ChatEvent.find(query)
    .sort(sort as any)
    .skip(offset)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await ChatEvent.countDocuments(query);

  return { data, total };
}

/**
 * Get message statistics
 */
export async function getMessageStats(
  params: MessageQueryParams = {}
): Promise<any> {
  const query = buildMessageQuery(params);

  // Apply event_type filter for messages only if not already specified
  if (!params.event_type) {
    query.event_type = "message";
  }

  // Pipeline for aggregation
  const pipeline = [
    { $match: query },
    {
      $facet: {
        // Total message count
        totalCount: [{ $count: "count" }],

        // Messages per room
        roomStats: [
          {
            $group: {
              _id: "$data.identifier.room_id",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ],

        // Messages per user
        userStats: [
          {
            $group: {
              _id: "$data.message.user.id",
              username: { $first: "$data.message.user.username" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ],

        // Message frequency by hour
        hourlyStats: [
          {
            $group: {
              _id: { $hour: "$timestamp" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ] as any[];

  const result = await ChatEvent.aggregate(pipeline);

  // Transform the results to a more friendly format
  const stats = {
    total_messages: result[0].totalCount[0]?.count || 0,
    messages_per_room: Object.fromEntries(
      result[0].roomStats.map((item: any) => [item._id, item.count])
    ),
    messages_per_user: Object.fromEntries(
      result[0].userStats.map((item: any) => [item._id, item.count])
    ),
    active_users: result[0].userStats.map((item: any) => ({
      user_id: item._id,
      username: item.username,
      message_count: item.count,
    })),
    message_frequency: result[0].hourlyStats.map((item: any) => ({
      hour: item._id,
      count: item.count,
    })),
  };

  return stats;
}
