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
    // ดึงรายการ chat ที่ user มีส่วนร่วม
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1_id: currentUserId },
          { user2_id: currentUserId }
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
          where: { user_id: currentUserId },
          select: { unread_count: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    // จัดรูปแบบข้อมูล
    const formattedChats = chats.map(chat => {
      const otherUser = chat.user1_id === currentUserId 
        ? chat.user_chat_user2_idTouser 
        : chat.user_chat_user1_idTouser;
      
      const lastMessage = chat.message_message_chat_idTochat[0];
      const unreadCount = chat.user_chat_settings[0]?.unread_count || 0;

      return {
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          profileImage: otherUser.profile_image
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          senderName: lastMessage.user.name,
          messageType: lastMessage.message_type
        } : null,
        unreadCount,
        updatedAt: chat.updated_at
      };
    });

    res.json({ chats: formattedChats });

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
