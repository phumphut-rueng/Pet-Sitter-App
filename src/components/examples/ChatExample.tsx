import React, { useState } from 'react';
import { useSocketContext } from '@/components/chat/SocketProvider';
import { SendMessageData } from '@/types/socket.types';

const ChatExample: React.FC = () => {
  const { 
    isConnected, 
    isLoading, 
    isAuthenticated, 
    userId, 
    sendMessage, 
    messages, 
    unreadUpdates, 
    onlineUsers 
  } = useSocketContext();

  const [messageInput, setMessageInput] = useState('');
  const [chatId, setChatId] = useState('1');
  const [receiverId, setReceiverId] = useState('2');

  const handleSendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;

    const messageData: SendMessageData = {
      chatId: parseInt(chatId),
      senderId: userId!,
      receiverId: receiverId,
      content: messageInput,
      messageType: 'TEXT',
    };

    sendMessage(messageData);
    setMessageInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <p className="text-red-700">กรุณาเข้าสู่ระบบก่อนใช้งาน Chat</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Chat Example with NextAuth & Socket.IO</h2>
        
        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {isLoading ? 'กำลังเชื่อมต่อ...' : isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่เชื่อมต่อ'}
            </span>
          </div>
          <p className="text-sm text-gray-600">User ID: {userId}</p>
          <p className="text-sm text-gray-600">Online Users: {onlineUsers.length}</p>
        </div>

        {/* Chat Settings */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chat ID:</label>
            <input
              type="number"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Receiver ID:</label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || !messageInput.trim()}
              className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ส่ง
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">ข้อความล่าสุด:</h3>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">ยังไม่มีข้อความ</p>
            ) : (
              messages.slice(-10).map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">
                    {msg.senderId} → {msg.chatId}
                  </div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unread Updates */}
        {unreadUpdates.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">การอัปเดต Unread:</h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
              {unreadUpdates.slice(-5).map((update, index) => (
                <div key={index} className="mb-1 p-2 bg-yellow-50 rounded text-sm">
                  Chat {update.chatId}: {update.newUnreadCount} ข้อความใหม่
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">ผู้ใช้ที่ออนไลน์:</h3>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((userId) => (
                <span key={userId} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {userId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatExample;
