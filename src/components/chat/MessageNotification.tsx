import React, { useEffect, useState } from 'react';
import { useSocketContext } from './SocketProvider';

const MessageNotification: React.FC = () => {
  const { messages } = useSocketContext();
  const [showNotification, setShowNotification] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0) {
      // Show notification for new message
      setShowNotification(true);
      
      // Play notification sound (if supported)
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore errors if audio can't play
        });
      } catch {
        // Ignore audio errors
      }

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">ข้อความใหม่!</span>
      </div>
    </div>
  );
};

export default MessageNotification;
