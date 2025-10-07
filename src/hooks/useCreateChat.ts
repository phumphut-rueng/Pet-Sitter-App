// file: hooks/useCreateChat.ts

import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export const useCreateChat = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const createChatAndNavigate = async (otherUserId: number) => {
    if (!session?.user?.id) {
      console.error('User not authenticated');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/chat/create', {
        otherUserId: otherUserId
      }, {
        params: {
          userId: session.user.id
        }
      });

      if (response.data.success) {
        // ย้ายไปหน้า chat พร้อม chatId
        router.push(`/chat?chatId=${response.data.chatId}`);
      } else {
        console.error('Failed to create chat:', response.data.message);
        // ถ้าไม่สำเร็จ ให้ไปหน้า chat โดยไม่ส่ง chatId
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
        // ถ้าเป็น error 403 อาจเป็นเพราะ chat ถูกซ่อนไว้
        if (error.response?.status === 403) {
          console.log('Chat might be hidden, trying to navigate anyway');
          // ลองไปหน้า chat โดยไม่ส่ง chatId
          router.push('/chat');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    createChatAndNavigate,
    loading
  };
};
