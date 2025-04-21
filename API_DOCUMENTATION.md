# EmeraldChat API Documentation

This documentation provides a comprehensive guide to the EmeraldChat Data API, which allows you to query and analyze chat data collected from EmeraldChat.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [API Endpoints](#api-endpoints)
   - [Messages](#messages)
   - [Message by ID](#message-by-id)
   - [Statistics](#statistics)
4. [Query Parameters](#query-parameters)
5. [Response Format](#response-format)
6. [Pagination](#pagination)
7. [Filtering](#filtering)
8. [Sorting](#sorting)
9. [Error Handling](#error-handling)
10. [Example Queries](#example-queries)
11. [Performance Considerations](#performance-considerations)
12. [Best Practices](#best-practices)

## Overview

The EmeraldChat API provides access to chat data collected from EmeraldChat. It offers flexible querying capabilities with support for:

- Pagination
- Rich filtering
- Text search
- Sorting
- Statistics and aggregations

The API is designed to handle large volumes of data efficiently and provides a consistent response format across all endpoints.

## Getting Started

### Prerequisites

- MongoDB (v4.4+) running locally or accessible via network
- Node.js (v16+)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/emeraldlookup.git
   cd emeraldlookup
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Build the project:

   ```
   yarn build
   ```

4. Start MongoDB:

   ```
   sudo systemctl start mongod
   ```

5. Start the API server:
   ```
   yarn api
   ```

The API server will be available at `http://localhost:3000/api`.

## API Endpoints

### Messages

**Endpoint:** `GET /api/messages`

Retrieves a paginated list of messages with support for filtering and sorting.

**Examples:**

```bash
# Get the latest 50 messages (default)
curl "http://localhost:3000/api/messages"

# Get 10 most recent messages
curl "http://localhost:3000/api/messages?limit=10"

# Get messages from a specific user
curl "http://localhost:3000/api/messages?username=john123"
```

### Message by ID

**Endpoint:** `GET /api/messages/:id`

Retrieves a single message by its MongoDB ObjectId.

**Examples:**

```bash
# Get a specific message by ID
curl "http://localhost:3000/api/messages/5f8d43e1e6b5f32a74c356e1"
```

### Statistics

**Endpoint:** `GET /api/stats`

Retrieves aggregated statistics about messages, including counts by user, room, and time.

**Examples:**

```bash
# Get overall message statistics
curl "http://localhost:3000/api/stats"

# Get statistics for a specific room
curl "http://localhost:3000/api/stats?room_id=channel97"
```

## Query Parameters

The API supports the following query parameters for filtering and customization:

### Common Parameters

| Parameter    | Type   | Default     | Description                               |
| ------------ | ------ | ----------- | ----------------------------------------- |
| `limit`      | number | 50          | Maximum number of items to return (1-200) |
| `offset`     | number | 0           | Number of items to skip for pagination    |
| `sort_by`    | string | "timestamp" | Field to sort by                          |
| `sort_order` | string | "desc"      | Sort order ("asc" or "desc")              |

### Filtering Parameters

| Parameter              | Type     | Description                                           |
| ---------------------- | -------- | ----------------------------------------------------- |
| `event_type`           | string   | Filter by event type (e.g., "message", "user_joined") |
| `user_id`              | number   | Filter by user ID                                     |
| `username`             | string   | Filter by username (case insensitive)                 |
| `room_id`              | string   | Filter by room ID                                     |
| `start_date`           | ISO date | Filter events after this date                         |
| `end_date`             | ISO date | Filter events before this date                        |
| `search_text`          | string   | Search for text in message content                    |
| `include_user_details` | boolean  | Include full user details in response                 |

## Response Format

### Message Response

```json
{
  "data": [
    {
      "_id": "5f8d43e1e6b5f32a74c356e1",
      "event_type": "message",
      "timestamp": "2023-01-01T12:00:00.000Z",
      "data": {
        "type": "message",
        "identifier": "{\"channel\":\"RoomChannel\",\"room_id\":\"channel97\"}",
        "message": {
          "messages": ["Hello world!"],
          "picture": null,
          "user": {
            "id": 12345,
            "username": "user123",
            "display_name": "User 123",
            "badge": null,
            "badges": [],
            "bio": "User bio",
            "created_at": "2023-01-01T00:00:00.000Z",
            "display_picture": "https://example.com/profile.jpg",
            "flair": {
              "color": "blue"
            },
            "gender": "male",
            "gold": false,
            "has_premium_badge": false,
            "karma": 100,
            "last_logged_in_at": "2023-01-01T12:00:00.000Z",
            "master": false,
            "mod": false,
            "online": true,
            "platinum": false,
            "temp": false,
            "thumbnail_picture": null,
            "verified": true,
            "video_chats_verified": false
          }
        }
      }
    }
    // More messages...
  ],
  "meta": {
    "total": 1000,
    "limit": 50,
    "offset": 0,
    "page": 1,
    "total_pages": 20,
    "has_more": true
  }
}
```

### Statistics Response

```json
{
  "total_messages": 1500,
  "messages_per_room": {
    "channel97": 500,
    "channel42": 300,
    "channel156": 200
  },
  "messages_per_user": {
    "12345": 100,
    "67890": 75,
    "11223": 50
  },
  "active_users": [
    {
      "user_id": 12345,
      "username": "user123",
      "message_count": 100
    },
    {
      "user_id": 67890,
      "username": "user456",
      "message_count": 75
    }
  ],
  "message_frequency": [
    {
      "hour": 9,
      "count": 100
    },
    {
      "hour": 10,
      "count": 150
    },
    {
      "hour": 11,
      "count": 200
    }
  ]
}
```

### Error Response

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred",
    "details": "Error details (development mode only)"
  }
}
```

## Pagination

The API supports offset-based pagination with the following parameters:

- `limit`: Maximum number of items to return (default: 50, max: 200)
- `offset`: Number of items to skip (default: 0)

The response includes pagination metadata:

```json
"meta": {
  "total": 1000,     // Total number of matching items
  "limit": 50,       // Current limit
  "offset": 0,       // Current offset
  "page": 1,         // Current page (calculated from offset/limit)
  "total_pages": 20, // Total number of pages
  "has_more": true   // Whether there are more pages
}
```

### Calculating Pages

The current page is calculated as: `Math.floor(offset / limit) + 1`
Total pages is calculated as: `Math.ceil(total / limit)`

### Example

```bash
# Get first page (50 items)
curl "http://localhost:3000/api/messages"

# Get second page (next 50 items)
curl "http://localhost:3000/api/messages?offset=50"

# Get specific page size (20 items per page, page 3)
curl "http://localhost:3000/api/messages?limit=20&offset=40"
```

## Filtering

The API provides powerful filtering capabilities to narrow down results.

### Text Search

Use `search_text` to perform a full-text search across message content:

```bash
# Search for messages containing "hello"
curl "http://localhost:3000/api/messages?search_text=hello"
```

### Date Range Filtering

Filter messages within a specific date range:

```bash
# Get messages from January 2023
curl "http://localhost:3000/api/messages?start_date=2023-01-01T00:00:00Z&end_date=2023-01-31T23:59:59Z"
```

### User Filtering

Filter messages by user ID or username:

```bash
# Get messages from user with ID 12345
curl "http://localhost:3000/api/messages?user_id=12345"

# Get messages from user with username "john123"
curl "http://localhost:3000/api/messages?username=john123"
```

### Room Filtering

Filter messages by room ID:

```bash
# Get messages from room "channel97"
curl "http://localhost:3000/api/messages?room_id=channel97"
```

### Event Type Filtering

Filter by event type:

```bash
# Get only chat messages (not system events)
curl "http://localhost:3000/api/messages?event_type=message"

# Get user joined events
curl "http://localhost:3000/api/messages?event_type=user_joined"
```

### Combining Filters

Multiple filters can be combined for more specific queries:

```bash
# Get messages from user "john123" in room "channel97" containing "hello"
curl "http://localhost:3000/api/messages?username=john123&room_id=channel97&search_text=hello"
```

## Sorting

Control the order of results with:

- `sort_by`: Field to sort by (default: "timestamp")
- `sort_order`: Sort order ("asc" or "desc", default: "desc")

```bash
# Sort by timestamp, oldest first
curl "http://localhost:3000/api/messages?sort_order=asc"

# Sort by username
curl "http://localhost:3000/api/messages?sort_by=data.message.user.username&sort_order=asc"
```

When using `search_text`, results are also sorted by relevance score by default.

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include:

- `code`: Error code for programmatic handling
- `message`: Human-readable error message
- `details`: Additional error details (development mode only)

## Example Queries

### Get the Latest 20 Messages

```bash
curl "http://localhost:3000/api/messages?limit=20"
```

### Search for Messages from a Specific User

```bash
curl "http://localhost:3000/api/messages?username=u696b10d33230ad1c&limit=10"
```

### Find Messages Mentioning a Topic

```bash
curl "http://localhost:3000/api/messages?search_text=cryptocurrency&limit=50"
```

### Get Active Users in a Room

```bash
curl "http://localhost:3000/api/stats?room_id=channel97"
```

### Get Messages from a Specific Date Range

```bash
curl "http://localhost:3000/api/messages?start_date=2023-04-01T00:00:00Z&end_date=2023-04-15T23:59:59Z"
```

### Get All User Joined Events

```bash
curl "http://localhost:3000/api/messages?event_type=user_joined&limit=100"
```

### Get Messages with Complex Filtering

```bash
curl "http://localhost:3000/api/messages?room_id=channel97&start_date=2023-04-01T00:00:00Z&search_text=help&sort_order=asc&limit=25"
```

## Performance Considerations

### Large Result Sets

When dealing with large result sets:

- Use pagination to limit memory usage
- Avoid high `limit` values (stay below 200)
- Use filtering to narrow down results before querying

### Text Search

Text search operations are more resource-intensive:

- Add specific filters when using `search_text`
- Use pagination with text search queries
- Consider indexing specific fields for better performance

### Optimizing Performance

- Filter by indexed fields when possible (user_id, room_id, timestamp)
- Use date ranges to limit the search scope
- Leverage event_type filtering to target specific message types

## Best Practices

### Efficient Querying

1. **Start specific**: Begin with the most specific filters
2. **Use indexed fields**: Prioritize filtering on indexed fields
3. **Limit results**: Use appropriate limit values
4. **Paginate**: Always implement pagination in your UI

### Rate Limiting

The API implements basic rate limiting to prevent abuse. Be considerate with your query frequency, especially for resource-intensive operations like text search.

### Caching

Consider implementing client-side caching for:

- Statistical data that changes infrequently
- User lookup results
- Message history for inactive rooms

### Error Handling

Implement proper error handling in your client:

- Check HTTP status codes
- Parse error messages
- Implement retry logic for transient errors
- Add appropriate user feedback

---

This API documentation covers the core functionality of the EmeraldChat Data API. For additional support or feature requests, please open an issue on the GitHub repository.
