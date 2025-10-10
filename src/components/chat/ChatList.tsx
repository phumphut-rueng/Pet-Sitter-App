import React from 'react';
import Image from 'next/image';

interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  className?: string;
  chats?: ChatListItem[];
}

const ChatList: React.FC<ChatListProps> = ({ 
  selectedChatId = '', 
  onChatSelect,
  className = '',
  chats = []
}) => {
  const handleChatSelect = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  return (
    <div className={`w-full md:w-80 lg:w-96 bg-black flex flex-col ${className}`}>
      {/* Messages Header */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-gray-800">
        <h2 className="text-white text-xl sm:text-2xl font-bold">Messages</h2>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center text-gray-400">
              <p className="text-sm sm:text-base">No conversations yet</p>
              <p className="text-xs sm:text-sm mt-2">Start chatting with someone!</p>
            </div>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-3 sm:p-4 cursor-pointer transition-colors duration-200 border-b border-gray-800 ${
                  isSelected
                    ? 'bg-gray-700' // selected state
                    : 'bg-black hover:bg-gray-900' // default state
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                      <Image
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    </div>
                    {/* Online indicator */}
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-black rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-medium truncate text-white">
                        {chat.name}
                      </h4>
                      <span className="text-[10px] sm:text-xs text-gray-400 ml-2 flex-shrink-0">
                        {chat.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm truncate text-gray-300 mr-2">
                        {chat.lastMessage}
                      </p>
                      
                      {/* Unread count badge */}
                      {chat.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded-full min-w-[18px] sm:min-w-[20px] h-4 sm:h-5">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;