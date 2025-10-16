import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, disconnectSocket, initVisibilityListener } from '@/lib/utils/socket';
import { SocketEvents } from '@/types/socket.types';
import { Socket } from 'socket.io-client';
import axios from 'axios';

// ฟังก์ชันเช็คว่า socket server พร้อมใช้งานหรือยัง
const checkSocketServerStatus = async (): Promise<boolean> => {
  try {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';
    const response = await axios.get(`${socketServerUrl}/socket-status`);
    return response.data.isReady || false;
  } catch (error) {
    console.error('Error checking socket server status:', error);
    return false;
  }
};

export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isWaitingForSocket, setIsWaitingForSocket] = useState(false);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อ user login แล้ว
    if (status === 'authenticated' && session?.user?.id) {
      // ถ้า socket ยังเชื่อมต่ออยู่ ไม่ต้องทำอะไร
      if (socketRef.current?.connected) {
        setIsSocketReady(true);
        setIsWaitingForSocket(false);
        return;
      }
      
      const connectSocketWithRetry = async () => {
        try {
          // เช็คว่า socket server instance ถูกสร้างแล้วหรือยัง
          const isServerReady = await checkSocketServerStatus();
          
          if (!isServerReady) {
            // ถ้า server instance ยังไม่ถูกสร้าง แสดง loading
            setIsWaitingForSocket(true);
            setIsSocketReady(false);
            
            // เรียก API เพื่อกระตุ้นให้สร้าง socket server instance
            await axios.get('/api/chat/socket');
            
            // รอสักครู่เพื่อให้ server instance ถูกสร้างเสร็จ
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // สร้าง socket connection (ไม่แสดง loading ในขั้นตอนนี้)
          socketRef.current = connectSocket(session.user.id);
          
          setIsSocketReady(true);
          setIsWaitingForSocket(false);
        } catch (error) {
          console.error('Error initializing socket:', error);
          // แม้เกิด error ก็ปิด loading
          setIsSocketReady(true);
          setIsWaitingForSocket(false);
        }
      };
      
      connectSocketWithRetry();
      
      // เริ่มต้น visibility change listener
      const cleanupVisibilityListener = initVisibilityListener();
      
      // disconnect เมื่อ user logout หรือ component unmount
      return () => {
        if (socketRef.current) {
          disconnectSocket();
          socketRef.current = null;
        }
        setIsSocketReady(false);
        setIsWaitingForSocket(false);
        cleanupVisibilityListener();
      };
    } else if (status === 'unauthenticated') {
      // ถ้า user logout ให้ disconnect socket
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      setIsSocketReady(false);
      setIsWaitingForSocket(false);
    }
  }, [status, session?.user?.id]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userId: session?.user?.id,
    isSocketReady,
    isWaitingForSocket,
  };
};

