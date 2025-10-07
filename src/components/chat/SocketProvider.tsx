import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MessagePayload, UnreadUpdateData } from '@/types/socket.types';

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
      setOnlineUsers(prev => [...prev, event.detail]);
    };

    const handleUserOffline = (event: CustomEvent<string>) => {
      console.log('User offline via custom event:', event.detail);
      setOnlineUsers(prev => prev.filter(id => id !== event.detail));
    };

    // เพิ่ม event listeners
    window.addEventListener('socket:receive_message', handleReceiveMessage as EventListener);
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    window.addEventListener('socket:user_online', handleUserOnline as EventListener);
    window.addEventListener('socket:user_offline', handleUserOffline as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('socket:receive_message', handleReceiveMessage as EventListener);
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
      window.removeEventListener('socket:user_online', handleUserOnline as EventListener);
      window.removeEventListener('socket:user_offline', handleUserOffline as EventListener);
    };
  }, []);

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
