// socket-server/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const app = express();
const httpServer = createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Define the type for a socket with a user ID
interface SocketWithUser extends Socket {
  userId?: string;
  currentChatId?: number;
}

// Socket.IO event types
interface SendMessageData {
  chatId: number;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE';
  imageUrl?: string;
}

interface MessagePayload {
  id: string;
  chatId: number;
  senderId: string;
  content: string;
  messageType: string;
  imageUrl?: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
  senderProfileImage?: string;
  senderProfileImagePublicId?: string;
}

interface UnreadUpdateData {
  chatId: number;
  newUnreadCount: number;
}

interface ChatListUpdateData {
  chatId: number;
  action: 'show' | 'hide';
}

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingTimeout: 30000, // 30 seconds
  pingInterval: 10000, // 10 seconds
  upgradeTimeout: 5000, // 5 seconds
  allowEIO3: true,
  transports: ['polling', 'websocket'], // Start with polling first
  serveClient: false, // Do not serve client files
  allowUpgrades: true,
  perMessageDeflate: false // Disable compression to reduce latency
});

// Add global error handlers for the Socket.IO server
io.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

io.engine.on('connection_error', (err) => {
  console.error('❌ Socket engine error:', err.code, err.message, err.context);
});

io.on('connection', (socket: SocketWithUser) => {
  console.log(`✅ New socket connection established: ${socket.id}`);

  // Add error handling for socket events
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
    socket.emit('error', { message: 'Connection error occurred' });
  });

  // Event: When a user joins the app
  socket.on('join_app', async (userId: string) => {
    try {
      console.log(`User ${userId} joining app with socket ${socket.id}`);
      socket.userId = userId;
      socket.join(userId); // Join a room specific to the user
      
      // Update user online status in database
      await prisma.user.update({ 
        where: { id: parseInt(userId) }, 
        data: { is_online: true } 
      });
      
      // Get online users from database
      const onlineUsers = await prisma.user.findMany({
        where: { is_online: true },
        select: { id: true },
      });
      const onlineUserIds = onlineUsers.map((user: { id: number }) => user.id.toString());
      
      // Send online users list to the user
      socket.emit('online_users_list', onlineUserIds);
      io.emit('user_online', userId); // Notify all clients that this user is online
      
      console.log(`User ${userId} successfully joined app`);
    } catch (error) {
      console.error('Error joining app:', error);
      socket.emit('error', { 
        message: 'Failed to join app', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Event: When a user sends a message
  socket.on('send_message', async (data: SendMessageData) => {
    try {
      console.log(`Message from ${data.senderId} to ${data.receiverId}: ${data.content}`);
      
      // Save message to database
      const newMessage = await prisma.message.create({
        data: {
          chat_id: data.chatId,
          sender_id: parseInt(data.senderId),
          content: data.content,
          message_type: data.messageType || 'TEXT',
          image_url: data.imageUrl,
        },
      });

      // Update chat last message
      await prisma.chat.update({ 
        where: { id: data.chatId }, 
        data: { 
          last_message_id: newMessage.id, 
          updated_at: new Date() 
        } 
      });

      // Check if receiver is viewing this chat
      const receiverSocket = Array.from(io.sockets.sockets.values()).find(
        socket => (socket as SocketWithUser).userId === data.receiverId
      ) as SocketWithUser;
      const isReceiverViewingThisChat = receiverSocket?.currentChatId === data.chatId;

      // Update unread count
      const updatedUserChatSettings = await prisma.user_chat_settings.update({
        where: { 
          user_id_chat_id: { 
            user_id: parseInt(data.receiverId), 
            chat_id: data.chatId 
          } 
        },
        data: { 
          unread_count: isReceiverViewingThisChat 
            ? { set: 0 } // If viewing, set to 0
            : { increment: 1 }, // If not viewing, increment by 1
          is_hidden: false // Show chat when first message arrives
        },
        select: { unread_count: true }
      });

      // Get sender info
      const sender = await prisma.user.findUnique({
        where: { id: parseInt(data.senderId) },
        select: { 
          name: true,
          profile_image: true,
          profile_image_public_id: true
        }
      });

      // Create message payload
      const payload: MessagePayload = {
        id: newMessage.id.toString(),
        chatId: newMessage.chat_id,
        senderId: newMessage.sender_id.toString(),
        content: newMessage.content || '',
        messageType: newMessage.message_type || 'TEXT',
        imageUrl: newMessage.image_url || undefined,
        timestamp: newMessage.timestamp || new Date(),
        isRead: newMessage.is_read || false,
        senderName: sender?.name || 'Unknown User',
        senderProfileImage: sender?.profile_image || undefined,
        senderProfileImagePublicId: sender?.profile_image_public_id || undefined
      };

      // Send message to both sender and receiver
      io.to(data.senderId).emit('receive_message', payload);
      io.to(data.receiverId).emit('receive_message', payload);

      // Send unread update
      io.to(data.senderId).emit('unread_update', { 
        chatId: data.chatId, 
        newUnreadCount: 0 
      });
      
      const unreadCountForReceiver = updatedUserChatSettings.unread_count || 0;
      io.to(data.receiverId).emit('unread_update', { 
        chatId: data.chatId, 
        newUnreadCount: unreadCountForReceiver
      });

      // Send chat list update
      io.to(data.receiverId).emit('chat_list_update', {
        chatId: data.chatId,
        action: 'show'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { 
        message: 'Failed to send message', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Event: When a user sets current chat
  socket.on('set_current_chat', (data: { userId: string; chatId: number }) => {
    socket.currentChatId = data.chatId;
    console.log(`User ${data.userId} is viewing chat ${data.chatId}`);
  });

  // Event: When a user disconnects
  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected from socket ${socket.id}`);
        
        // Update user offline status in database
        await prisma.user.update({ 
          where: { id: parseInt(socket.userId) }, 
          data: { 
            is_online: false, 
            last_seen: new Date() 
          } 
        });
        
        io.emit('user_offline', socket.userId); // Notify all clients that this user is offline
      } else {
        console.log(`Socket ${socket.id} disconnected (no user ID)`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
      // Do not emit error here as the socket might already be disconnected
    }
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    server: 'Socket.IO Standalone',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// Socket.IO status endpoint
app.get('/socket-status', (req, res) => {
  res.status(200).json({
    success: true,
    isReady: true,
    message: 'Socket.IO server is running',
    connectedClients: io.engine.clientsCount
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server listening on port ${PORT}`);
  console.log(`📡 CORS origins: ${process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Socket status: http://localhost:${PORT}/socket-status`);
});
