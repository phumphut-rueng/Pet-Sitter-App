# Pet Sitter Socket.IO Server

Standalone Socket.IO server for Pet Sitter App chat functionality.

## Features

- Real-time messaging
- User online/offline status
- Unread message count
- Chat list updates
- CORS support for Vercel deployment

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Required environment variables:

- `PORT`: Server port (default: 4000)
- `SOCKET_IO_CORS_ORIGIN`: Comma-separated list of allowed origins

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

### Testing

Visit `http://localhost:4000/health` to check if the server is running.

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `PORT`: Railway will set this automatically
   - `SOCKET_IO_CORS_ORIGIN`: Your Vercel app URL
3. Deploy

### Environment Variables for Railway

```
SOCKET_IO_CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## API Endpoints

- `GET /health` - Health check
- `GET /socket-status` - Socket.IO server status

## Socket.IO Events

### Client to Server

- `join_app` - Join the app with user ID
- `send_message` - Send a message
- `set_current_chat` - Set current chat being viewed
- `disconnect` - User disconnects

### Server to Client

- `user_online` - User comes online
- `user_offline` - User goes offline
- `receive_message` - Receive a new message
- `unread_update` - Update unread count
- `online_users_list` - List of online users
- `chat_list_update` - Chat list update
- `error` - Error occurred

## Integration with Next.js App

Update your Next.js app's environment variables:

```bash
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-railway-app.railway.app
```

Then update your Socket.IO client configuration to connect to this server instead of the Next.js API route.
