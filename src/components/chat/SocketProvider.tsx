import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessagePayload, UnreadUpdateData, ChatListUpdateData, SendMessageData } from '@/types/socket.types';
import axios from 'axios';
import SocketLoading from '@/components/loading/SocketLoading';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | undefined;
  sendMessage: (data: SendMessageData) => void;
  messages: MessagePayload[];
  unreadUpdates: UnreadUpdateData[];
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, isConnected, isLoading, isAuthenticated, userId, isSocketReady, isWaitingForSocket } = useSocket();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [unreadUpdates, setUnreadUpdates] = useState<UnreadUpdateData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = (data: SendMessageData) => {
    if (socket && socket.connected) {
      socket.emit('send_message', data);
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  };

        useEffect(() => {
    // Copy ref values to avoid cleanup warnings
    const currentProcessedIds = processedMessageIds.current;

    // โหลด online users เริ่มต้นจาก API
    const fetchOnlineUsers = async () => {
      try {
        const response = await axios.get('/api/chat/online-users');
        
        if (response.data.success) {
          setOnlineUsers(response.data.onlineUsers);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    // เรียกใช้เมื่อ component mount
    if (isConnected) {
      fetchOnlineUsers();
    }

    // ฟังก์ชันสำหรับจัดการ custom events
    const handleReceiveMessage = async (event: CustomEvent<MessagePayload>) => {
      const message = event.detail;
      
      // สร้าง unique key สำหรับข้อความ
      const messageKey = `${message.id || message.senderId}-${message.content}-${message.timestamp}`;
      
      // ตรวจสอบว่าเป็นข้อความใหม่หรือไม่ (ใช้ useRef เพื่อป้องกันการสร้าง notification ซ้ำ)
      if (processedMessageIds.current.has(messageKey)) {
        console.log(' Duplicate message detected, skipping notification creation');
        return;
      }
      
      // เพิ่ม message key ลงใน Set
      processedMessageIds.current.add(messageKey);
      
      setMessages(prev => [...prev, message]);
      
      // สร้าง notification สำหรับข้อความใหม่ (เฉพาะเมื่อผู้ใช้ปัจจุบันเป็นผู้รับ)
      if (message.senderId !== userId) {
        try {
          const response = await axios.post('/api/notifications/create', {
            userId: parseInt(userId || '0'),
            type: 'message',
            title: 'New Message',
            message: `You have a new message from ${message.senderName}`,
          });
          
          if (response.data.success) {
            // Trigger notification refresh
            window.dispatchEvent(new CustomEvent('socket:notification_refresh', { 
              detail: { userId: parseInt(userId || '0') } 
            }));
          }
        } catch (error) {
          console.error('Failed to create notification:', error);
        }
      }
    };

    const handleUnreadUpdate = (event: CustomEvent<UnreadUpdateData>) => {
      setUnreadUpdates(prev => [...prev, event.detail]);
    };

    const handleUserOnline = (event: CustomEvent<string>) => {
      setOnlineUsers(prev => {
        // ตรวจสอบว่า user ID นี้ยังไม่อยู่ในรายการ
        if (!prev.includes(event.detail)) {
          return [...prev, event.detail];
        }
        return prev;
      });
    };

    const handleUserOffline = (event: CustomEvent<string>) => {
      setOnlineUsers(prev => prev.filter(id => id !== event.detail));
    };

    const handleOnlineUsersList = (event: CustomEvent<string[]>) => {
      setOnlineUsers(event.detail);
    };

    const handleChatListUpdate = (event: CustomEvent<ChatListUpdateData>) => {
      // ส่ง event ไปให้ ChatWidget เพื่อ refresh chat list
      window.dispatchEvent(new CustomEvent('refresh_chat_list', { detail: event.detail }));
    };

    const handleConnectionError = (event: CustomEvent<Error>) => {
      console.error('Socket connection error received:', event.detail);
      // Can add logic for error handling here
    };

           // Add handler for notification refresh
           const handleNotificationRefresh = async (event: CustomEvent) => {
             const { userId: refreshUserId } = event.detail;

             // If it's the current user, fetch new notification count
             if (refreshUserId === parseInt(userId || '0')) {
               try {
                 // Trigger notification count update
                 // Send event to NotificationBell component
                 window.dispatchEvent(new CustomEvent('update:notification_count'));
               } catch (error) {
                 console.error('Failed to update notification count:', error);
               }
             }
           };

    // Add event listeners
    window.addEventListener('socket:receive_message', handleReceiveMessage as unknown as EventListener);
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    window.addEventListener('socket:user_online', handleUserOnline as EventListener);
    window.addEventListener('socket:user_offline', handleUserOffline as EventListener);
    window.addEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
    window.addEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);
    window.addEventListener('socket:connection_error', handleConnectionError as EventListener);
    window.addEventListener('socket:notification_refresh', handleNotificationRefresh as unknown as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('socket:receive_message', handleReceiveMessage as unknown as EventListener);
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
      window.removeEventListener('socket:user_online', handleUserOnline as EventListener);
      window.removeEventListener('socket:user_offline', handleUserOffline as EventListener);
      window.removeEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
      window.removeEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);
      window.removeEventListener('socket:connection_error', handleConnectionError as EventListener);
      window.removeEventListener('socket:notification_refresh', handleNotificationRefresh as unknown as EventListener);
      
           // Clear processed message IDs
           currentProcessedIds.clear();
    };
  }, [isConnected, messages, userId]);


  const value: SocketContextType = {
    socket,
    isConnected,
    isLoading,
    isAuthenticated,
    userId,
    sendMessage,
    messages,
    unreadUpdates,
    onlineUsers,
  };

  // แสดง loading เฉพาะเมื่อ socket server instance กำลังถูกสร้างครั้งแรกบน server
  // (เมื่อ !res.socket?.server?.io === true)
  const shouldShowLoading = isAuthenticated && isWaitingForSocket && !isSocketReady;
  
  if (shouldShowLoading) {
    return <SocketLoading message="Initializing chat server instance..." />;
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
