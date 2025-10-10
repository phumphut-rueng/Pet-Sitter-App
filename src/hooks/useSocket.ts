import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, disconnectSocket, getSocket, initVisibilityListener, waitForSocketServer } from '@/utils/socket';
import { SocketEvents } from '@/types/socket.types';
import { Socket } from 'socket.io-client';

// Global state to track socket readiness across components
let globalSocketReady = false;
let globalSocketConnecting = false;

// Helper functions to manage socket state in localStorage
const getSocketState = () => {
  if (typeof window === 'undefined') return { ready: false, connecting: false };
  try {
    const state = localStorage.getItem('socket-state');
    return state ? JSON.parse(state) : { ready: false, connecting: false };
  } catch {
    return { ready: false, connecting: false };
  }
};

const setSocketState = (ready: boolean, connecting: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('socket-state', JSON.stringify({ ready, connecting }));
  } catch {
    // Ignore localStorage errors
  }
};

export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
  const [isSocketReady, setIsSocketReady] = useState(() => {
    const state = getSocketState();
    return state.ready;
  });
  const [isWaitingForSocket, setIsWaitingForSocket] = useState(false);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อ user login แล้ว
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Connecting socket for user:', session.user.id);
      
      // ตรวจสอบสถานะจาก localStorage
      const socketState = getSocketState();
      if (socketState.ready || socketState.connecting) {
        console.log('Socket already ready or connecting, skipping');
        setIsSocketReady(true);
        setIsWaitingForSocket(false);
        return;
      }
      
      const connectSocketWithRetry = async () => {
        setSocketState(false, true);
        globalSocketConnecting = true;
        setIsWaitingForSocket(true);
        setIsSocketReady(false);
        
        // เพิ่ม fallback timeout 8 วินาที
        const fallbackTimeout = setTimeout(() => {
          console.warn('Socket connection timeout, proceeding without socket');
          setSocketState(true, false);
          globalSocketReady = true;
          globalSocketConnecting = false;
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
              setSocketState(true, false);
              globalSocketReady = true;
              globalSocketConnecting = false;
              setIsSocketReady(true);
              setIsWaitingForSocket(false);
            }, 100);
          } else {
            console.warn('Socket server not ready, proceeding without socket');
            // ถ้า socket server ไม่พร้อม ให้ข้ามไปเลย
            setSocketState(true, false);
            globalSocketReady = true;
            globalSocketConnecting = false;
            setIsSocketReady(true); // ตั้งเป็น true เพื่อให้ loading หาย
            setIsWaitingForSocket(false);
          }
        } catch (error) {
          console.error('Error waiting for socket server:', error);
          clearTimeout(fallbackTimeout); // ยกเลิก fallback timeout
          // ถ้าเกิด error ให้ข้ามไปเลย
          setSocketState(true, false);
          globalSocketReady = true;
          globalSocketConnecting = false;
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
      // ถ้า user logout ให้ disconnect socket และรีเซ็ต global state
      if (socketRef.current) {
        console.log('User logged out, disconnecting socket');
        disconnectSocket();
        socketRef.current = null;
      }
      // รีเซ็ต global state และ localStorage เมื่อ logout
      setSocketState(false, false);
      globalSocketReady = false;
      globalSocketConnecting = false;
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

