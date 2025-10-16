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
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://pet-sitter-socket-server-production.up.railway.app';
    const response = await axios.get(`${socketServerUrl}/socket-status`, {
      timeout: 3000, // ตั้ง timeout สั้นๆ เพื่อไม่ให้รอนาน
    });
    
    if (response.status === 200 && response.data.isReady) {
      isSocketServerReady = true;
      return true;
    }
    return false;
  } catch (error) {
    // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
    // console.log('Socket server not available, continuing without real-time features');
    return false;
  }
};

// ฟังก์ชันรอ socket server พร้อม
export const waitForSocketServer = async (maxAttempts: number = 3, delayMs: number = 1000): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await checkSocketServerReady()) {
      return true;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
  // console.log('Socket server not available, continuing without real-time features');
  return false;
};

export const connectSocket = (userId: string): Socket<SocketEvents> | null => {
  // ถ้ามี socket อยู่แล้วและเชื่อมต่ออยู่ ให้ return socket เดิม
  if (socket && socket.connected) {
    return socket;
  }

  // ถ้ามี connection promise อยู่แล้ว ให้ return socket ที่มีอยู่
  if (socketConnectionPromise && socket) {
    return socket;
  }

  // Get Socket.IO server URL from environment variable
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://pet-sitter-socket-server-production.up.railway.app';
  
  const socketConfig = {
    path: '/socket.io', // Default Socket.IO path
    autoConnect: false, // ปิด auto connect เพื่อควบคุมการเชื่อมต่อ
    forceNew: true, // บังคับสร้าง connection ใหม่
    timeout: 5000, // ลด timeout เป็น 5 วินาที
    reconnection: false, // ปิดการ reconnect อัตโนมัติเพื่อไม่ให้พยายามเชื่อมต่อซ้ำๆ
    transports: ['polling'], // ใช้เฉพาะ polling เพื่อลดความซับซ้อน
    withCredentials: true // ส่ง credentials
  };

  // ไม่แสดง log เพื่อไม่รบกวนการทำงาน
  // console.log(`🔌 Connecting to Socket.IO server: ${socketServerUrl}`);
  socket = io(socketServerUrl, socketConfig);

  // เชื่อมต่อ socket หลังจากสร้างเสร็จ
  socket.connect();

  socket.on('connect', () => {
    socket?.emit('join_app', userId); // ส่ง ID ไปให้ Server จัดการ Private Room และ Presence
  });

  socket.on('connect_error', (error) => {
    // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
    // console.log('Socket connection not available, continuing without real-time features');
    
    // ส่ง event เพื่อแจ้ง frontend ว่าเกิด error (แต่ไม่แสดงใน console)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socket:connection_error', { detail: error }));
    }
  });

  socket.on('disconnect', () => {
    // Socket disconnected
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
    // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socket:server_error', { detail: error }));
    }
  });

  return socket;
};

// ฟังก์ชันสำหรับส่งข้อความ
export const sendMessage = (data: SendMessageData): void => {
  if (socket && socket.connected) {
    socket.emit('send_message', data);
  } else {
    // ไม่แสดง error ใน console เพื่อไม่รบกวนการทำงาน
    // console.log('Socket not connected. Message will be sent when connection is available.');
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

// ฟังก์ชันสำหรับตรวจสอบว่า socket พร้อมใช้งานหรือไม่
export const isSocketAvailable = (): boolean => {
  return socket !== null && socket.connected;
};

