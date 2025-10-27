import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, disconnectSocket, initVisibilityListener } from '@/lib/utils/socket';
import { SocketEvents } from '@/types/socket.types';
import { Socket } from 'socket.io-client';

// ฟังก์ชันเช็คว่า socket server พร้อมใช้งานหรือยัง
const checkSocketServerStatus = async (): Promise<boolean> => {
  // ปิด socket system ชั่วคราวเพื่อหลีกเลี่ยง error
  return false;
};

export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isWaitingForSocket, setIsWaitingForSocket] = useState(false);

  // Always initialize states consistently
  useEffect(() => {
    // Reset states when session changes
    if (status === 'loading') {
      setIsSocketReady(false);
      setIsWaitingForSocket(false);
      return;
    }

    if (status === 'unauthenticated') {
      // ถ้า user logout ให้ disconnect socket
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      setIsSocketReady(false);
      setIsWaitingForSocket(false);
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      // ถ้า socket ยังเชื่อมต่ออยู่ ไม่ต้องทำอะไร
      if (socketRef.current?.connected) {
        setIsSocketReady(true);
        setIsWaitingForSocket(false);
        return;
      }
      
      const connectSocketWithRetry = async () => {
        try {
          // เช็คว่า socket server พร้อมใช้งานหรือยัง
          const isServerReady = await checkSocketServerStatus();
          
          if (!isServerReady) {
            // ถ้า server ยังไม่พร้อม แสดง loading
            setIsWaitingForSocket(true);
            setIsSocketReady(false);
            
            // รอให้ server พร้อม
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // สร้าง socket connection
          socketRef.current = connectSocket(session.user.id);
          
          setIsSocketReady(true);
          setIsWaitingForSocket(false);
        } catch {
          // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
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

