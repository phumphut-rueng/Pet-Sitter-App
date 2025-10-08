import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessagePayload, UnreadUpdateData, ChatListUpdateData } from '@/types/socket.types';
import axios from 'axios';

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
  const { socket, isConnected, isLoading, isAuthenticated, userId } = useSocket();
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
          console.log('Loaded initial online users:', response.data.onlineUsers);
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
      console.log('Received message via custom event:', event.detail);
      setMessages(prev => [...prev, event.detail]);
    };

    const handleUnreadUpdate = (event: CustomEvent<UnreadUpdateData>) => {
      console.log('Unread update via custom event:', event.detail);
      setUnreadUpdates(prev => [...prev, event.detail]);
    };

    const handleUserOnline = (event: CustomEvent<string>) => {
      console.log('User online via custom event:', event.detail);
      setOnlineUsers(prev => {
        // ตรวจสอบว่า user ID นี้ยังไม่อยู่ในรายการ
        if (!prev.includes(event.detail)) {
          return [...prev, event.detail];
        }
        return prev;
      });
    };

    const handleUserOffline = (event: CustomEvent<string>) => {
      console.log('User offline via custom event:', event.detail);
      setOnlineUsers(prev => prev.filter(id => id !== event.detail));
    };

    const handleOnlineUsersList = (event: CustomEvent<string[]>) => {
      console.log('Online users list via custom event:', event.detail);
      setOnlineUsers(event.detail);
    };

    const handleChatListUpdate = (event: CustomEvent<ChatListUpdateData>) => {
      console.log('Chat list update via custom event:', event.detail);
      // ส่ง event ไปให้ ChatWidget เพื่อ refresh chat list
      window.dispatchEvent(new CustomEvent('refresh_chat_list', { detail: event.detail }));
    };

    // เพิ่ม event listeners
    window.addEventListener('socket:receive_message', handleReceiveMessage as EventListener);
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    window.addEventListener('socket:user_online', handleUserOnline as EventListener);
    window.addEventListener('socket:user_offline', handleUserOffline as EventListener);
    window.addEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
    window.addEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('socket:receive_message', handleReceiveMessage as EventListener);
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
      window.removeEventListener('socket:user_online', handleUserOnline as EventListener);
      window.removeEventListener('socket:user_offline', handleUserOffline as EventListener);
      window.removeEventListener('socket:online_users_list', handleOnlineUsersList as EventListener);
      window.removeEventListener('socket:chat_list_update', handleChatListUpdate as EventListener);
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

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
