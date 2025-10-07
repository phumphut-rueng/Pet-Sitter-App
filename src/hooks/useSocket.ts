import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket, disconnectSocket, getSocket } from '@/utils/socket';
import { SocketEvents } from '@/types/socket.types';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อ user login แล้ว
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Connecting socket for user:', session.user.id);
      socketRef.current = connectSocket(session.user.id);
    }

    // disconnect เมื่อ user logout หรือ component unmount
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [status, session?.user?.id]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userId: session?.user?.id,
  };
};

