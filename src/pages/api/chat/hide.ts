import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  // ใช้ NextAuth.js session แทนการส่ง userId ใน body
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login first' 
    });
  }

  const { chatId } = req.body;
  const currentUserId = parseInt(session.user.id);

  if (!chatId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Chat ID is required' 
    });
  }

  try {
    // ตรวจสอบว่า user มีสิทธิ์เข้าถึง chat นี้หรือไม่
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(chatId),
        OR: [
          { user1_id: currentUserId },
          { user2_id: currentUserId }
        ]
      }
    });

    if (!chat) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this chat' 
      });
    }

    // อัปเดต is_hidden เป็น true สำหรับ chat ที่เลือก
    await prisma.user_chat_settings.update({
      where: {
        user_id_chat_id: {
          user_id: currentUserId,
          chat_id: parseInt(chatId)
        }
      },
      data: {
        is_hidden: true,
        unread_count: 0 // รีเซ็ต unread count ด้วย
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Chat hidden successfully' 
    });

  } catch (error) {
    console.error('Error hiding chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
