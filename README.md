# EmeraldChat Data API

This application provides a WebSocket client for EmeraldChat along with a powerful REST API to query and analyze chat data.

## Setup

1. Install dependencies:

   ```
   yarn install
   ```

2. Build the project:

   ```
   yarn build
   ```

3. Make sure MongoDB is running:
   ```
   sudo systemctl start mongod
   ```

## Running

### WebSocket Client

Run the WebSocket client to collect chat data:

```
yarn start
```

### API Server

Run the API server to query chat data:

```
yarn api
```

Or run both together:

```
START_API=true yarn start
```

## API Documentation

For detailed information about using the API, please refer to the [complete API documentation](API_DOCUMENTATION.md).

The API documentation covers:

- Available endpoints
- Query parameters
- Response formats
- Pagination
- Filtering options
- Example queries
- Performance considerations
- Best practices

## Example Queries

### Get the latest 20 messages:

```
GET /api/messages?limit=20
```

### Get messages from a specific user:

```
GET /api/messages?username=user123
```

### Search for messages containing text:

```
GET /api/messages?search_text=hello
```

### Get messages from a specific date range:

```
GET /api/messages?start_date=2023-01-01T00:00:00Z&end_date=2023-01-02T00:00:00Z
```

### Get statistics for a specific room:

```
GET /api/stats?room_id=channel97
```
