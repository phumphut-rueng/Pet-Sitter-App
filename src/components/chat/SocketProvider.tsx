import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessagePayload, UnreadUpdateData, ChatListUpdateData } from '@/types/socket.types';
import axios from 'axios';
import SocketLoading from '@/components/loading/SocketLoading';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | undefined;
  sendMessage: (data: any) => void;
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

  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = (data: any) => {
    if (socket && socket.connected) {
      socket.emit('send_message', data);
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  };

  useEffect(() => {
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
    const handleReceiveMessage = (event: CustomEvent<MessagePayload>) => {
      setMessages(prev => [...prev, event.detail]);
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

    const handleConnectionError = (event: CustomEvent<any>) => {
      console.error('Socket connection error received:', event.detail);
      // สามารถเพิ่ม logic สำหรับจัดการ error ได้ที่นี่
    };

    // เพิ่ม event listeners
    window.addEventListener('socket:receive_message', handleReceiveMessage as EventListener);
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    window.addEventListener('socket:user_online', handleUserOnline as EventListener);
    window.addEventListener('socket:user_offline', handleUserOffline as EventListener);
    window.addEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
    window.addEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);
    window.addEventListener('socket:connection_error', handleConnectionError as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('socket:receive_message', handleReceiveMessage as EventListener);
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
      window.removeEventListener('socket:user_online', handleUserOnline as EventListener);
      window.removeEventListener('socket:user_offline', handleUserOffline as EventListener);
      window.removeEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
      window.removeEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);
      window.removeEventListener('socket:connection_error', handleConnectionError as EventListener);
    };
  }, [isConnected]);

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
