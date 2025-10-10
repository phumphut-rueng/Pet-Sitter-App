// file: utils/socket.ts

import { io, Socket } from 'socket.io-client';
import { SocketEvents, SendMessageData } from '@/types/socket.types';

let socket: Socket<SocketEvents> | null = null;

// ฟังก์ชันตรวจสอบว่า socket server พร้อมหรือไม่
export const checkSocketServerReady = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/chat/socket', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Socket server not ready yet:', error);
    return false;
  }
};

// ฟังก์ชันรอ socket server พร้อม
export const waitForSocketServer = async (maxAttempts: number = 10, delayMs: number = 500): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Checking socket server readiness (attempt ${attempt}/${maxAttempts})...`);
    
    if (await checkSocketServerReady()) {
      console.log('Socket server is ready!');
      return true;
    }
    
    if (attempt < maxAttempts) {
      console.log(`Socket server not ready, waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('Socket server failed to become ready after', maxAttempts, 'attempts');
  return false;
};

export const connectSocket = (userId: string): Socket<SocketEvents> => {
  // ถ้ามี socket อยู่แล้วและเชื่อมต่ออยู่ ให้ disconnect ก่อน
  if (socket && socket.connected) {
    console.log('Disconnecting existing socket before reconnecting');
    socket.disconnect();
    socket = null;
  }
  
  console.log('Creating new socket connection for user:', userId);
  socket = io({ 
    path: '/api/chat/socket',
    autoConnect: false, // ปิด auto connect เพื่อควบคุมการเชื่อมต่อ
    forceNew: true, // บังคับสร้าง connection ใหม่
    timeout: 10000, // ลด timeout เป็น 10 วินาที
    reconnection: true, // เปิดการ reconnect อัตโนมัติ
    reconnectionDelay: 1000, // รอ 1 วินาทีก่อน reconnect
    reconnectionAttempts: 3, // ลดจำนวนการ reconnect เป็น 3 ครั้ง
    reconnectionDelayMax: 3000, // ลดเวลารอสูงสุดเป็น 3 วินาที
    randomizationFactor: 0.5 // เพิ่มความสุ่มในการ reconnect
  });

  // เชื่อมต่อ socket หลังจากสร้างเสร็จ
  socket.connect();

  socket.on('connect', () => {
    console.log('Socket connected successfully');
    socket?.emit('join_app', userId); // ส่ง ID ไปให้ Server จัดการ Private Room และ Presence
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    // ส่ง event เพื่อแจ้ง frontend ว่าเกิด error
    window.dispatchEvent(new CustomEvent('socket:connection_error', { detail: error }));
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  // เพิ่มการจัดการ reconnect events (ใช้ any type เพื่อหลีกเลี่ยง type errors)
  (socket as any).on('reconnect', (attemptNumber: number) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
    // ส่ง join_app อีกครั้งหลังจาก reconnect
    socket?.emit('join_app', userId);
  });

  (socket as any).on('reconnect_attempt', (attemptNumber: number) => {
    console.log('Attempting to reconnect...', attemptNumber);
  });

  (socket as any).on('reconnect_error', (error: any) => {
    console.error('Reconnection error:', error);
  });

  (socket as any).on('reconnect_failed', () => {
    console.error('Reconnection failed after all attempts');
    // แสดงข้อความแจ้งผู้ใช้
    window.dispatchEvent(new CustomEvent('socket:reconnect_failed'));
  });

  // เพิ่ม Listener สำหรับ Real-Time Events
  socket.on('unread_update', (data) => {
    console.log('Unread Badge Update:', data);
    window.dispatchEvent(new CustomEvent('socket:unread_update', { detail: data }));
  });

  socket.on('receive_message', (message) => {
    console.log('Received message:', message);
    window.dispatchEvent(new CustomEvent('socket:receive_message', { detail: message }));
  });

  socket.on('user_online', (userId) => {
    console.log('User online:', userId);
    window.dispatchEvent(new CustomEvent('socket:user_online', { detail: userId }));
  });

  socket.on('user_offline', (userId) => {
    console.log('User offline:', userId);
    window.dispatchEvent(new CustomEvent('socket:user_offline', { detail: userId }));
  });

  socket.on('online_users_list', (onlineUsers) => {
    console.log('Online users list:', onlineUsers);
    window.dispatchEvent(new CustomEvent('socket:online_users_list', { detail: onlineUsers }));
  });

  socket.on('chat_list_update', (data) => {
    console.log('Chat list update:', data);
    window.dispatchEvent(new CustomEvent('socket:chat_list_update', { detail: data }));
  });

  // เพิ่ม error handler สำหรับ error ที่ส่งมาจาก server
  (socket as any).on('error', (error: any) => {
    console.error('Server error:', error);
    window.dispatchEvent(new CustomEvent('socket:server_error', { detail: error }));
  });

  return socket;
};

// ฟังก์ชันสำหรับส่งข้อความ
export const sendMessage = (data: SendMessageData): void => {
  if (socket && socket.connected) {
    console.log('Sending message:', data);
    socket.emit('send_message', data);
  } else {
    console.error('Socket not connected. Cannot send message.');
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket<SocketEvents> | null => {
  return socket;
};

// ฟังก์ชันสำหรับจัดการ visibility change (เมื่อผู้ใช้กลับมาใช้หน้าจอ)
export const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    console.log('Page became visible, checking socket connection...');
    if (socket && !socket.connected) {
      console.log('Socket disconnected, attempting to reconnect...');
      socket.connect();
    }
  } else {
    console.log('Page became hidden');
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
