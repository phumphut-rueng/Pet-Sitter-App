import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}

export default async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ตรวจสอบ authentication (ชั่วคราวให้ผ่านก่อน)
  // TODO: ต้องเพิ่ม authentication middleware
  if (!req.user?.id) {
    // สำหรับการทดสอบ ให้ใช้ user ID จาก query parameter
    const testUserId = req.query.userId as string;
    if (!testUserId) {
      return res.status(401).json({ message: 'Unauthorized - Please add ?userId=YOUR_USER_ID to URL' });
    }
    // สร้าง fake user object
    req.user = { id: testUserId };
  }

  const { otherUserId } = req.body;
  const currentUserId = parseInt(req.user.id);

  if (!otherUserId) {
    return res.status(400).json({ message: 'Other user ID is required' });
  }

  const otherUserIdInt = parseInt(otherUserId);
  if (isNaN(otherUserIdInt)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  if (currentUserId === otherUserIdInt) {
    return res.status(400).json({ message: 'Cannot create chat with yourself' });
  }

  try {
    // ตรวจสอบว่ามี chat อยู่แล้วหรือไม่
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1_id: currentUserId, user2_id: otherUserIdInt },
          { user1_id: otherUserIdInt, user2_id: currentUserId }
        ]
      }
    });

    if (existingChat) {
      return res.json({ 
        chat: existingChat, 
        message: 'Chat already exists' 
      });
    }

    // สร้าง chat ใหม่
    const newChat = await prisma.chat.create({
      data: {
        user1_id: currentUserId,
        user2_id: otherUserIdInt,
      }
    });

    // สร้าง user_chat_settings สำหรับทั้งสองคน
    await prisma.user_chat_settings.createMany({
      data: [
        {
          user_id: currentUserId,
          chat_id: newChat.id,
          unread_count: 0,
        },
        {
          user_id: otherUserIdInt,
          chat_id: newChat.id,
          unread_count: 0,
        }
      ]
    });

    // ดึงข้อมูล chat พร้อม user details
    const chatWithUsers = await prisma.chat.findUnique({
      where: { id: newChat.id },
      include: {
        user_chat_user1_idTouser: {
          select: { id: true, name: true, profile_image: true }
        },
        user_chat_user2_idTouser: {
          select: { id: true, name: true, profile_image: true }
        }
      }
    });

    res.status(201).json({ 
      chat: chatWithUsers, 
      message: 'Chat created successfully' 
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
