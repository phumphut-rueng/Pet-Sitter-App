import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

/**
 * @openapi
 * /chat/list:
 *   get:
 *     tags: [Chat]
 *     summary: Get chats for current user
 *     description: >
 *       Return visible chats for the logged-in user (or chats with unread messages).
 *       Requires a valid NextAuth session cookie.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Chats retrieved successfully" }
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 42 }
 *                       user1_id: { type: integer, example: 10 }
 *                       user2_id: { type: integer, example: 20 }
 *                       updated_at: { type: string, example: "2025-10-21T12:34:56.000Z" }
 *                       unread_count: { type: integer, example: 3 }
 *                       user1:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 10 }
 *                           name: { type: string, example: "Alice" }
 *                           profile_image: { type: string, nullable: true, example: null }
 *                       user2:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 20 }
 *                           name: { type: string, example: "Bob" }
 *                           profile_image: { type: string, nullable: true, example: "https://..." }
 *                       last_message:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: integer, example: 777 }
 *                           chat_id: { type: integer, example: 42 }
 *                           sender_id: { type: integer, example: 10 }
 *                           message_type: { type: string, example: "text" }
 *                           content: { type: string, example: "Hi!" }
 *                           image_url: { type: string, nullable: true, example: null }
 *                           timestamp: { type: string, example: "2025-10-21T12:30:00.000Z" }
 *                           is_read: { type: boolean, example: false }
 *       401:
 *         description: Unauthorized - Please login first
 *       405:
 *         description: Method Not Allowed
 *       500:
 *         description: Internal server error
 */

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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
    // ดึงรายการ chat ที่ user มีส่วนร่วม และไม่ถูกซ่อน หรือมีข้อความที่ยังไม่ได้อ่าน
    const chats = await prisma.chat.findMany({
      where: {
        AND: [
          {
            OR: [
              { user1_id: currentUserId },
              { user2_id: currentUserId }
            ]
          },
          {
            OR: [
              // Chat ที่ไม่ถูกซ่อน
              {
                user_chat_settings: {
                  some: {
                    user_id: currentUserId,
                    is_hidden: false
                  }
                }
              },
              // Chat ที่มีข้อความที่ยังไม่ได้อ่าน (แม้จะถูกซ่อน)
              {
                user_chat_settings: {
                  some: {
                    user_id: currentUserId,
                    unread_count: {
                      gt: 0
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        user_chat_user1_idTouser: {
          select: { id: true, name: true, profile_image: true }
        },
        user_chat_user2_idTouser: {
          select: { id: true, name: true, profile_image: true }
        },
        message_message_chat_idTochat: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        user_chat_settings: {
          where: { 
            user_id: currentUserId
          },
          select: { unread_count: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    // อัปเดต is_hidden เป็น false สำหรับ chat ที่มีข้อความที่ยังไม่ได้อ่าน
    await prisma.user_chat_settings.updateMany({
      where: {
        user_id: currentUserId,
        unread_count: {
          gt: 0
        },
        is_hidden: true
      },
      data: {
        is_hidden: false
      }
    });

    // จัดรูปแบบข้อมูลให้ตรงกับ ChatWidget interface
    const formattedChats = chats.map(chat => {
      const user1 = chat.user_chat_user1_idTouser;
      const user2 = chat.user_chat_user2_idTouser;
      const lastMessage = chat.message_message_chat_idTochat[0];
      const unreadCount = chat.user_chat_settings[0]?.unread_count || 0;

      return {
        id: chat.id,
        user1_id: chat.user1_id,
        user2_id: chat.user2_id,
        last_message_id: chat.last_message_id,
        updated_at: chat.updated_at,
        user1: {
          id: user1.id,
          name: user1.name,
          email: '', // ไม่ได้ส่งมาใน API นี้
          profile_image: user1.profile_image,
          is_online: null, // ไม่ได้ส่งมาใน API นี้
          last_seen: null // ไม่ได้ส่งมาใน API นี้
        },
        user2: {
          id: user2.id,
          name: user2.name,
          email: '', // ไม่ได้ส่งมาใน API นี้
          profile_image: user2.profile_image,
          is_online: null, // ไม่ได้ส่งมาใน API นี้
          last_seen: null // ไม่ได้ส่งมาใน API นี้
        },
        last_message: lastMessage ? {
          id: lastMessage.id,
          chat_id: chat.id,
          sender_id: lastMessage.sender_id,
          message_type: lastMessage.message_type,
          content: lastMessage.content,
          image_url: lastMessage.image_url,
          timestamp: lastMessage.timestamp,
          is_read: lastMessage.is_read,
          sender: {
            id: lastMessage.sender_id,
            name: lastMessage.user.name,
            email: '', // ไม่ได้ส่งมาใน API นี้
            profile_image: null, // ไม่ได้ส่งมาใน API นี้
            is_online: null, // ไม่ได้ส่งมาใน API นี้
            last_seen: null // ไม่ได้ส่งมาใน API นี้
          }
        } : undefined,
        unread_count: unreadCount
      };
    });

    res.status(200).json({ 
      success: true, 
      chats: formattedChats,
      message: 'Chats retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
