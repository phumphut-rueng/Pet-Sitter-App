import React from 'react';
import Image from 'next/image';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp?: string;
  isImage?: boolean;
  imageUrl?: string;
  showTimestamp?: boolean; // เพิ่ม prop สำหรับควบคุมการแสดงเวลา
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  sender,
  avatar,
  timestamp,
  isImage = false,
  imageUrl,
  showTimestamp = false
}) => {
  
  const isUser = sender === 'user';

  return (
    <div className="mb-4">
      {/* Timestamp - Center aligned like Facebook - แสดงเฉพาะเมื่อ showTimestamp เป็น true */}
      {timestamp && showTimestamp && (
        <div className="flex justify-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {timestamp}
          </span>
        </div>
      )}
      
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%] sm:max-w-[70%]`}>
          {/* Avatar - Only show for incoming messages */}
          {avatar && !isUser && (
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          )}

          {/* Message Container */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Message Bubble */}
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 max-w-full ${
                isUser
                  ? 'bg-orange-500 text-white rounded-l-3xl rounded-tr-3xl' // Orange background for user messages
                  : 'bg-white border border-gray-200 text-gray-900 rounded-r-3xl rounded-tl-3xl' // White background for other messages
              }`}
            >
              {isImage && imageUrl ? (
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt="Message image"
                    className="max-w-full max-h-64 object-contain"
                    width={250}
                    height={250}
                  />
                </div>
              ) : (
                <p className="text-sm sm:text-base leading-relaxed">{message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
