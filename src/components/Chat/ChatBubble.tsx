import React from 'react';

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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
        {/* Avatar */}
        {avatar && isUser === false && (
          <div className={`ml-3 flex-shrink-0`}>
            <img
              src={avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover sm"
            />
          </div>
        )}

        {/* Message Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 max-w-full ${
              isUser
                ? 'bg-orange-6 text-brand-text rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                : 'bg-white border-1 border-gray-2 text-gray-9 rounded-tl-lg rounded-tr-lg rounded-br-lg'
            }`}
          >
            {isImage && imageUrl ? (
              <div className="bg-gray-2 rounded-lg flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Message image"
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            ) : (
              <p className="text-sm leading-relaxed wrap-anywhere">{message}</p>
            )}
          </div>

          {/* Timestamp */}
          {timestamp && (
            <span className="text-xs text-gray-7 mt-1 px-2">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
