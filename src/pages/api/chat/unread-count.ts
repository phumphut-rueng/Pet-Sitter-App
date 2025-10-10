import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  // ใช้ NextAuth.js session แทนการส่ง userId ใน query
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login first' 
    });
  }

  const currentUserId = parseInt(session.user.id);

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
