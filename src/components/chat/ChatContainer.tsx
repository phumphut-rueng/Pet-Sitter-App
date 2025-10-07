import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  selectedChat?: {
    id: string;
    name: string;
    avatar?: string;
  };
  messages?: Message[];
  onSendMessage?: (message: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  className = '',
  selectedChat,
  messages = sampleMessages,
  onSendMessage
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (onSendMessage) {
      onSendMessage(messageInput);
    }
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-white h-full ${className}`}>
      {/* Header */}
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={selectedChat?.avatar || '/images/landing_page/lovely-pet-portrait-isolated.svg'}
              alt={selectedChat?.name || 'User'}
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {selectedChat?.name || 'Select a conversation'}
          </h3>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4">
                <Image
                  src="/icons/PinkPaw.svg"
                  alt="Paw print"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <p className="text-gray-500 text-lg">Start a conversation!</p>
            </div>
          </div>
        ) : (
          // Messages
          <div ref={scrollContainerRef} className="space-y-4">
            {messages.map((msg) => (
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
        )}
      </div>

      {/* Message Input Area */}
      <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Attachment button */}
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Message input */}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
