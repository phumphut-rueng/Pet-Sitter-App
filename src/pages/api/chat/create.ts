// file: pages/api/chat/create.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}

export default async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
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

  const currentUserId = parseInt(req.user.id);
  const { otherUserId } = req.body;

  if (!otherUserId) {
    return res.status(400).json({ 
      success: false, 
      message: 'otherUserId is required' 
    });
  }

  const otherUserIdNumber = parseInt(otherUserId);
  if (isNaN(otherUserIdNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid otherUserId format' 
    });
  }

  if (currentUserId === otherUserIdNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot create chat with yourself' 
    });
  }

  try {
    // ตรวจสอบว่ามี chat อยู่แล้วหรือไม่
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1_id: currentUserId, user2_id: otherUserIdNumber },
          { user1_id: otherUserIdNumber, user2_id: currentUserId }
        ]
      }
    });

    if (existingChat) {
      // ถ้ามี chat อยู่แล้ว ให้อัปเดต is_hidden = false สำหรับผู้ส่งข้อความ
      await prisma.user_chat_settings.updateMany({
        where: {
          user_id: currentUserId,
          chat_id: existingChat.id
        },
        data: {
          is_hidden: false,
          unread_count: 0 // รีเซ็ต unread count ด้วย
        }
      });

      // อัปเดต updated_at ของ chat
      await prisma.chat.update({
        where: { id: existingChat.id },
        data: { updated_at: new Date() }
      });

      return res.status(200).json({
        success: true,
        chatId: existingChat.id,
        isNewChat: false,
        message: 'Chat already exists and unhidden'
      });
    }

    // สร้าง chat ใหม่
    const newChat = await prisma.chat.create({
      data: {
        user1_id: currentUserId,
        user2_id: otherUserIdNumber,
        updated_at: new Date()
      }
    });

    // สร้าง user_chat_settings สำหรับทั้งสองคน
    await prisma.user_chat_settings.createMany({
      data: [
        {
          user_id: currentUserId,
          chat_id: newChat.id,
          unread_count: 0,
          is_hidden: false // ฝ่ายที่กด Send Message จะเห็นทันที
        },
        {
          user_id: otherUserIdNumber,
          chat_id: newChat.id,
          unread_count: 0,
          is_hidden: true // ฝ่ายที่ถูกส่งข้อความจะซ่อนไว้จนกว่าจะมีข้อความ
        }
      ]
    });

    res.status(201).json({
      success: true,
      chatId: newChat.id,
      isNewChat: true,
      message: 'Chat created successfully'
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}