# Socket.IO Server Separation Guide

## Overview

This guide explains how to separate the Socket.IO server from the Next.js application and deploy it on Railway while keeping the Next.js frontend on Vercel.

## Project Structure

```
Pet-Sitter-App/
├── src/                    # Next.js application
├── socket-server/          # Standalone Socket.IO server
│   ├── index.ts           # Main server file
│   ├── package.json       # Server dependencies
│   ├── tsconfig.json      # TypeScript config
│   ├── README.md          # Server documentation
│   └── env.example        # Environment variables template
└── ...
```

## Changes Made

### 1. Created Standalone Socket.IO Server

- **Location**: `socket-server/`
- **Main file**: `socket-server/index.ts`
- **Features**:
  - Express HTTP server
  - Socket.IO server with CORS support
  - Health check endpoints
  - Error handling
  - User online/offline management
  - Real-time messaging

### 2. Updated Next.js Client

- **File**: `src/lib/utils/socket.ts`
- **Changes**:
  - Connect to external Socket.IO server instead of Next.js API route
  - Use `NEXT_PUBLIC_SOCKET_SERVER_URL` environment variable
  - Default fallback to `http://localhost:4000`

### 3. Removed Files

- `src/pages/api/chat/socket.ts` - Moved to standalone server
- `src/pages/api/chat/socket-status.ts` - Replaced with `/socket-status` endpoint
- `src/pages/api/chat/test-connection.ts` - No longer needed
- `vercel.json` - No longer needed

### 4. Updated Hooks

- **File**: `src/hooks/useSocket.ts`
- **Changes**: Updated to check standalone server status

## Deployment Steps

### Step 1: Deploy Socket.IO Server to Railway

1. **Create Railway Project**:
   - Go to [Railway.app](https://railway.app)
   - Create new project from GitHub repository
   - Select the `socket-server` folder

2. **Set Environment Variables**:
   ```
   SOCKET_IO_CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

3. **Deploy**:
   - Railway will automatically detect the Node.js project
   - Build and deploy the server
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### Step 2: Update Next.js App on Vercel

1. **Set Environment Variable**:
   ```
   NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-app.railway.app
   ```

2. **Deploy**:
   - Deploy your Next.js app to Vercel as usual
   - The app will now connect to the Railway Socket.IO server

## Environment Variables

### Socket.IO Server (Railway)

```bash
# Required
SOCKET_IO_CORS_ORIGIN=https://your-vercel-app.vercel.app

# Optional
PORT=4000  # Railway sets this automatically
```

### Next.js App (Vercel)

```bash
# Required
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-railway-app.railway.app

# Existing variables
DATABASE_URL=your-database-url
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-secret
```

## Testing

### Local Development

1. **Start Socket.IO Server**:
   ```bash
   cd socket-server
   npm run dev
   ```

2. **Start Next.js App**:
   ```bash
   npm run dev
   ```

3. **Test Connection**:
   - Visit `http://localhost:4000/health`
   - Check browser console for Socket.IO connection logs

### Production Testing

1. **Check Server Health**:
   - Visit `https://your-railway-app.railway.app/health`
   - Visit `https://your-railway-app.railway.app/socket-status`

2. **Test Chat Functionality**:
   - Open chat in your Vercel app
   - Check browser console for connection status
   - Test sending messages

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `SOCKET_IO_CORS_ORIGIN` includes your Vercel domain
   - Check that URLs match exactly (including https/http)

2. **Connection Timeout**:
   - Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` is correct
   - Check Railway deployment logs
   - Ensure server is running on correct port

3. **Environment Variables**:
   - Verify all environment variables are set correctly
   - Check that `NEXT_PUBLIC_` prefix is used for client-side variables

### Debugging

1. **Server Logs**:
   - Check Railway deployment logs
   - Look for connection and error messages

2. **Client Logs**:
   - Open browser DevTools
   - Check Console tab for Socket.IO messages
   - Look for connection errors

3. **Network Tab**:
   - Check for failed requests to Socket.IO server
   - Verify WebSocket connections

## Benefits

1. **Better Performance**: Dedicated server for real-time features
2. **Scalability**: Can scale Socket.IO server independently
3. **Reliability**: No serverless function timeouts
4. **Cost Efficiency**: Railway pricing for persistent connections
5. **Development**: Easier to debug and maintain

## Next Steps

1. **Database Integration**: Add Prisma client to Socket.IO server for full functionality
2. **Authentication**: Implement JWT verification in Socket.IO server
3. **Monitoring**: Add logging and monitoring tools
4. **Scaling**: Consider Redis adapter for multiple server instances
