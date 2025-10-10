import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, disconnectSocket, getSocket, initVisibilityListener, waitForSocketServer } from '@/utils/socket';
import { SocketEvents } from '@/types/socket.types';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [isWaitingForSocket, setIsWaitingForSocket] = useState(false);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อ user login แล้ว
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Connecting socket for user:', session.user.id);
      
      const connectSocketWithRetry = async () => {
        setIsWaitingForSocket(true);
        setIsSocketReady(false);
        
        // เพิ่ม fallback timeout 8 วินาที
        const fallbackTimeout = setTimeout(() => {
          console.warn('Socket connection timeout, proceeding without socket');
          setIsSocketReady(true);
          setIsWaitingForSocket(false);
        }, 8000);
        
        try {
          // รอ socket server พร้อม (ลด timeout เป็น 3 วินาที)
          const serverReady = await waitForSocketServer(6, 500); // ลดจำนวนครั้งและเพิ่ม delay
          
          clearTimeout(fallbackTimeout); // ยกเลิก fallback timeout
          
          if (serverReady) {
            // เพิ่ม delay เล็กน้อยเพื่อให้ authentication เสร็จสมบูรณ์
            setTimeout(() => {
              socketRef.current = connectSocket(session.user.id);
              setIsSocketReady(true);
              setIsWaitingForSocket(false);
            }, 100);
          } else {
            console.warn('Socket server not ready, proceeding without socket');
            // ถ้า socket server ไม่พร้อม ให้ข้ามไปเลย
            setIsSocketReady(true); // ตั้งเป็น true เพื่อให้ loading หาย
            setIsWaitingForSocket(false);
          }
        } catch (error) {
          console.error('Error waiting for socket server:', error);
          clearTimeout(fallbackTimeout); // ยกเลิก fallback timeout
          // ถ้าเกิด error ให้ข้ามไปเลย
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
          console.log('Disconnecting socket');
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
        console.log('User logged out, disconnecting socket');
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

