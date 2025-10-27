import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useSocketContext } from './SocketProvider';
import { MessageSquare } from 'lucide-react';

const MessageNotification: React.FC = () => {
  const { messages, userId } = useSocketContext();
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const router = useRouter();

  // Reset lastMessageCount เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setLastMessageCount(messages.length);
  }, [router.pathname, messages.length]);

  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount >= 0) {
      const latestMessage = messages[messages.length - 1];
      
      // ตรวจสอบว่าเป็นข้อความที่ส่งมาหาผู้ใช้ปัจจุบันหรือไม่ (ไม่ใช่ข้อความที่ผู้ใช้ส่งเอง)
      const isMessageForCurrentUser = latestMessage.senderId !== userId;
      
      // ตรวจสอบว่าผู้ใช้ไม่ได้อยู่หน้าแชท
      const isNotOnChatPage = !router.pathname.startsWith('/chat');
      
      if (isMessageForCurrentUser && isNotOnChatPage) {
        // Show toast notification for new message
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } w-auto max-w-sm bg-white text-orange-5 border-none rounded-xl p-3 shadow-lg pointer-events-auto`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-orange-5 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm2-medium text-orange-5">
                  New Message from {latestMessage.senderName}!
                </p>
              </div>
            </div>
          </div>
        ), {
          duration: 3000, // 3 วินาทีแล้วหายไป
          position: 'top-right',
        });
      }
    }
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, userId, router.pathname]);

  // Component ไม่ต้อง render อะไร เพราะใช้ toast แทน
  return null;
};

export default MessageNotification;
