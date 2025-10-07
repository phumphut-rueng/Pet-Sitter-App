import React, { useState } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatContainer from '@/components/chat/ChatContainer';
import { useSocketContext } from '@/components/chat/SocketProvider';
import sampleChats from '../../utils/mockChatListData';
import { chatMessages } from '../../utils/mockChatData';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp: string;
  isImage?: boolean;
  imageUrl?: string;
}

export default function ChatWidget() {
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const { isConnected, sendMessage, userId } = useSocketContext();

  const selectedChat = sampleChats.find(chat => chat.id === selectedChatId);
  
  // Get messages for the selected chat
  const messages: Message[] = (chatMessages as any)[selectedChatId] || [];

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !isConnected) return;

    const messageData = {
      chatId: parseInt(selectedChatId),
      senderId: userId!,
      receiverId: '2', // Mock receiver ID
      content: message,
      messageType: 'TEXT',
    };

    sendMessage(messageData);
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - ChatList Component */}
      <ChatList
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
      />

      {/* Right Main Area - Chat Container */}
      <div className="flex-1">
        <ChatContainer
          selectedChat={selectedChat}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}