import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API endpoint สำหรับ trigger real-time notification update
 * ใช้โดย API อื่นๆ เพื่อแจ้ง frontend ให้อัปเดต notification
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Trigger real-time notification refresh
    // ส่ง event ไปยัง frontend ผ่าน Socket.IO server
    try {
      const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://pet-sitter-socket-server-production.up.railway.app';
      await axios.post(`${socketServerUrl}/emit-notification-refresh`, {
        userId: parseInt(userId)
      });
    } catch {
      // Fallback: ส่ง event ผ่าน global
      if (typeof global !== 'undefined' && global.window) {
        global.window.dispatchEvent(new CustomEvent('socket:notification_refresh', {
          detail: { userId: parseInt(userId) }
        }));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Real-time notification update triggered'
    });
  } catch (error) {
    console.error('Error triggering real-time update:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
