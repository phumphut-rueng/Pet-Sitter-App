import React, { useState, useEffect } from 'react';
import { useSocketContext } from './SocketProvider';
import { SendMessageData } from '@/types/socket.types';
import ChatList from './ChatList';
import ChatContainer from './ChatContainer';
import MessageNotification from './MessageNotification';

const ChatPage: React.FC = () => {
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
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [receiverId, setReceiverId] = useState('2');
  const [createChatMode, setCreateChatMode] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = () => {
    console.log('=== DEBUG SEND MESSAGE ===');
    console.log('messageInput:', messageInput);
    console.log('isConnected:', isConnected);
    console.log('userId:', userId);
    console.log('selectedChatId:', selectedChatId);
    console.log('receiverId:', receiverId);

    if (!messageInput.trim()) {
      console.log('❌ No message input');
      return;
    }

    if (!isConnected) {
      console.log('❌ Not connected to socket');
      return;
    }

    if (!userId) {
      console.log('❌ No user ID');
      return;
    }

    if (!receiverId) {
      console.log('❌ No receiver ID');
      return;
    }

    // ถ้ายังไม่มี selectedChatId ให้สร้าง chat ใหม่ก่อน
    if (!selectedChatId && receiverId) {
      console.log('🔄 Creating new chat and sending message');
      createNewChatAndSendMessage();
      return;
    }

    console.log('📤 Sending message to existing chat');
    const messageData: SendMessageData = {
      chatId: parseInt(selectedChatId),
      senderId: userId,
      receiverId: receiverId,
      content: messageInput.trim(),
      messageType: 'TEXT',
    };

    console.log('Message data:', messageData);
    sendMessage(messageData);
    setMessageInput('');
  };

  const createNewChatAndSendMessage = async () => {
    console.log('=== DEBUG CREATE CHAT ===');
    console.log('receiverId:', receiverId);
    console.log('userId:', userId);

    if (!receiverId || !userId) {
      console.log('❌ Missing receiverId or userId');
      return;
    }

    try {
      console.log('📡 Calling /api/chat/create with:', { otherUserId: receiverId });
      
      const response = await fetch(`/api/chat/create?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otherUserId: receiverId,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat created successfully:', data);
        
        const newChatId = data.chat.id.toString();
        setSelectedChatId(newChatId);
        
        // ส่งข้อความหลังจากสร้าง chat สำเร็จ
        const messageData: SendMessageData = {
          chatId: data.chat.id,
          senderId: userId,
          receiverId: receiverId,
          content: messageInput.trim(),
          messageType: 'TEXT',
        };

        console.log('📤 Sending message after chat creation:', messageData);
        sendMessage(messageData);
        setMessageInput('');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create chat:', errorData);
        alert(`ไม่สามารถสร้าง Chat ได้: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง Chat');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถใช้งาน Chat ได้</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageNotification />
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pet Sitter Chat</h1>
          
          {/* Connection Status */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isLoading ? 'กำลังเชื่อมต่อ...' : isConnected ? 'Real-time เชื่อมต่อแล้ว' : 'ไม่เชื่อมต่อ'}
              </span>
            </div>
            <span className="text-sm text-gray-600">User ID: {userId}</span>
            <span className="text-sm text-gray-600">Online: {onlineUsers.length} คน</span>
            {messages.length > 0 && (
              <span className="text-sm text-blue-600">Real-time Messages: {messages.length}</span>
            )}
          </div>

          {/* Chat Info & Controls */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">
                  {selectedChatId ? `Chat ID: ${selectedChatId}` : 'เริ่มต้น Chat ใหม่'}
                </h3>
                <p className="text-sm text-gray-600">
                  ส่งข้อความไปหา User ID: {receiverId}
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  placeholder="ใส่ User ID ที่ต้องการแชท"
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setCreateChatMode(!createChatMode)}
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  {createChatMode ? 'ยกเลิก' : 'สร้าง Chat'}
                </button>
              </div>
            </div>
            
            {/* Message Input - แสดงตลอดเวลา */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={selectedChatId ? "พิมพ์ข้อความ..." : "พิมพ์ข้อความเพื่อเริ่ม Chat ใหม่..."}
                className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || !messageInput.trim() || !receiverId}
                className={`px-6 py-3 rounded transition-colors font-medium ${
                  !isConnected || !messageInput.trim() || !receiverId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {!isConnected ? 'ไม่เชื่อมต่อ' : !receiverId ? 'ใส่ User ID' : !messageInput.trim() ? 'พิมพ์ข้อความ' : 'ส่ง'}
              </button>
            </div>
            
            {/* Helper Text & Debug Info */}
            {!selectedChatId && receiverId && (
              <p className="text-xs text-blue-600 mt-2">
                💡 ใส่ User ID และพิมพ์ข้อความเพื่อเริ่ม Chat ใหม่
              </p>
            )}
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-3">
            <div className="pr-2">
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChatId}
              />
            </div>
          </div>

          {/* Chat Container */}
          <div className="lg:col-span-9">
            <div className="space-y-4">
              {/* Chat Messages */}
              <ChatContainer 
                chatId={selectedChatId}
                className="min-h-96"
              />
              
              {/* Quick Actions */}
              {!selectedChatId && (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">เริ่มต้นการแชท</h3>
                  <p className="text-gray-600 mb-4">
                    เลือก Chat จากรายการด้านซ้าย หรือใส่ User ID เพื่อเริ่ม Chat ใหม่
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setReceiverId('2')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      ทดสอบกับ User ID: 2
                    </button>
                    <button
                      onClick={() => setReceiverId('3')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      ทดสอบกับ User ID: 3
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
