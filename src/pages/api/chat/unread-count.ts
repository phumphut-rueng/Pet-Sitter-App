import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * @openapi
 * /chat/unread-count:
 *   get:
 *     tags: [Chat]
 *     summary: Get total unread messages count
 *     description: >
 *       Return the sum of `unread_count` across all chats for the current session user
 *       (only chats that are not hidden).
 *     responses:
 *       200:
 *         description: Unread count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 totalUnreadCount: { type: integer, example: 7 }
 *                 message: { type: string, example: "Unread count fetched successfully" }
 *       401:
 *         description: Unauthorized - Please login first
 *       405:
 *         description: Method Not Allowed
 *       500:
 *         description: Internal server error
 *     security:
 *       - cookieAuth: []
 */

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
  
  if (isNaN(currentUserId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  try {
    // ตรวจสอบว่า user มี chat settings หรือไม่
    const userChatSettings = await prisma.user_chat_settings.findFirst({
      where: {
        user_id: currentUserId
      }
    });

    // ถ้าไม่มี chat settings ให้ return 0
    if (!userChatSettings) {
      return res.status(200).json({ 
        success: true, 
        totalUnreadCount: 0,
        message: 'No chat settings found, returning 0' 
      });
    }

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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      currentUserId,
      sessionUserId: session.user.id
    });
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
