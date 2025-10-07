// file: pages/api/chat/online-users.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ดึงรายชื่อผู้ใช้ออนไลน์ทั้งหมด
    const onlineUsers = await prisma.user.findMany({
      where: {
        is_online: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // แปลง ID เป็น string เพื่อให้ตรงกับ frontend
    const onlineUserIds = onlineUsers.map(user => user.id.toString());

    return res.status(200).json({
      success: true,
      onlineUsers: onlineUserIds,
      count: onlineUserIds.length,
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch online users',
    });
  }
}
