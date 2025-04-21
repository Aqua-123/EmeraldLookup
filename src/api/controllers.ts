import { Request, Response } from "express";
import { executeQuery, getMessageStats } from "./queries.js";
import { MessageQueryParams } from "./types.js";

/**
 * Get messages with pagination and filtering
 */
export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    // Extract query parameters
    const params: MessageQueryParams = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      sort_by: (req.query.sort_by as string) || "timestamp",
      sort_order: (req.query.sort_order as "asc" | "desc") || "desc",
      event_type: (req.query.event_type as string) || "message",
      user_id: req.query.user_id
        ? parseInt(req.query.user_id as string)
        : undefined,
      username: req.query.username as string,
      room_id: req.query.room_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      search_text: req.query.search_text as string,
      include_user_details: req.query.include_user_details === "true",
    };

    // Validate parameters
    if (params.limit && (params.limit < 1 || params.limit > 200)) {
      res.status(400).json({
        error: {
          code: "INVALID_LIMIT",
          message: "Limit must be between 1 and 200",
        },
      });
      return;
    }

    // Execute query
    const { data, total } = await executeQuery(params);

    // Calculate pagination metadata
    const page = Math.floor(params.offset! / params.limit!) + 1;
    const totalPages = Math.ceil(total / params.limit!);

    // Return response with pagination metadata
    res.json({
      data,
      meta: {
        total,
        limit: params.limit,
        offset: params.offset,
        page,
        total_pages: totalPages,
        has_more: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    });
  }
}

/**
 * Get a single message by ID
 */
export async function getMessageById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        error: {
          code: "INVALID_ID",
          message: "Invalid message ID format",
        },
      });
      return;
    }

    const { data } = await executeQuery({
      limit: 1,
      offset: 0,
      _id: id,
    } as MessageQueryParams);

    if (data.length === 0) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Message not found",
        },
      });
      return;
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error fetching message by ID:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    });
  }
}

/**
 * Get message statistics
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    // Extract query parameters for filtering stats
    const params: MessageQueryParams = {
      user_id: req.query.user_id
        ? parseInt(req.query.user_id as string)
        : undefined,
      username: req.query.username as string,
      room_id: req.query.room_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
    };

    const stats = await getMessageStats(params);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching message statistics:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
    });
  }
}
