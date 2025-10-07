import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ChatList from '@/components/chat/ChatList';
import ChatContainer from '@/components/chat/ChatContainer';
import { useSocketContext } from '@/components/chat/SocketProvider';

// Real data interfaces based on schema
interface User {
  id: number;
  name: string | null;
  email: string;
  profile_image: string | null;
  is_online: boolean | null;
  last_seen: Date | null;
}

interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_id: number | null;
  updated_at: Date | null;
  user1: User;
  user2: User;
  last_message?: Message;
  unread_count?: number;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message_type: string | null;
  content: string | null;
  image_url: string | null;
  timestamp: Date | null;
  is_read: boolean | null;
  sender: User;
}

interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatWidget() {
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, sendMessage, userId, onlineUsers, messages: socketMessages, socket } = useSocketContext();
  const router = useRouter();

  const selectedChat = chats.find(chat => chat.id.toString() === selectedChatId);

  // Convert real data to ChatListItem format for ChatList component
  const chatListItems: ChatListItem[] = chats.map(chat => {
    const otherUser = chat.user1_id === parseInt(userId || '0') ? chat.user2 : chat.user1;
    const lastMessage = chat.last_message;
    
    // ตรวจสอบสถานะออนไลน์จาก onlineUsers array
    const isOnline = onlineUsers.includes(otherUser.id.toString());
    
    return {
      id: chat.id.toString(),
      name: otherUser.name || 'Unknown User',
      lastMessage: lastMessage ? 
        (lastMessage.sender_id === parseInt(userId || '0') ? `You: ${lastMessage.content}` : lastMessage.content || '') : 
        'No messages yet',
      timestamp: lastMessage?.timestamp ? 
        new Date(lastMessage.timestamp).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : 
        'No time',
      avatar: otherUser.profile_image || '/images/avatar-default.png',
      unreadCount: chat.unread_count || 0,
      isOnline: isOnline
    };
  });

  // Fetch chats list
  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/list', {
        params: {
          userId: userId // ส่ง userId สำหรับ authentication
        }
      });
      
      if (response.data.success) {
        setChats(response.data.chats);
        // Auto-select first chat if none selected และไม่มี chatId จาก URL
        const { chatId } = router.query;
        if (!selectedChatId && !chatId && response.data.chats.length > 0) {
          setSelectedChatId(response.data.chats[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/message`, {
        params: {
          userId: userId // ส่ง userId สำหรับ authentication
        }
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
          if (error.response?.status === 403) {
            setMessages([]); // ล้างข้อความถ้าไม่มีสิทธิ์เข้าถึง
        }
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  // จัดการกับ chatId จาก URL parameter
  useEffect(() => {
    const { chatId } = router.query;
    if (chatId && typeof chatId === 'string') {
      // ตรวจสอบว่า chatId มีอยู่ใน chatlist หรือไม่ก่อนที่จะเลือก
      const chatExists = chats.some(chat => chat.id.toString() === chatId);
      if (chatExists) {
        setSelectedChatId(chatId);
        // ลบ chatId จาก URL หลังจากเลือกแล้ว
        router.replace('/chat', undefined, { shallow: true });
        } else {
          setSelectedChatId(''); // ล้าง selectedChatId ทันที
        // ลบ chatId จาก URL ด้วย
        router.replace('/chat', undefined, { shallow: true });
      }
    }
  }, [router.query, chats, loading]);

  useEffect(() => {
    if (selectedChatId) {
      // ตรวจสอบว่า chat ที่เลือกมีอยู่ใน chatlist หรือไม่
      const chatExists = chats.some(chat => chat.id.toString() === selectedChatId);
      if (chatExists) {
        fetchMessages(selectedChatId);
        } else {
          setMessages([]); // ล้างข้อความถ้า chat ไม่พบ
          setSelectedChatId(''); // ล้าง selectedChatId ด้วย
        }
    }
  }, [selectedChatId, chats]);

  // จัดการกับ socket messages real-time
  useEffect(() => {
    if (socketMessages.length > 0) {
      const latestMessage = socketMessages[socketMessages.length - 1];
      if (latestMessage.chatId.toString() === selectedChatId) {
        // เพิ่มข้อความใหม่เข้าไปใน messages state
        const newMessage: Message = {
          id: parseInt(latestMessage.id),
          chat_id: latestMessage.chatId,
          sender_id: parseInt(latestMessage.senderId),
          message_type: latestMessage.messageType,
          content: latestMessage.content,
          image_url: latestMessage.imageUrl || null,
          timestamp: latestMessage.timestamp,
          is_read: latestMessage.isRead,
          sender: {
            id: parseInt(latestMessage.senderId),
            name: latestMessage.senderName,
            email: '',
            profile_image: latestMessage.senderProfileImage || null,
            is_online: null,
            last_seen: null
          }
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
      
      // อัปเดต chat list เพื่อแสดงข้อความล่าสุด
      setChats(prev => {
        const existingChatIndex = prev.findIndex(chat => chat.id === latestMessage.chatId);
        
        if (existingChatIndex !== -1) {
          // อัปเดต chat ที่มีอยู่แล้ว
          return prev.map(chat => {
            if (chat.id === latestMessage.chatId) {
              const updatedChat: Chat = {
                ...chat,
                last_message: {
                  id: parseInt(latestMessage.id),
                  chat_id: latestMessage.chatId,
                  sender_id: parseInt(latestMessage.senderId),
                  message_type: latestMessage.messageType,
                  content: latestMessage.content,
                  image_url: latestMessage.imageUrl || null,
                  timestamp: latestMessage.timestamp,
                  is_read: latestMessage.isRead,
                  sender: {
                    id: parseInt(latestMessage.senderId),
                    name: latestMessage.senderName,
                    email: '',
                    profile_image: latestMessage.senderProfileImage || null,
                    is_online: null,
                    last_seen: null
                  }
                },
                updated_at: latestMessage.timestamp,
                unread_count: latestMessage.chatId.toString() === selectedChatId ? 0 : (chat.unread_count || 0) // ถ้ากำลังดูอยู่ให้เป็น 0
              };
              return updatedChat;
            }
            return chat;
          });
                } else {
                  // ถ้า chat ยังไม่อยู่ใน list (เช่น ถูกซ่อนไว้) ให้ refresh chat list
                  fetchChats();
                  return prev;
                }
      });
    }
  }, [socketMessages, selectedChatId]);

  // จัดการกับ refresh chat list event
  useEffect(() => {
    const handleRefreshChatList = (event: CustomEvent) => {
      fetchChats(); // refresh chat list
    };

    const handleUnreadUpdate = (event: CustomEvent) => {
      const { chatId, newUnreadCount } = event.detail;
      
      // อัปเดต unread count ใน chat list เฉพาะเมื่อไม่ใช่ chat ปัจจุบันที่กำลังดูอยู่
      if (chatId.toString() !== selectedChatId) {
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              unread_count: newUnreadCount
            };
          }
          return chat;
        }));
      }
    };

    window.addEventListener('refresh_chat_list', handleRefreshChatList as EventListener);
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);

    return () => {
      window.removeEventListener('refresh_chat_list', handleRefreshChatList as EventListener);
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    };
  }, []);

  const handleChatSelect = async (chatId: string) => {
    setSelectedChatId(chatId);
    
    // ส่ง currentChatId ไปยัง socket server
    if (socket && userId) {
      socket.emit('set_current_chat', {
        userId: userId,
        chatId: parseInt(chatId)
      });
    }
    
    // รีเซ็ต unread count เมื่อเลือก chat
    setChats(prev => prev.map(chat => {
      if (chat.id.toString() === chatId) {
        return {
          ...chat,
          unread_count: 0
        };
      }
      return chat;
    }));

    // อัปเดต unread count ใน database
    try {
      await axios.post('/api/chat/mark-read', {
        chatId: parseInt(chatId),
        userId: userId
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !isConnected || !selectedChatId) return;

    const selectedChat = chats.find(chat => chat.id.toString() === selectedChatId);
    if (!selectedChat) return;

    const receiverId = selectedChat.user1_id === parseInt(userId || '0') 
      ? selectedChat.user2_id.toString() 
      : selectedChat.user1_id.toString();

    const messageData = {
      chatId: parseInt(selectedChatId),
      senderId: userId!,
      receiverId: receiverId,
      content: message,
      messageType: 'TEXT',
    };

    sendMessage(messageData);
    
    // อัปเดต chat list ทันทีเมื่อส่งข้อความใหม่
    const newMessage = {
      id: Date.now(), // temporary ID
      chat_id: parseInt(selectedChatId),
      sender_id: parseInt(userId || '0'),
      message_type: 'TEXT',
      content: message,
      image_url: null,
      timestamp: new Date(),
      is_read: false,
      sender: {
        id: parseInt(userId || '0'),
        name: 'You', // หรือชื่อผู้ใช้จริง
        email: '',
        profile_image: null,
        is_online: null,
        last_seen: null
      }
    };

    // อัปเดต chat list ทันที
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id.toString() === selectedChatId) {
          return {
            ...chat,
            last_message: newMessage,
            updated_at: new Date()
          };
        }
        return chat;
      });
      
      // เรียงลำดับตาม updated_at (ใหม่สุดขึ้นบน)
      return updatedChats.sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
    });
    
    // Refresh messages after sending
    setTimeout(() => {
      fetchMessages(selectedChatId);
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - ChatList Component */}
      <ChatList
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        chats={chatListItems}
      />

      {/* Right Main Area - Chat Container */}
      <div className="flex-1">
        <ChatContainer
          selectedChat={selectedChat ? {
            id: selectedChat.id.toString(),
            name: selectedChat.user1_id === parseInt(userId || '0') ? 
              selectedChat.user2.name || 'Unknown User' : 
              selectedChat.user1.name || 'Unknown User',
            avatar: selectedChat.user1_id === parseInt(userId || '0') ? 
              selectedChat.user2.profile_image || '/images/avatar-default.png' : 
              selectedChat.user1.profile_image || '/images/avatar-default.png'
          } : undefined}
          messages={messages.map(msg => ({
            id: msg.id.toString(),
            message: msg.content || '',
            sender: msg.sender_id === parseInt(userId || '0') ? 'user' : 'other',
            avatar: msg.sender.profile_image || '/images/avatar-default.png',
            timestamp: msg.timestamp ? 
              new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }) : '',
            isImage: msg.message_type === 'IMAGE',
            imageUrl: msg.image_url || undefined
          }))}
          onSendMessage={handleSendMessage}
          hasChats={chats.length > 0} // ส่งข้อมูลว่ามี chat ใน chatlist หรือไม่
        />
      </div>
    </div>
  );
}