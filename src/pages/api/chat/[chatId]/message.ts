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
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid chat ID' 
    });
  }

  const chatIdNumber = parseInt(chatId);
  if (isNaN(chatIdNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid chat ID format' 
    });
  }

  // ตรวจสอบ authentication (ชั่วคราวให้ผ่านก่อน)
  if (!req.user?.id) {
    const testUserId = req.query.userId as string;
    if (!testUserId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Please add ?userId=YOUR_USER_ID to URL' 
      });
    }
    req.user = { id: testUserId };
  }

  const currentUserId = req.user.id;

  if (req.method === 'GET') {
    try {
      // 1. ตรวจสอบว่า user มีสิทธิ์เข้าถึง chat นี้หรือไม่ และ chat ไม่ได้ถูกซ่อนไว้
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatIdNumber,
          OR: [
            { user1_id: parseInt(currentUserId) },
            { user2_id: parseInt(currentUserId) }
          ]
        },
        include: {
          user_chat_settings: {
            where: {
              user_id: parseInt(currentUserId),
              is_hidden: false // ตรวจสอบว่า chat ไม่ได้ถูกซ่อนไว้
            }
          }
        }
      });

      if (!chat || chat.user_chat_settings.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this chat or chat is hidden' 
        });
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

      // จัดรูปแบบข้อมูลให้ตรงกับ ChatWidget interface
      const formattedMessages = messages.map(message => ({
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        message_type: message.message_type,
        content: message.content,
        image_url: message.image_url,
        timestamp: message.timestamp,
        is_read: message.is_read,
        sender: {
          id: message.user.id,
          name: message.user.name,
          email: '', // ไม่ได้ส่งมาใน API นี้
          profile_image: message.user.profile_image,
          is_online: null, // ไม่ได้ส่งมาใน API นี้
          last_seen: null // ไม่ได้ส่งมาใน API นี้
        }
      }));

      res.status(200).json({ 
        success: true, 
        messages: formattedMessages,
        message: 'Messages retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }
}
