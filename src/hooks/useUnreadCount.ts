import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import axios from 'axios';

export const useUnreadCount = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  // ฟังก์ชันสำหรับดึง unread count จาก API
  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/chat/unread-count', {
        params: { userId }
      });
      
      if (response.data.success) {
        setUnreadCount(response.data.totalUnreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูล unread count เมื่อ component mount
  useEffect(() => {
    fetchUnreadCount();
  }, [userId]);

  // ฟัง unread_update event จาก socket
  useEffect(() => {
    if (socket) {
      const handleUnreadUpdate = (data: { chatId: number, newUnreadCount: number }) => {
        // อัปเดต unread count โดยรวม
        console.log('Received unread_update in navbar:', data);
        // Fetch ข้อมูลใหม่จาก API เพื่อความแม่นยำ
        fetchUnreadCount();
      };

      socket.on('unread_update', handleUnreadUpdate);

      return () => {
        socket.off('unread_update', handleUnreadUpdate);
      };
    }
  }, [socket, userId]);

  return {
    unreadCount,
    loading,
    hasUnread: unreadCount > 0,
    refreshUnreadCount: fetchUnreadCount
  };
};
