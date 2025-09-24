import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import sampleMessagesData from '../../utils/mockChatData';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp: string;
  isImage?: boolean;
  imageUrl?: string;
}

// Type the sampleMessages with Message interface
const sampleMessages: Message[] = sampleMessagesData as Message[];


interface ChatContainerProps {
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  className = '' 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed p-4 ${className}`}>
      <h3 className="bg-gray-1 p-4 text-black text-lg font-semibold text-gray-8 mb-4">Chat Bubble</h3>
      <div ref={scrollContainerRef} className="space-y-2 max-h-150 overflow-y-auto">
        {sampleMessages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.message}
            sender={msg.sender}
            avatar={msg.avatar}
            timestamp={msg.timestamp}
            isImage={msg.isImage}
            imageUrl={msg.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatContainer;
