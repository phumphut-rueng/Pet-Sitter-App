import React from 'react';
import Image from 'next/image';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp?: string;
  isImage?: boolean;
  imageUrl?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  sender,
  avatar,
  timestamp,
  isImage = false,
  imageUrl
}) => {
  
  const isUser = sender === 'user';

  return (
    <div className="mb-4">
      {/* Timestamp - Center aligned like Facebook */}
      {timestamp && (
        <div className="flex justify-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {timestamp}
          </span>
        </div>
      )}
      
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%]`}>
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
              className={`px-4 py-3 max-w-full rounded-lg ${
                isUser
                  ? 'bg-orange-500 text-white' // Orange background for user messages
                  : 'bg-white border border-gray-200 text-gray-900' // White background for other messages
              }`}
            >
              {isImage && imageUrl ? (
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Message image"
                    className="max-w-full max-h-64 object-contain"
                    width={200}
                    height={200}
                  />
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
