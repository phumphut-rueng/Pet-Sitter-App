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
  if (!req.user?.id) {
    const testUserId = req.body.userId;
    if (!testUserId) {
      return res.status(401).json({ message: 'Unauthorized - Please provide userId in request body' });
    }
    req.user = { id: testUserId };
  }

  const { chatId } = req.body;
  const currentUserId = parseInt(req.user.id);

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  try {
    // อัปเดต unread_count เป็น 0 สำหรับ chat ที่เลือก
    await prisma.user_chat_settings.update({
      where: {
        user_id_chat_id: {
          user_id: currentUserId,
          chat_id: parseInt(chatId)
        }
      },
      data: {
        unread_count: 0
      }
    });

    res.json({ success: true, message: 'Chat marked as read' });

  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
