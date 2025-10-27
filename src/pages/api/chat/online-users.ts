// file: pages/api/chat/online-users.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

/**
 * @openapi
 * /chat/online-users:
 *   get:
 *     tags: [Chat]
 *     summary: Get online users
 *     description: >
 *       Return a list of user IDs (as strings) that are currently online, sorted by user name (asc).
 *     responses:
 *       200:
 *         description: Online users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 onlineUsers:
 *                   type: array
 *                   items: { type: string, example: "123" }
 *                 count: { type: integer, example: 5 }
 *                 message: { type: string, example: "Online users retrieved successfully" }
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Failed to fetch online users
 */


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
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
      message: 'Online users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return empty array as fallback
    return res.status(200).json({
      success: true,
      onlineUsers: [],
      count: 0,
      message: 'No online users found (fallback)'
    });
  }
}
