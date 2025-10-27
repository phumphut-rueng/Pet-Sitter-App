import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * @openapi
 * /chat/mark-read:
 *   post:
 *     tags: [Chat]
 *     summary: Mark a chat as read
 *     description: >
 *       Set the current user's `unread_count` for the given chat to 0.
 *       Requires a valid NextAuth session cookie. Idempotent.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chatId]
 *             properties:
 *               chatId:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       200:
 *         description: Chat marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Chat marked as read" }
 *       400:
 *         description: Chat ID is required
 *       401:
 *         description: Unauthorized - Please login first
 *       405:
 *         description: Method Not Allowed
 *       500:
 *         description: Internal server error
 */


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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

    res.status(200).json({ 
      success: true, 
      message: 'Chat marked as read' 
    });

  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
