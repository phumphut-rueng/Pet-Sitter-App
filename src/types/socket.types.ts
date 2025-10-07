// Socket event types
import { NextApiRequest } from 'next';

export interface SocketEvents {
  // Client to Server events
  join_app: (userId: string) => void;
  send_message: (data: SendMessageData) => void;
  disconnect: () => void;

  // Server to Client events
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;
  receive_message: (message: MessagePayload) => void;
  unread_update: (data: UnreadUpdateData) => void;
}

export interface SendMessageData {
  chatId: number;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE';
  imageUrl?: string;
}

export interface MessagePayload {
  id: string;
  chatId: number;
  senderId: string;
  content: string;
  messageType: string;
  imageUrl?: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
  senderProfileImage?: string;
  senderProfileImagePublicId?: string;
}

export interface UnreadUpdateData {
  chatId: number;
  newUnreadCount: number;
}

// Next.js API Request with user
export interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
  };
}
