// file: pages/api/chat/[chatId]/message.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';


/**
 * @openapi
 * /chat/{chatId}/message:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a chat and mark them as read
 *     description: >
 *       Return chronological messages of a chat the current user participates in.
 *       Also resets the user's unread count and marks received messages as read.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages retrieved successfully
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 101 }
 *                       chat_id: { type: integer, example: 55 }
 *                       sender_id: { type: integer, example: 123 }
 *                       message_type: { type: string, example: "text" }
 *                       content: { type: string, nullable: true, example: "Hello!" }
 *                       image_url: { type: string, nullable: true, example: null }
 *                       timestamp: { type: string, example: "2025-10-21T12:34:56.000Z" }
 *                       is_read: { type: boolean, example: true }
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 123 }
 *                           name: { type: string, nullable: true, example: "Alice" }
 *                           email: { type: string, example: "" }
 *                           profile_image: { type: string, nullable: true, example: "https://cdn.example.com/u/123.png" }
 *                           is_online: { type: string, nullable: true, example: null }
 *                           last_seen: { type: string, nullable: true, example: null }
 *       400:
 *         description: Invalid chat ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied to this chat or chat is hidden
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 *     security:
 *       - cookieAuth: []
 */


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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

  // ใช้ NextAuth.js session แทนการส่ง userId ใน query
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login first' 
    });
  }

  const currentUserId = session.user.id;

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
