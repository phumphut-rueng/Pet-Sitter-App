// file: utils/socket.ts

import { io, Socket } from 'socket.io-client';
import { SocketEvents, SendMessageData } from '@/types/socket.types';

let socket: Socket<SocketEvents> | null = null;

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
    autoConnect: true,
    forceNew: true // บังคับสร้าง connection ใหม่
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully');
    socket?.emit('join_app', userId); // ส่ง ID ไปให้ Server จัดการ Private Room และ Presence
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  // เพิ่ม Listener สำหรับ Real-Time Unread Badge Update
  socket.on('unread_update', (data) => {
    console.log('Unread Badge Update:', data);
    // สามารถ dispatch event หรือ callback ที่นี่ได้
    window.dispatchEvent(new CustomEvent('socket:unread_update', { detail: data }));
  });

  socket.on('receive_message', (message) => {
    console.log('Received message:', message);
    // สามารถ dispatch event หรือ callback ที่นี่ได้
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
