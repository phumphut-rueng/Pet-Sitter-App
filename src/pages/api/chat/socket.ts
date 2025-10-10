// file: pages/api/chat/socket.ts

import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Socket } from 'socket.io';
import { prisma } from '@/lib/prisma/prisma';
import { SocketEvents, SendMessageData, MessagePayload, UnreadUpdateData } from '@/types/socket.types';

// Use any type for socket server to avoid type conflicts
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  } | null;
};

export const config = { 
  api: { 
    bodyParser: false 
  } 
};

let io: Server; // Global Instance

interface SocketWithUser extends Socket {
  userId?: string;
  currentChatId?: number;
}

export default async function socketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket?.server?.io) {
    // 1. สร้าง Socket.io Server Instance (Magic Part)
    const httpServer = res.socket!.server;
    io = new Server(httpServer, { 
      path: '/api/chat/socket', 
      cors: { 
        origin: '*', 
        methods: ['GET', 'POST'] 
      },
      pingTimeout: 60000, // 60 วินาที
      pingInterval: 25000, // 25 วินาที
      upgradeTimeout: 10000, // 10 วินาที
      allowEIO3: true
    });

    io.on('connection', (socket: SocketWithUser) => {
      console.log('New socket connection established');
      
      // Event: เมื่อผู้ใช้เข้าสู่แอป
      socket.on('join_app', async (userId: string) => {
        try {
          console.log('User joining app:', userId);
          (socket as SocketWithUser).userId = userId;
          
          // ตรวจสอบว่า userId เป็นตัวเลขที่ถูกต้อง
          const userIdNumber = parseInt(userId);
          if (isNaN(userIdNumber)) {
            console.error('Invalid user ID:', userId);
            socket.emit('error', { message: 'Invalid user ID' });
            return;
          }
          
          await prisma.user.update({ 
            where: { id: userIdNumber }, 
            data: { is_online: true } 
          });
          socket.join(userId); // เข้า Private Room ด้วย ID ตัวเอง
          
          // ดึงรายชื่อผู้ใช้ออนไลน์ทั้งหมดและส่งให้ client
          const onlineUsers = await prisma.user.findMany({
            where: { is_online: true },
            select: { id: true },
          });
          
          const onlineUserIds = onlineUsers.map(user => user.id.toString());
          
          // ส่งรายชื่อ online users ทั้งหมดให้ client ที่เพิ่งเข้ามา
          socket.emit('online_users_list', onlineUserIds);
          
          // แจ้งทุกคนว่ามี user ใหม่เข้ามา
          io.emit('user_online', userId);
          console.log('User successfully joined app:', userId);
        } catch (error) {
          console.error('Error joining app:', error);
          socket.emit('error', { message: 'Failed to join app' });
        }
      });
      
      // Event: จัดการการส่งข้อความ/รูปภาพ
      socket.on('send_message', async (data: SendMessageData) => {
        try {
          // 1. บันทึกข้อความ/รูปภาพ ลงใน DB (Persistence)
          const newMessage = await prisma.message.create({
            data: {
              chat_id: data.chatId,
              sender_id: parseInt(data.senderId),
              content: data.content,
              message_type: data.messageType || 'TEXT',
              image_url: data.imageUrl,
            },
          });

          // 2. อัปเดต Chat ล่าสุด
          await prisma.chat.update({ 
            where: { id: data.chatId }, 
            data: { 
              last_message_id: newMessage.id, 
              updated_at: new Date() 
            } 
          });
          
          // 3. ตรวจสอบว่า receiver กำลังดู chat นี้อยู่หรือไม่
          const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            socket => (socket as SocketWithUser).userId === data.receiverId
          ) as SocketWithUser;
          const isReceiverViewingThisChat = receiverSocket?.currentChatId === data.chatId;
          
          
          // 4. INCREMENT UNREAD COUNT และแสดง chat สำหรับผู้รับ (ถ้าไม่ได้กำลังดูอยู่)
          const updatedUserChatSettings = await prisma.user_chat_settings.update({
            where: { 
              user_id_chat_id: { 
                user_id: parseInt(data.receiverId), 
                chat_id: data.chatId 
              } 
            },
            data: { 
              unread_count: isReceiverViewingThisChat 
                ? { set: 0 } // ถ้ากำลังดูอยู่ ให้ set เป็น 0
                : { increment: 1 }, // ถ้าไม่ได้ดู ให้เพิ่ม 1
              is_hidden: false // แสดง chat เมื่อมีข้อความแรก
            },
            select: { unread_count: true }
          });
          
          // 4. ดึงข้อมูลผู้ส่งเพื่อใส่ใน payload
          const sender = await prisma.user.findUnique({
            where: { id: parseInt(data.senderId) },
            select: { 
              name: true,
              profile_image: true,
              profile_image_public_id: true
            }
          });
          
          // 5. Real-Time Delivery และแจ้ง Unread Badge
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
          
          // ส่งข้อความไปให้ทั้งคนส่งและคนรับ
          io.to(data.senderId).emit('receive_message', payload);
          io.to(data.receiverId).emit('receive_message', payload);
          
          // ส่ง unread update ให้ทั้งคนส่งและคนรับ
          io.to(data.senderId).emit('unread_update', { 
            chatId: data.chatId, 
            newUnreadCount: 0 // คนส่งไม่ต้องมี unread count
          });
          
          // ใช้ unread count จาก database (ที่ตรวจสอบว่ากำลังดูอยู่หรือไม่แล้ว)
          const unreadCountForReceiver = updatedUserChatSettings.unread_count || 0;
          
          // ส่ง unread update ให้ receiver ทุกครั้ง (เพื่อให้ navbar อัปเดต)
          io.to(data.receiverId).emit('unread_update', { 
            chatId: data.chatId, 
            newUnreadCount: unreadCountForReceiver
          });

          // ส่ง event เพื่อแจ้งให้ frontend refresh chat list (สำหรับกรณีที่ chat ถูกซ่อนไว้)
          io.to(data.receiverId).emit('chat_list_update', {
            chatId: data.chatId,
            action: 'show' // แสดง chat ที่ถูกซ่อนไว้
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Event: เมื่อผู้ใช้เลือก chat ปัจจุบัน
        socket.on('set_current_chat', (data: { userId: string; chatId: number }) => {
          (socket as SocketWithUser).currentChatId = data.chatId;
        });

      // Event: เมื่อผู้ใช้ออกจากแอป
      socket.on('disconnect', async () => {
        try {
          if ((socket as SocketWithUser).userId) {
            await prisma.user.update({ 
              where: { id: parseInt((socket as SocketWithUser).userId!) }, 
              data: { 
                is_online: false, 
                last_seen: new Date() 
              } 
            });
            io.emit('user_offline', (socket as SocketWithUser).userId);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    });
    res.socket!.server.io = io;
  }
  res.status(200).end();
}