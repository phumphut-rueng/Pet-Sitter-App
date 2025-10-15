// file: utils/socket.ts

import { io, Socket } from 'socket.io-client';
import { SocketEvents, SendMessageData } from '@/types/socket.types';
import axios from 'axios';

let socket: Socket<SocketEvents> | null = null;
let isSocketServerReady = false;
let socketConnectionPromise: Promise<Socket<SocketEvents>> | null = null;

// ฟังก์ชันตรวจสอบว่า socket server พร้อมหรือไม่
export const checkSocketServerReady = async (): Promise<boolean> => {
  // ถ้าตรวจสอบแล้วว่า ready แล้ว ให้ return true ทันที
  if (isSocketServerReady) {
    return true;
  }
  
  try {
    const response = await axios.get('/api/chat/socket');
    
    if (response.status === 200) {
      isSocketServerReady = true;
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// ฟังก์ชันรอ socket server พร้อม
export const waitForSocketServer = async (maxAttempts: number = 10, delayMs: number = 500): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await checkSocketServerReady()) {
      return true;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('Socket server failed to become ready after', maxAttempts, 'attempts');
  return false;
};

export const connectSocket = (userId: string): Socket<SocketEvents> => {
  // ถ้ามี socket อยู่แล้วและเชื่อมต่ออยู่ ให้ return socket เดิม
  if (socket && socket.connected) {
    return socket;
  }

  // ถ้ามี connection promise อยู่แล้ว ให้ return socket ที่มีอยู่
  if (socketConnectionPromise && socket) {
    return socket;
  }

  // Get Socket.IO server URL from environment variable
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';
  
  const socketConfig = {
    path: '/socket.io', // Default Socket.IO path
    autoConnect: false, // ปิด auto connect เพื่อควบคุมการเชื่อมต่อ
    forceNew: true, // บังคับสร้าง connection ใหม่
    timeout: 20000, // เพิ่ม timeout เป็น 20 วินาที
    reconnection: true, // เปิดการ reconnect อัตโนมัติ
    reconnectionDelay: 2000, // รอ 2 วินาทีก่อน reconnect
    reconnectionAttempts: 5, // เพิ่มจำนวนการ reconnect เป็น 5 ครั้ง
    reconnectionDelayMax: 5000, // เพิ่มเวลารอสูงสุดเป็น 5 วินาที
    randomizationFactor: 0.5, // เพิ่มความสุ่มในการ reconnect
    transports: ['polling', 'websocket'], // เริ่มด้วย polling ก่อน
    upgrade: true, // อนุญาตให้ upgrade ไป WebSocket
    rememberUpgrade: false, // ไม่จำการ upgrade
    withCredentials: true // ส่ง credentials
  };

  console.log(`🔌 Connecting to Socket.IO server: ${socketServerUrl}`);
  socket = io(socketServerUrl, socketConfig);

  // เชื่อมต่อ socket หลังจากสร้างเสร็จ
  socket.connect();

  socket.on('connect', () => {
    socket?.emit('join_app', userId); // ส่ง ID ไปให้ Server จัดการ Private Room และ Presence
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // ถ้า connection ล้มเหลว 3 ครั้งติดต่อกัน ให้ใช้ polling fallback
    const socketWithRetry = socket as Socket & { retryCount?: number };
    const retryCount = socketWithRetry.retryCount || 0;
    socketWithRetry.retryCount = retryCount + 1;
    
    if (retryCount >= 3 && socket) {
      console.warn('🔄 Switching to polling-only mode due to repeated connection failures');
      socket.io.opts.transports = ['polling'];
      socket.disconnect();
      socket.connect();
    }
    
    // ส่ง event เพื่อแจ้ง frontend ว่าเกิด error
    window.dispatchEvent(new CustomEvent('socket:connection_error', { detail: error }));
  });

  socket.on('disconnect', () => {
    // Socket disconnected
  });

  // เพิ่มการจัดการ reconnect events
  (socket as Socket & { on: (event: string, callback: (...args: unknown[]) => void) => void }).on('reconnect', () => {
    // ส่ง join_app อีกครั้งหลังจาก reconnect
    socket?.emit('join_app', userId);
  });

  (socket as Socket & { on: (event: string, callback: (...args: unknown[]) => void) => void }).on('reconnect_attempt', () => {
    // Attempting to reconnect
  });

  (socket as Socket & { on: (event: string, callback: (...args: unknown[]) => void) => void }).on('reconnect_error', (error: Error) => {
    console.error('Reconnection error:', error);
  });

  (socket as Socket & { on: (event: string, callback: (...args: unknown[]) => void) => void }).on('reconnect_failed', () => {
    console.error('Reconnection failed after all attempts');
    // แสดงข้อความแจ้งผู้ใช้
    window.dispatchEvent(new CustomEvent('socket:reconnect_failed'));
  });

  // เพิ่ม Listener สำหรับ Real-Time Events
  socket.on('unread_update', (data) => {
    window.dispatchEvent(new CustomEvent('socket:unread_update', { detail: data }));
  });

  socket.on('receive_message', (message) => {
    window.dispatchEvent(new CustomEvent('socket:receive_message', { detail: message }));
  });

  socket.on('user_online', (userId) => {
    window.dispatchEvent(new CustomEvent('socket:user_online', { detail: userId }));
  });

  socket.on('user_offline', (userId) => {
    window.dispatchEvent(new CustomEvent('socket:user_offline', { detail: userId }));
  });

  socket.on('online_users_list', (onlineUsers) => {
    window.dispatchEvent(new CustomEvent('socket:online_users_list', { detail: onlineUsers }));
  });

  socket.on('chat_list_update', (data) => {
    window.dispatchEvent(new CustomEvent('socket:chat_list_update', { detail: data }));
  });

  // เพิ่ม error handler สำหรับ error ที่ส่งมาจาก server
  (socket as Socket & { on: (event: string, callback: (...args: unknown[]) => void) => void }).on('error', (error: Error) => {
    console.error('Server error:', error);
    window.dispatchEvent(new CustomEvent('socket:server_error', { detail: error }));
  });

  return socket;
};

// ฟังก์ชันสำหรับส่งข้อความ
export const sendMessage = (data: SendMessageData): void => {
  if (socket && socket.connected) {
    socket.emit('send_message', data);
  } else {
    console.error('❌ Socket not connected. Cannot send message.');
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  // รีเซ็ต global state เมื่อ disconnect
  isSocketServerReady = false;
  socketConnectionPromise = null;
  
  // ลบ socket state จาก localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('socket-state');
    } catch {
      // Ignore localStorage errors
    }
  }
};

export const getSocket = (): Socket<SocketEvents> | null => {
  return socket;
};

// ฟังก์ชันสำหรับจัดการ visibility change (เมื่อผู้ใช้กลับมาใช้หน้าจอ)
export const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }
};

// ฟังก์ชันสำหรับเริ่มต้น visibility change listener
export const initVisibilityListener = () => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
