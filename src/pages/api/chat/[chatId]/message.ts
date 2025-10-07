// file: pages/api/chat/[chatId]/message.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}

export default async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  const { chatId } = req.query;
  
  // ตรวจสอบว่า chatId เป็น string และแปลงเป็น number
  if (!chatId || typeof chatId !== 'string') {
    return res.status(400).json({ message: 'Invalid chat ID' });
  }

  const chatIdNumber = parseInt(chatId);
  if (isNaN(chatIdNumber)) {
    return res.status(400).json({ message: 'Invalid chat ID format' });
  }

  // ตรวจสอบ authentication (ชั่วคราวให้ผ่านก่อน)
  if (!req.user?.id) {
    const testUserId = req.query.userId as string;
    if (!testUserId) {
      return res.status(401).json({ message: 'Unauthorized - Please add ?userId=YOUR_USER_ID to URL' });
    }
    req.user = { id: testUserId };
  }

  const currentUserId = req.user.id;

  if (req.method === 'GET') {
    try {
      // 1. ตรวจสอบว่า user มีสิทธิ์เข้าถึง chat นี้หรือไม่
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatIdNumber,
          OR: [
            { user1_id: parseInt(currentUserId) },
            { user2_id: parseInt(currentUserId) }
          ]
        }
      });

      if (!chat) {
        return res.status(403).json({ message: 'Access denied to this chat' });
      }

      // 2. ดึงประวัติข้อความ
      const messages = await prisma.message.findMany({
        where: { chat_id: chatIdNumber },
        orderBy: { timestamp: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile_image: true,
              profile_image_public_id: true
            }
          }
        }
      });
      
      // 3. ⭐️ LOGIC สำคัญ: RESET UNREAD COUNT และทำเครื่องหมายว่าอ่านแล้ว
      await prisma.user_chat_settings.update({
        where: { 
          user_id_chat_id: { 
            user_id: parseInt(currentUserId), 
            chat_id: chatIdNumber 
          } 
        },
        data: { unread_count: 0 }, // รีเซ็ตตัวนับ
      });

      // 4. ทำเครื่องหมายข้อความที่ผู้ใช้คนนี้ได้รับว่า "อ่านแล้ว"
      await prisma.message.updateMany({
        where: {
          chat_id: chatIdNumber,
          NOT: { sender_id: parseInt(currentUserId) }, // เฉพาะข้อความที่ตัวเองเป็นผู้รับ
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
