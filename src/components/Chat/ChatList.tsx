import React, { useState } from 'react';
import sampleChats from '../../utils/mockChatListData';

const ChatList: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>('1');

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg">
      {sampleChats.map((chat) => {
        const isSelected = selectedChatId === chat.id;
        
        return (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            className={`p-4 cursor-pointer transition-colors duration-200 border-b border-gray-2 last:border-b-0 ${
              isSelected
                ? 'bg-gray-6' // selected state - เทาอ่อน
                : 'bg-black text-white' // default state - สีดำ
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={chat.avatar || '/images/landing_page/lovely-pet-portrait-isolated.svg'}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {/* Online indicator */}
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium truncate text-white`}>
                    {chat.name}
                  </h4>
                  <span className={`text-xs text-gray-4`}>
                    {chat.timestamp}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate text-gray-4`}>
                    {chat.lastMessage}
                  </p>
                  
                  {/* Unread count badge */}
                  
                    <div className="flex-shrink-0 ml-2 ">
                      <span className= {`inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white 
                         ${chat.unreadCount > 0 ? 'bg-orange-5' : ''} 
                         rounded-full min-w-[20px] h-5`}>
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    </div>
                  
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;