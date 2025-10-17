import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useSocketContext } from './SocketProvider';

const MessageNotification: React.FC = () => {
  const { messages, userId } = useSocketContext();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const router = useRouter();

  // Reset lastMessageCount เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setLastMessageCount(messages.length);
  }, [router.pathname, messages.length]);

  useEffect(() => {
    console.log('MessageNotification: messages.length =', messages.length, 'lastMessageCount =', lastMessageCount);
    
    if (messages.length > lastMessageCount && lastMessageCount >= 0) {
      const latestMessage = messages[messages.length - 1];
      
      // ตรวจสอบว่าเป็นข้อความที่ส่งมาหาผู้ใช้ปัจจุบันหรือไม่ (ไม่ใช่ข้อความที่ผู้ใช้ส่งเอง)
      const isMessageForCurrentUser = latestMessage.senderId !== userId;
      
      // ตรวจสอบว่าผู้ใช้ไม่ได้อยู่หน้าแชท
      const isNotOnChatPage = !router.pathname.startsWith('/chat');
      
      console.log('MessageNotification: isMessageForCurrentUser =', isMessageForCurrentUser, 'isNotOnChatPage =', isNotOnChatPage);
      
      if (isMessageForCurrentUser && isNotOnChatPage) {
        console.log('MessageNotification: Showing toast for new message');
        // Show toast notification for new message
        toast.success(`📨 New Message from ${latestMessage.senderName}!`, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: 'var(--green-bg)',
            color: 'var(--green)',
            border: '1px solid rgba(28, 205, 131, 0.3)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 30px rgba(16,24,40,.12)',
          },
          iconTheme: { 
            primary: 'var(--green)', 
            secondary: '#fff' 
          },
        });
      }
    }
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, userId, router.pathname]);

  // Component ไม่ต้อง render อะไร เพราะใช้ toast แทน
  return null;
};

export default MessageNotification;
