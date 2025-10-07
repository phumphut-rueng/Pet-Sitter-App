import React from 'react';
import sampleChats from '../../utils/mockChatListData';
import Image from 'next/image';

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({ 
  selectedChatId = '1', 
  onChatSelect,
  className = ''
}) => {
  const handleChatSelect = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  return (
    <div className={`w-80 bg-black flex flex-col ${className}`}>
      {/* Messages Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-white text-2xl font-bold">Messages</h2>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sampleChats.map((chat) => {
          const isSelected = selectedChatId === chat.id;
          
          return (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`p-4 cursor-pointer transition-colors duration-200 border-b border-gray-800 ${
                isSelected
                  ? 'bg-gray-700' // selected state
                  : 'bg-black hover:bg-gray-900' // default state
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={chat.avatar || '/images/landing_page/lovely-pet-portrait-isolated.svg'}
                      alt={chat.name}
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                  {/* Online indicator */}
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate text-white">
                      {chat.name}
                    </h4>
                    <span className="text-xs text-gray-400 ml-2">
                      {chat.timestamp}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm truncate text-gray-300">
                      {chat.lastMessage}
                    </p>
                    
                    {/* Unread count badge */}
                    {chat.unreadCount > 0 && (
                      <div className="flex-shrink-0 ml-2">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] h-5">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;