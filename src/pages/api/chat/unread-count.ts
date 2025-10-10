import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}

export default async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  try {
    // ดึง unread count รวมจากทุก chat
    const result = await prisma.user_chat_settings.aggregate({
      where: {
        user_id: currentUserId,
        is_hidden: false // เฉพาะ chat ที่ไม่ถูกซ่อน
      },
      _sum: {
        unread_count: true
      }
    });

    const totalUnreadCount = result._sum.unread_count || 0;

    res.status(200).json({ 
      success: true, 
      totalUnreadCount,
      message: 'Unread count fetched successfully' 
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
