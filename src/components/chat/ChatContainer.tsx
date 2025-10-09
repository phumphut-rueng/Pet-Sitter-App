import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ChatBubble from './ChatBubble';
import { uploadAndGetPublicId } from '@/lib/cloudinary/image-upload';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp: string;
  isImage?: boolean;
  imageUrl?: string;
}


interface ChatContainerProps {
  className?: string;
  selectedChat?: {
    id: string;
    name: string;
    avatar?: string;
  };
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  hasChats?: boolean; // เพิ่ม prop เพื่อตรวจสอบว่ามี chat ใน chatlist หรือไม่
  onHideChat?: (chatId: string) => void; // เพิ่ม prop สำหรับซ่อน chat
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  className = '',
  selectedChat,
  messages = [],
  onSendMessage,
  hasChats = true,
  onHideChat
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // ฟังก์ชันสำหรับตรวจสอบว่าควรแสดงเวลาหรือไม่ (เหมือน Facebook)
  const shouldShowTimestamp = (currentMessage: Message, previousMessage: Message | undefined, isFirstMessage: boolean): boolean => {
    // แสดงเวลาสำหรับข้อความแรก
    if (isFirstMessage) {
      return true;
    }

    // ถ้าไม่มีข้อความก่อนหน้า ให้แสดงเวลา
    if (!previousMessage) {
      return true;
    }

    // ตรวจสอบว่า timestamp มีค่าและถูกต้อง
    if (!currentMessage.timestamp || !previousMessage.timestamp) {
      return true; // แสดงเวลาถ้าข้อมูลไม่ครบ
    }

    const currentTime = new Date(currentMessage.timestamp);
    const previousTime = new Date(previousMessage.timestamp);

    // ตรวจสอบว่า Date object ถูกต้อง
    if (isNaN(currentTime.getTime()) || isNaN(previousTime.getTime())) {
      return true; // แสดงเวลาถ้าข้อมูลไม่ถูกต้อง
    }

    const timeDiffInMinutes = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);

    // แสดงเวลาถ้าเวลาห่างกันมากกว่า 5 นาที
    if (timeDiffInMinutes >= 5) {
      return true;
    }

    // แสดงเวลาถ้าข้ามวัน
    const currentDate = currentTime.toDateString();
    const previousDate = previousTime.toDateString();
    if (currentDate !== previousDate) {
      return true;
    }

    return false;
  };

  // ฟังก์ชันสำหรับจัดรูปแบบเวลาแสดงผล
  const formatTimestamp = (timestamp: string): string => {
    // ตรวจสอบว่า timestamp มีค่าและถูกต้อง
    if (!timestamp) {
      return 'เวลาไม่ระบุ';
    }

    const messageTime = new Date(timestamp);
    
    // ตรวจสอบว่า Date object ถูกต้อง
    if (isNaN(messageTime.getTime())) {
      return 'เวลาไม่ถูกต้อง';
    }

    const now = new Date();
    const messageDate = messageTime.toDateString();
    const nowDate = now.toDateString();

    // ถ้าเป็นวันเดียวกัน ให้แสดงแค่เวลา
    if (messageDate === nowDate) {
      return messageTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // ถ้าเป็นวันก่อนหน้า ให้แสดง "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate === yesterday.toDateString()) {
      return `Yesterday ${messageTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`;
    }

    // ถ้าเป็นวันอื่น ให้แสดงวันที่และเวลา
    return messageTime.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: messageTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ` ${messageTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      // ใช้ requestAnimationFrame เพื่อให้แน่ใจว่า DOM ได้อัพเดทแล้ว
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);

  // Auto scroll เมื่อส่งข้อความใหม่
  useEffect(() => {
    if (scrollContainerRef.current && messageInput === '' && messages.length > 0) {
      // เมื่อส่งข้อความเสร็จ (messageInput เป็น empty string)
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messageInput, messages.length]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (onSendMessage) {
      onSendMessage(messageInput);
    }
    setMessageInput('');
    
    // Scroll ไปที่ล่างสุดทันทีหลังจากส่งข้อความ
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // ฟังก์ชันสำหรับซ่อน chat
  const handleHideChat = () => {
    if (selectedChat && onHideChat) {
      onHideChat(selectedChat.id);
    }
  };

  // ฟังก์ชันสำหรับจัดการการอัปโหลดรูปภาพ
  const handleImageUpload = async (file: File) => {
    if (!file || !onSendMessage) return;

    setIsUploading(true);
    try {
      // อัปโหลดรูปภาพไปยัง Cloudinary
      const uploadResult = await uploadAndGetPublicId(file, 'chat-images');
      
      // ส่งข้อความที่มีรูปภาพ (ใช้ URL เป็น content)
      onSendMessage(uploadResult.url || '');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ฟังก์ชันสำหรับเปิด file picker
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ฟังก์ชันสำหรับจัดการการเลือกไฟล์
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // ตรวจสอบขนาดไฟล์ (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }
      
      handleImageUpload(file);
    }
    
    // รีเซ็ต input value เพื่อให้สามารถเลือกไฟล์เดียวกันได้อีกครั้ง
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className={`flex flex-col bg-white h-full ${className}`}>
      {/* Header - แสดงเฉพาะเมื่อมี chat ใน chatlist */}
      {hasChats && (
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
          <button 
            onClick={handleHideChat}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Hide chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4">
                <Image
                  src={hasChats ? "/icons/PinkPaw.svg" : "/icons/littlePaw.svg"}
                  alt="Paw print"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <p className="text-gray-500 text-lg">
                {hasChats ? "Start a conversation!" : "Welcome to Pet Sitter Chat!"}
              </p>
              {!hasChats && (
                <p className="text-gray-400 text-sm mt-2">
                  Find a pet sitter to start chatting
                </p>
              )}
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : undefined;
              const isFirstMessage = index === 0;
              const shouldShow = shouldShowTimestamp(msg, previousMessage, isFirstMessage);
              
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg.message}
                  sender={msg.sender}
                  avatar={msg.avatar}
                  timestamp={shouldShow ? formatTimestamp(msg.timestamp) : undefined}
                  isImage={msg.isImage}
                  imageUrl={msg.imageUrl}
                  showTimestamp={shouldShow}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Message Input Area - แสดงเฉพาะเมื่อมี chat ใน chatlist */}
      {hasChats && (
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
    
            {/* Image upload button */}
            <button
              onClick={openFilePicker}
              disabled={isUploading}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload image"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

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
      )}
    </div>
  );
};

export default ChatContainer;
