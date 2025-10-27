import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

/**
 * @openapi
 * /notifications/create:
 *   post:
 *     tags: [Notifications]
 *     summary: Create new notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification created successfully
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
 *                   example: "Notification created successfully"
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create notification"
 */

export interface CreateNotificationData {
  userId: number;
  type: 'message' | 'booking' | 'payment' | 'system' | 'admin';
  title: string;
  message: string;
}

/**
 * สร้าง notification ใหม่
 * ใช้สำหรับสร้าง notification จากระบบต่างๆ
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    console.log('Creating notification with data:', data);
    const notification = await prisma.notification.create({
      data: {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });

    console.log('Notification created successfully:', notification);
    return {
      success: true,
      notification,
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: 'Failed to create notification',
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { userId, type, title, message } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const result = await createNotification({
      userId: parseInt(userId),
      type,
      title,
      message,
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification: result.notification,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.error,
      });
    }
  } catch (error) {
    console.error('Error in create notification API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
