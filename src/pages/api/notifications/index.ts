import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma/prisma';

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       401:
 *         description: Unauthorized
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
 *                   example: "Unauthorized"
 *   patch:
 *     tags: [Notifications]
 *     summary: Update notification status
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [markAsRead, markAllAsRead]
 *                 example: markAsRead
 *               notificationId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Notification updated successfully
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
 *                   example: "Notification marked as read"
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
 *                   example: "Invalid action"
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 123
 *     responses:
 *       200:
 *         description: Notification deleted successfully
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
 *                   example: "Notification deleted"
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
 *                   example: "Notification ID is required"
 */

// Helper function to get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบ authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    });
  }

  if (req.method === 'GET') {
    try {
      // Session user ID validated
      
      const userId = parseInt(session.user.id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const notifications = await prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          is_read: true,
          created_at: true,
        }
      });

      // แปลงข้อมูลให้ตรงกับ frontend
      const formattedNotifications = notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.is_read,
        time: getTimeAgo(notif.created_at),
        createdAt: notif.created_at.toISOString(),
      }));

      const unreadCount = notifications.filter(n => !n.is_read).length;

      return res.status(200).json({
        success: true,
        notifications: formattedNotifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: typeof session?.user?.id !== "undefined" ? session.user.id : undefined,
        sessionUserId: session.user.id
      });
      
      // Return empty notifications instead of error to prevent frontend crash
      return res.status(200).json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { action, notificationId } = req.body;
      const userId = parseInt(session.user.id);

      if (action === 'markAsRead' && notificationId) {
        await prisma.notification.update({
          where: { 
            id: parseInt(notificationId),
            user_id: userId
          },
          data: { 
            is_read: true,
            updated_at: new Date()
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Notification marked as read'
        });
      }

      if (action === 'markAllAsRead') {
        await prisma.notification.updateMany({
          where: { 
            user_id: userId,
            is_read: false
          },
          data: { 
            is_read: true,
            updated_at: new Date()
          }
        });

        return res.status(200).json({
          success: true,
          message: 'All notifications marked as read'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { notificationId } = req.query;
      const userId = parseInt(session.user.id);

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      await prisma.notification.delete({
        where: { 
          id: parseInt(notificationId as string),
          user_id: userId
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
