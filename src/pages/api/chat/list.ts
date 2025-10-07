import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}

export default async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ตรวจสอบ authentication (ชั่วคราวให้ผ่านก่อน)
  if (!req.user?.id) {
    const testUserId = req.query.userId as string;
    if (!testUserId) {
      return res.status(401).json({ message: 'Unauthorized - Please add ?userId=YOUR_USER_ID to URL' });
    }
    req.user = { id: testUserId };
  }

  const currentUserId = parseInt(req.user.id);

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

    res.json({ success: true, chats: formattedChats });

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
