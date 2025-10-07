# 📱 ระบบ Chat แบบ Real-Time ด้วย Socket.IO - คู่มือการเรียนรู้แบบละเอียด

## 🎯 ภาพรวมของระบบ

ระบบ Chat นี้เป็นระบบแชทแบบ Real-Time ที่ใช้ Socket.IO สำหรับการสื่อสารแบบทันที และใช้ Next.js API Routes สำหรับการจัดการข้อมูลในฐานข้อมูล

### 🏗️ สถาปัตยกรรมระบบ
```
Frontend (React Components) 
    ↕️ Socket.IO Connection
Backend (Socket.IO Server)
    ↕️ Database Operations
Database (Prisma + PostgreSQL)
```

---

## 📚 สิ่งที่ต้องเรียนรู้ก่อนเริ่มต้น

### 1. **Socket.IO Fundamentals**
- **WebSocket**: โปรโตคอลสำหรับการสื่อสารแบบ Real-Time
- **Socket.IO**: Library ที่ทำให้ WebSocket ใช้งานง่ายขึ้น
- **Events**: การส่งและรับข้อมูลผ่าน events (emit/on)

### 2. **Next.js API Routes**
- **API Routes**: วิธีการสร้าง API endpoints ใน Next.js
- **Request/Response**: การจัดการ HTTP requests และ responses

### 3. **React Hooks**
- **useState**: จัดการ state ใน component
- **useEffect**: จัดการ side effects และ lifecycle
- **useContext**: แชร์ข้อมูลระหว่าง components

### 4. **Database Concepts**
- **Prisma ORM**: Object-Relational Mapping สำหรับฐานข้อมูล
- **Relationships**: ความสัมพันธ์ระหว่างตาราง (One-to-Many, Many-to-Many)

---

## 🗂️ โครงสร้างไฟล์และหน้าที่

### 📁 API Endpoints (`src/pages/api/chat/`)

#### 1. **Socket Server** (`socket.ts`)
**หน้าที่**: จัดการการเชื่อมต่อ Socket.IO และ Real-Time events

```typescript
// file: pages/api/chat/socket.ts

import { Server } from 'socket.io';           // Import Socket.IO Server
import { NextApiRequest, NextApiResponse } from 'next';  // Next.js API types
import { Socket } from 'socket.io';           // Socket.IO Socket type
import { prisma } from '@/lib/prisma/prisma'; // Database connection
import { SocketEvents, SendMessageData, MessagePayload, UnreadUpdateData } from '@/types/socket.types'; // Type definitions
```

**บรรทัดที่ 1**: `// file: pages/api/chat/socket.ts` - คอมเมนต์บอกชื่อไฟล์
**บรรทัดที่ 3**: `import { Server } from 'socket.io'` - Import Socket.IO Server class สำหรับสร้าง WebSocket server
**บรรทัดที่ 4**: `import { NextApiRequest, NextApiResponse } from 'next'` - Import types สำหรับ Next.js API routes
**บรรทัดที่ 5**: `import { Socket } from 'socket.io'` - Import Socket type สำหรับจัดการการเชื่อมต่อแต่ละ client
**บรรทัดที่ 6**: `import { prisma } from '@/lib/prisma/prisma'` - Import Prisma client สำหรับเชื่อมต่อฐานข้อมูล
**บรรทัดที่ 7**: Import types ที่กำหนดไว้สำหรับ Socket events และ data structures

```typescript
// Use any type for socket server to avoid type conflicts
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  } | null;
};
```

**บรรทัดที่ 9-14**: สร้าง type สำหรับ NextApiResponse ที่มี socket server property เพื่อจัดการ Socket.IO server instance

```typescript
export const config = { 
  api: { 
    bodyParser: false 
  } 
};
```

**บรรทัดที่ 16-20**: กำหนดค่า config สำหรับ Next.js API route โดยปิด bodyParser เพราะ Socket.IO จะจัดการข้อมูลเอง

```typescript
let io: Server; // Global Instance

interface SocketWithUser extends Socket {
  userId?: string;
  currentChatId?: number;
}
```

**บรรทัดที่ 22**: `let io: Server` - ตัวแปร global สำหรับเก็บ Socket.IO server instance
**บรรทัดที่ 24-27**: สร้าง interface ที่ขยาย Socket เพื่อเพิ่ม properties สำหรับเก็บ userId และ currentChatId

```typescript
export default async function socketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket?.server?.io) {
    // 1. สร้าง Socket.io Server Instance (Magic Part)
    const httpServer = res.socket!.server;
    io = new Server(httpServer, { 
      path: '/api/chat/socket', 
      cors: { 
        origin: '*', 
        methods: ['GET', 'POST'] 
      } 
    });
```

**บรรทัดที่ 29**: ฟังก์ชันหลักสำหรับจัดการ Socket.IO server
**บรรทัดที่ 30**: ตรวจสอบว่า Socket.IO server ยังไม่ได้ถูกสร้าง
**บรรทัดที่ 32**: ดึง HTTP server จาก Next.js
**บรรทัดที่ 33**: สร้าง Socket.IO Server instance พร้อมกำหนดค่า:
- `path: '/api/chat/socket'` - path สำหรับ Socket.IO connection
- `cors: { origin: '*', methods: ['GET', 'POST'] }` - อนุญาตให้ทุก origin เชื่อมต่อได้

```typescript
    io.on('connection', (socket: SocketWithUser) => {
      // Event: เมื่อผู้ใช้เข้าสู่แอป
        socket.on('join_app', async (userId: string) => {
          try {
            (socket as SocketWithUser).userId = userId;
          await prisma.user.update({ 
            where: { id: parseInt(userId) }, 
            data: { is_online: true } 
          });
          socket.join(userId); // เข้า Private Room ด้วย ID ตัวเอง
```

**บรรทัดที่ 41**: `io.on('connection', ...)` - ฟัง event เมื่อมี client เชื่อมต่อเข้ามา
**บรรทัดที่ 43**: `socket.on('join_app', ...)` - ฟัง event เมื่อ client ส่งข้อมูล userId มา
**บรรทัดที่ 45**: เก็บ userId ไว้ใน socket object
**บรรทัดที่ 46-49**: อัปเดตสถานะผู้ใช้ในฐานข้อมูลเป็น online
**บรรทัดที่ 50**: `socket.join(userId)` - เข้าร่วม private room ด้วย userId (สำหรับส่งข้อความเฉพาะคน)

```typescript
          // ดึงรายชื่อผู้ใช้ออนไลน์ทั้งหมดและส่งให้ client
          const onlineUsers = await prisma.user.findMany({
            where: { is_online: true },
            select: { id: true },
          });
          
          const onlineUserIds = onlineUsers.map(user => user.id.toString());
          
          // ส่งรายชื่อ online users ทั้งหมดให้ client ที่เพิ่งเข้ามา
          socket.emit('online_users_list', onlineUserIds);
          
          // แจ้งทุกคนว่ามี user ใหม่เข้ามา
          io.emit('user_online', userId);
```

**บรรทัดที่ 52-58**: ดึงรายชื่อผู้ใช้ออนไลน์ทั้งหมดจากฐานข้อมูล
**บรรทัดที่ 60**: แปลง user IDs เป็น string array
**บรรทัดที่ 63**: `socket.emit('online_users_list', onlineUserIds)` - ส่งรายชื่อผู้ใช้ออนไลน์ให้ client ที่เพิ่งเข้ามา
**บรรทัดที่ 66**: `io.emit('user_online', userId)` - แจ้งทุกคนว่ามีผู้ใช้ใหม่เข้ามาออนไลน์

```typescript
      // Event: จัดการการส่งข้อความ/รูปภาพ
      socket.on('send_message', async (data: SendMessageData) => {
        try {
          // 1. บันทึกข้อความ/รูปภาพ ลงใน DB (Persistence)
          const newMessage = await prisma.message.create({
            data: {
              chat_id: data.chatId,
              sender_id: parseInt(data.senderId),
              content: data.content,
              message_type: data.messageType || 'TEXT',
              image_url: data.imageUrl,
            },
          });
```

**บรรทัดที่ 71**: `socket.on('send_message', ...)` - ฟัง event เมื่อมีข้อความใหม่
**บรรทัดที่ 74-82**: บันทึกข้อความลงในฐานข้อมูลผ่าน Prisma:
- `chat_id`: ID ของ chat room
- `sender_id`: ID ของผู้ส่งข้อความ
- `content`: เนื้อหาข้อความ
- `message_type`: ประเภทข้อความ (TEXT หรือ IMAGE)
- `image_url`: URL ของรูปภาพ (ถ้ามี)

```typescript
          // 2. อัปเดต Chat ล่าสุด
          await prisma.chat.update({ 
            where: { id: data.chatId }, 
            data: { 
              last_message_id: newMessage.id, 
              updated_at: new Date() 
            } 
          });
```

**บรรทัดที่ 84-91**: อัปเดตข้อมูล chat เพื่อเก็บ ID ของข้อความล่าสุดและเวลาที่อัปเดต

```typescript
          // 3. ตรวจสอบว่า receiver กำลังดู chat นี้อยู่หรือไม่
          const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            socket => (socket as SocketWithUser).userId === data.receiverId
          ) as SocketWithUser;
          const isReceiverViewingThisChat = receiverSocket?.currentChatId === data.chatId;
```

**บรรทัดที่ 93-98**: ตรวจสอบว่าผู้รับข้อความกำลังดู chat นี้อยู่หรือไม่ โดยดูจาก currentChatId

```typescript
          // 4. INCREMENT UNREAD COUNT และแสดง chat สำหรับผู้รับ (ถ้าไม่ได้กำลังดูอยู่)
          const updatedUserChatSettings = await prisma.user_chat_settings.update({
            where: { 
              user_id_chat_id: { 
                user_id: parseInt(data.receiverId), 
                chat_id: data.chatId 
              } 
            },
            data: { 
              unread_count: isReceiverViewingThisChat 
                ? { set: 0 } // ถ้ากำลังดูอยู่ ให้ set เป็น 0
                : { increment: 1 }, // ถ้าไม่ได้ดู ให้เพิ่ม 1
              is_hidden: false // แสดง chat เมื่อมีข้อความแรก
            },
            select: { unread_count: true }
          });
```

**บรรทัดที่ 100-115**: อัปเดตจำนวนข้อความที่ยังไม่ได้อ่าน:
- ถ้ากำลังดูอยู่: set เป็น 0
- ถ้าไม่ได้ดู: เพิ่ม 1
- แสดง chat (is_hidden = false) เมื่อมีข้อความใหม่

```typescript
          // 5. Real-Time Delivery และแจ้ง Unread Badge
          const payload: MessagePayload = { 
            id: newMessage.id.toString(),
            chatId: newMessage.chat_id,
            senderId: newMessage.sender_id.toString(),
            content: newMessage.content || '',
            messageType: newMessage.message_type || 'TEXT',
            imageUrl: newMessage.image_url || undefined,
            timestamp: newMessage.timestamp || new Date(),
            isRead: newMessage.is_read || false,
            senderName: sender?.name || 'Unknown User',
            senderProfileImage: sender?.profile_image || undefined,
            senderProfileImagePublicId: sender?.profile_image_public_id || undefined
          };
```

**บรรทัดที่ 117-130**: สร้าง payload สำหรับส่งข้อความไปยัง client โดยรวมข้อมูลผู้ส่งด้วย

```typescript
          // ส่งข้อความไปให้ทั้งคนส่งและคนรับ
          io.to(data.senderId).emit('receive_message', payload);
          io.to(data.receiverId).emit('receive_message', payload);
```

**บรรทัดที่ 132-134**: ส่งข้อความไปยังผู้ส่งและผู้รับผ่าน Socket.IO

#### 2. **Chat List API** (`list.ts`)
**หน้าที่**: ดึงรายการ chat ทั้งหมดของผู้ใช้

```typescript
export default async function handle(req: NextApiRequestWithUser, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
```

**บรรทัดที่ 10-12**: ตรวจสอบว่าเป็น GET request หรือไม่ ถ้าไม่ใช่จะส่ง error 405

```typescript
  // ตรวจสอบ authentication (ชั่วคราวให้ผ่านก่อน)
  if (!req.user?.id) {
    const testUserId = req.query.userId as string;
    if (!testUserId) {
      return res.status(401).json({ message: 'Unauthorized - Please add ?userId=YOUR_USER_ID to URL' });
    }
    req.user = { id: testUserId };
  }
```

**บรรทัดที่ 15-22**: ตรวจสอบการ authentication โดยดูจาก query parameter userId (ชั่วคราว)

```typescript
    // ดึงรายการ chat ที่ user มีส่วนร่วม และไม่ถูกซ่อน หรือมีข้อความที่ยังไม่ได้อ่าน
    const chats = await prisma.chat.findMany({
      where: {
        AND: [
          {
            OR: [
              { user1_id: currentUserId },
              { user2_id: currentUserId }
            ]
          },
          {
            OR: [
              // Chat ที่ไม่ถูกซ่อน
              {
                user_chat_settings: {
                  some: {
                    user_id: currentUserId,
                    is_hidden: false
                  }
                }
              },
              // Chat ที่มีข้อความที่ยังไม่ได้อ่าน (แม้จะถูกซ่อน)
              {
                user_chat_settings: {
                  some: {
                    user_id: currentUserId,
                    unread_count: {
                      gt: 0
                    }
                  }
                }
              }
            ]
          }
        ]
      },
```

**บรรทัดที่ 27-61**: Query ฐานข้อมูลเพื่อดึง chat ที่:
- ผู้ใช้เป็นสมาชิก (user1_id หรือ user2_id)
- ไม่ถูกซ่อนไว้ หรือ มีข้อความที่ยังไม่ได้อ่าน

#### 3. **Message API** (`[chatId]/message.ts`)
**หน้าที่**: ดึงประวัติข้อความของ chat และทำเครื่องหมายว่าอ่านแล้ว

```typescript
  if (req.method === 'GET') {
    try {
      // 1. ตรวจสอบว่า user มีสิทธิ์เข้าถึง chat นี้หรือไม่ และ chat ไม่ได้ถูกซ่อนไว้
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatIdNumber,
          OR: [
            { user1_id: parseInt(currentUserId) },
            { user2_id: parseInt(currentUserId) }
          ]
        },
        include: {
          user_chat_settings: {
            where: {
              user_id: parseInt(currentUserId),
              is_hidden: false // ตรวจสอบว่า chat ไม่ได้ถูกซ่อนไว้
            }
          }
        }
      });
```

**บรรทัดที่ 36-55**: ตรวจสอบสิทธิ์การเข้าถึง chat และว่า chat ไม่ได้ถูกซ่อนไว้

```typescript
      // 3. ⭐️ LOGIC สำคัญ: RESET UNREAD COUNT และทำเครื่องหมายว่าอ่านแล้ว
      await prisma.user_chat_settings.update({
        where: { 
          user_id_chat_id: { 
            user_id: parseInt(currentUserId), 
            chat_id: chatIdNumber 
          } 
        },
        data: { unread_count: 0 }, // รีเซ็ตตัวนับ
      });

      // 4. ทำเครื่องหมายข้อความที่ผู้ใช้คนนี้ได้รับว่า "อ่านแล้ว"
      await prisma.message.updateMany({
        where: {
          chat_id: chatIdNumber,
          NOT: { sender_id: parseInt(currentUserId) }, // เฉพาะข้อความที่ตัวเองเป็นผู้รับ
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });
```

**บรรทัดที่ 77-98**: เมื่อผู้ใช้เปิดดู chat:
- รีเซ็ต unread_count เป็น 0
- ทำเครื่องหมายข้อความที่ตัวเองเป็นผู้รับว่าอ่านแล้ว

#### 4. **Create Chat API** (`create.ts`)
**หน้าที่**: สร้าง chat ใหม่ระหว่างผู้ใช้ 2 คน

```typescript
    // ตรวจสอบว่ามี chat อยู่แล้วหรือไม่
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1_id: currentUserId, user2_id: otherUserIdNumber },
          { user1_id: otherUserIdNumber, user2_id: currentUserId }
        ]
      }
    });

    if (existingChat) {
      // ถ้ามี chat อยู่แล้ว ให้ส่ง chat ID กลับ
      return res.json({
        success: true,
        chatId: existingChat.id,
        isNewChat: false,
        message: 'Chat already exists'
      });
    }
```

**บรรทัดที่ 43-61**: ตรวจสอบว่ามี chat อยู่แล้วหรือไม่ ถ้ามีแล้วจะส่ง chat ID กลับ

```typescript
    // สร้าง chat ใหม่
    const newChat = await prisma.chat.create({
      data: {
        user1_id: currentUserId,
        user2_id: otherUserIdNumber,
        updated_at: new Date()
      }
    });

    // สร้าง user_chat_settings สำหรับทั้งสองคน
    await prisma.user_chat_settings.createMany({
      data: [
        {
          user_id: currentUserId,
          chat_id: newChat.id,
          unread_count: 0,
          is_hidden: false // ฝ่ายที่กด Send Message จะเห็นทันที
        },
        {
          user_id: otherUserIdNumber,
          chat_id: newChat.id,
          unread_count: 0,
          is_hidden: true // ฝ่ายที่ถูกส่งข้อความจะซ่อนไว้จนกว่าจะมีข้อความ
        }
      ]
    });
```

**บรรทัดที่ 63-88**: สร้าง chat ใหม่และตั้งค่า user_chat_settings:
- ผู้ที่เริ่ม chat จะเห็นทันที (is_hidden: false)
- ผู้ที่ถูกส่งข้อความจะซ่อนไว้จนกว่าจะมีข้อความ (is_hidden: true)

---

### 📁 Components (`src/components/chat/`)

#### 1. **SocketProvider** (`SocketProvider.tsx`)
**หน้าที่**: Context Provider สำหรับจัดการ Socket.IO connection และ state

```typescript
interface SocketContextType {
  socket: any;                    // Socket.IO instance
  isConnected: boolean;           // สถานะการเชื่อมต่อ
  isLoading: boolean;             // สถานะการโหลด
  isAuthenticated: boolean;       // สถานะการ login
  userId: string | undefined;     // ID ของผู้ใช้
  sendMessage: (data: any) => void; // ฟังก์ชันส่งข้อความ
  messages: MessagePayload[];     // ข้อความที่ได้รับ
  unreadUpdates: UnreadUpdateData[]; // อัปเดต unread count
  onlineUsers: string[];          // รายชื่อผู้ใช้ออนไลน์
}
```

**บรรทัดที่ 5-15**: กำหนด interface สำหรับ Context ที่จะแชร์ข้อมูล Socket.IO ไปยัง components อื่น

```typescript
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, isConnected, isLoading, isAuthenticated, userId } = useSocket();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [unreadUpdates, setUnreadUpdates] = useState<UnreadUpdateData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
```

**บรรทัดที่ 31-35**: ใช้ useSocket hook เพื่อเชื่อมต่อ Socket.IO และสร้าง state สำหรับเก็บข้อมูล

```typescript
  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = (data: any) => {
    if (socket && socket.connected) {
      socket.emit('send_message', data);
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  };
```

**บรรทัดที่ 37-44**: ฟังก์ชันสำหรับส่งข้อความผ่าน Socket.IO โดยตรวจสอบการเชื่อมต่อก่อน

```typescript
  useEffect(() => {
    // โหลด online users เริ่มต้นจาก API
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch('/api/chat/online-users');
        const data = await response.json();
        
        if (data.success) {
          console.log('Loaded initial online users:', data.onlineUsers);
          setOnlineUsers(data.onlineUsers);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    // เรียกใช้เมื่อ component mount
    if (isConnected) {
      fetchOnlineUsers();
    }
```

**บรรทัดที่ 46-65**: โหลดรายชื่อผู้ใช้ออนไลน์จาก API เมื่อ Socket.IO เชื่อมต่อแล้ว

```typescript
    // ฟังก์ชันสำหรับจัดการ custom events
    const handleReceiveMessage = (event: CustomEvent<MessagePayload>) => {
      console.log('Received message via custom event:', event.detail);
      setMessages(prev => [...prev, event.detail]);
    };

    const handleUnreadUpdate = (event: CustomEvent<UnreadUpdateData>) => {
      console.log('Unread update via custom event:', event.detail);
      setUnreadUpdates(prev => [...prev, event.detail]);
    };
```

**บรรทัดที่ 67-76**: ฟังก์ชันสำหรับจัดการ events ที่ได้รับจาก Socket.IO:
- `handleReceiveMessage`: เพิ่มข้อความใหม่เข้าไปใน state
- `handleUnreadUpdate`: อัปเดตจำนวนข้อความที่ยังไม่ได้อ่าน

#### 2. **ChatWidget** (`ChatWidget.tsx`)
**หน้าที่**: Component หลักที่รวม ChatList และ ChatContainer เข้าด้วยกัน

```typescript
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
```

**บรรทัดที่ 8-28**: กำหนด interfaces สำหรับ User และ Chat objects

```typescript
export default function ChatWidget() {
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, sendMessage, userId, onlineUsers, messages: socketMessages, socket } = useSocketContext();
  const router = useRouter();
```

**บรรทัดที่ 52-58**: สร้าง state variables และใช้ SocketProvider context:
- `selectedChatId`: ID ของ chat ที่เลือกอยู่
- `chats`: รายการ chat ทั้งหมด
- `messages`: ข้อความใน chat ที่เลือก
- `loading`: สถานะการโหลด
- `useSocketContext()`: ดึงข้อมูลจาก SocketProvider

```typescript
  const scrollToBottom = () => {
    // ใช้ requestAnimationFrame เพื่อให้แน่ใจว่า DOM ได้อัพเดทแล้ว
    requestAnimationFrame(() => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
  };
```

**บรรทัดที่ 60-68**: ฟังก์ชันสำหรับเลื่อน scroll ไปที่ล่างสุดของข้อความ

```typescript
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
```

**บรรทัดที่ 72-97**: แปลงข้อมูล chat จากฐานข้อมูลเป็นรูปแบบที่ ChatList component ต้องการ:
- หาผู้ใช้คนอื่นใน chat
- ตรวจสอบสถานะออนไลน์
- จัดรูปแบบข้อความล่าสุดและเวลา

```typescript
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
```

**บรรทัดที่ 99-124**: ฟังก์ชันสำหรับดึงรายการ chat จาก API:
- ส่ง userId สำหรับ authentication
- Auto-select chat แรกถ้ายังไม่ได้เลือก
- จัดการ error cases

```typescript
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
        // Scroll ไปที่ล่างสุดหลังจากโหลดข้อความ
        setTimeout(() => {
          scrollToBottom();
        }, 100);
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
```

**บรรทัดที่ 126-151**: ฟังก์ชันสำหรับดึงข้อความใน chat ที่เลือก:
- ส่ง userId สำหรับ authentication
- Scroll ไปที่ล่างสุดหลังจากโหลดข้อความ
- จัดการกรณีไม่มีสิทธิ์เข้าถึง (403 error)

```typescript
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
        
        // Scroll ไปที่ล่างสุดเมื่อได้รับข้อความใหม่
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      }
```

**บรรทัดที่ 191-222**: จัดการข้อความที่ได้รับจาก Socket.IO แบบ real-time:
- ตรวจสอบว่าเป็นข้อความใน chat ที่กำลังดูอยู่หรือไม่
- แปลงข้อมูลจาก Socket.IO เป็นรูปแบบ Message
- เพิ่มข้อความใหม่เข้าไปใน state
- Scroll ไปที่ล่างสุด

```typescript
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
```

**บรรทัดที่ 333-351**: ฟังก์ชันสำหรับส่งข้อความ:
- ตรวจสอบข้อมูลที่จำเป็น
- หา receiver ID จาก chat data
- สร้าง messageData object
- ส่งผ่าน Socket.IO

#### 3. **ChatContainer** (`ChatContainer.tsx`)
**หน้าที่**: แสดงข้อความและ input สำหรับส่งข้อความ

```typescript
interface Message {
  id: string;
  message: string;
  sender: 'user' | 'other';
  avatar?: string;
  timestamp: string;
  isImage?: boolean;
  imageUrl?: string;
}
```

**บรรทัดที่ 6-14**: กำหนด interface สำหรับ Message object

```typescript
const ChatContainer: React.FC<ChatContainerProps> = ({ 
  className = '',
  selectedChat,
  messages = sampleMessages,
  onSendMessage,
  hasChats = true
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');
```

**บรรทัดที่ 31-37**: รับ props และสร้าง state:
- `scrollContainerRef`: reference สำหรับ scroll container
- `messageInput`: ข้อความที่กำลังพิมพ์

```typescript
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
```

**บรรทัดที่ 41-51**: Auto scroll ไปที่ล่างสุดเมื่อมีข้อความใหม่:
- ใช้ `requestAnimationFrame` เพื่อให้แน่ใจว่า DOM อัปเดตแล้ว
- ตั้งค่า `scrollTop` เป็น `scrollHeight`

```typescript
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
```

**บรรทัดที่ 65-79**: ฟังก์ชันสำหรับส่งข้อความ:
- ตรวจสอบว่าไม่ใช่ข้อความว่าง
- เรียก `onSendMessage` callback
- ล้าง input
- Scroll ไปที่ล่างสุด

#### 4. **ChatBubble** (`ChatBubble.tsx`)
**หน้าที่**: แสดงข้อความแต่ละข้อความในรูปแบบ bubble

```typescript
const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  sender,
  avatar,
  timestamp,
  isImage = false,
  imageUrl
}) => {
  
  const isUser = sender === 'user';
```

**บรรทัดที่ 13-22**: รับ props และกำหนดว่าเป็นข้อความของผู้ใช้หรือไม่

```typescript
  return (
    <div className="mb-4">
      {/* Timestamp - Center aligned like Facebook */}
      {timestamp && (
        <div className="flex justify-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {timestamp}
          </span>
        </div>
      )}
```

**บรรทัดที่ 25-33**: แสดง timestamp ตรงกลางเหมือน Facebook

```typescript
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%]`}>
          {/* Avatar - Only show for incoming messages */}
          {avatar && !isUser && (
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          )}
```

**บรรทัดที่ 35-50**: จัดเรียงข้อความและแสดง avatar เฉพาะข้อความที่เข้ามา

```typescript
          {/* Message Bubble */}
          <div
            className={`px-4 py-3 max-w-full rounded-lg ${
              isUser
                ? 'bg-orange-500 text-white' // Orange background for user messages
                : 'bg-white border border-gray-200 text-gray-900' // White background for other messages
            }`}
          >
            {isImage && imageUrl ? (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Message image"
                  className="max-w-full max-h-64 object-contain"
                  width={200}
                  height={200}
                />
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{message}</p>
            )}
          </div>
```

**บรรทัดที่ 52-75**: แสดงข้อความในรูปแบบ bubble:
- สีส้มสำหรับข้อความของผู้ใช้
- สีขาวสำหรับข้อความของคนอื่น
- รองรับการแสดงรูปภาพ

#### 5. **ChatList** (`ChatList.tsx`)
**หน้าที่**: แสดงรายการ chat ทั้งหมด

```typescript
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
```

**บรรทัดที่ 21-31**: รับ props และสร้างฟังก์ชันสำหรับเลือก chat

```typescript
  return (
    <div className={`w-80 bg-black flex flex-col ${className}`}>
      {/* Messages Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-white text-2xl font-bold">Messages</h2>
      </div>
```

**บรรทัดที่ 33-38**: แสดง header ของ chat list

```typescript
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start chatting with someone!</p>
            </div>
          </div>
        ) : (
          chats.map((chat) => {
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
```

**บรรทัดที่ 40-61**: แสดงรายการ chat หรือ empty state:
- ถ้าไม่มี chat จะแสดงข้อความแนะนำ
- ถ้ามี chat จะแสดงรายการพร้อม hover effects

```typescript
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
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
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                    )}
                  </div>
```

**บรรทัดที่ 63-78**: แสดง avatar และ online indicator:
- รูปโปรไฟล์ขนาด 48x48
- จุดเขียวแสดงสถานะออนไลน์

```typescript
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
```

**บรรทัดที่ 80-105**: แสดงข้อมูล chat:
- ชื่อผู้ใช้และเวลา
- ข้อความล่าสุด
- Badge แสดงจำนวนข้อความที่ยังไม่ได้อ่าน

---

### 📁 Hooks (`src/hooks/`)

#### 1. **useSocket** (`useSocket.ts`)
**หน้าที่**: Hook สำหรับจัดการ Socket.IO connection

```typescript
export const useSocket = () => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
```

**บรรทัดที่ 7-9**: ใช้ NextAuth session และสร้าง ref สำหรับ Socket.IO

```typescript
  useEffect(() => {
    // เชื่อมต่อ socket เมื่อ user login แล้ว
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Connecting socket for user:', session.user.id);
      socketRef.current = connectSocket(session.user.id);
    }

    // disconnect เมื่อ user logout หรือ component unmount
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [status, session?.user?.id]);
```

**บรรทัดที่ 11-26**: จัดการ Socket.IO connection:
- เชื่อมต่อเมื่อ user login แล้ว
- Disconnect เมื่อ logout หรือ component unmount

#### 2. **useCreateChat** (`useCreateChat.ts`)
**หน้าที่**: Hook สำหรับสร้าง chat ใหม่

```typescript
export const useCreateChat = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
```

**บรรทัดที่ 8-11**: สร้าง state และใช้ Next.js router และ session

```typescript
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
```

**บรรทัดที่ 13-52**: ฟังก์ชันสำหรับสร้าง chat และนำทางไปหน้า chat:
- ตรวจสอบการ authentication
- ส่ง request ไปยัง API
- นำทางไปหน้า chat พร้อม chatId
- จัดการ error cases

---

### 📁 Utils (`src/utils/`)

#### 1. **Socket Utils** (`socket.ts`)
**หน้าที่**: ฟังก์ชันสำหรับจัดการ Socket.IO connection

```typescript
let socket: Socket<SocketEvents> | null = null;

export const connectSocket = (userId: string): Socket<SocketEvents> => {
  // ถ้ามี socket อยู่แล้วและเชื่อมต่ออยู่ ให้ disconnect ก่อน
  if (socket && socket.connected) {
    console.log('Disconnecting existing socket before reconnecting');
    socket.disconnect();
    socket = null;
  }
  
  console.log('Creating new socket connection for user:', userId);
  socket = io({ 
    path: '/api/chat/socket',
    autoConnect: true,
    forceNew: true // บังคับสร้าง connection ใหม่
  });
```

**บรรทัดที่ 6-20**: ฟังก์ชันสำหรับเชื่อมต่อ Socket.IO:
- Disconnect connection เก่าก่อน
- สร้าง connection ใหม่ด้วย userId
- ใช้ `forceNew: true` เพื่อบังคับสร้าง connection ใหม่

```typescript
  socket.on('connect', () => {
    console.log('Socket connected successfully');
    socket?.emit('join_app', userId); // ส่ง ID ไปให้ Server จัดการ Private Room และ Presence
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
```

**บรรทัดที่ 22-34**: จัดการ Socket.IO events:
- `connect`: เมื่อเชื่อมต่อสำเร็จ จะส่ง `join_app` event
- `connect_error`: จัดการ error ในการเชื่อมต่อ
- `disconnect`: จัดการเมื่อ disconnect

```typescript
  // เพิ่ม Listener สำหรับ Real-Time Unread Badge Update
  socket.on('unread_update', (data) => {
    console.log('Unread Badge Update:', data);
    // สามารถ dispatch event หรือ callback ที่นี่ได้
    window.dispatchEvent(new CustomEvent('socket:unread_update', { detail: data }));
  });

  socket.on('receive_message', (message) => {
    console.log('Received message:', message);
    // สามารถ dispatch event หรือ callback ที่นี่ได้
    window.dispatchEvent(new CustomEvent('socket:receive_message', { detail: message }));
  });
```

**บรรทัดที่ 36-47**: จัดการ events จาก server:
- `unread_update`: อัปเดตจำนวนข้อความที่ยังไม่ได้อ่าน
- `receive_message`: รับข้อความใหม่
- ใช้ `window.dispatchEvent` เพื่อส่งข้อมูลไปยัง components อื่น

---

### 📁 Types (`src/types/`)

#### 1. **Socket Types** (`socket.types.ts`)
**หน้าที่**: กำหนด types สำหรับ Socket.IO events และ data structures

```typescript
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
  online_users_list: (onlineUsers: string[]) => void;
  chat_list_update: (data: ChatListUpdateData) => void;
}
```

**บรรทัดที่ 4-17**: กำหนด interface สำหรับ Socket.IO events:
- **Client to Server**: events ที่ client ส่งไปยัง server
- **Server to Client**: events ที่ server ส่งไปยัง client

```typescript
export interface SendMessageData {
  chatId: number;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE';
  imageUrl?: string;
}
```

**บรรทัดที่ 19-26**: กำหนด interface สำหรับข้อมูลการส่งข้อความ:
- `chatId`: ID ของ chat room
- `senderId`: ID ของผู้ส่ง
- `receiverId`: ID ของผู้รับ
- `content`: เนื้อหาข้อความ
- `messageType`: ประเภทข้อความ (TEXT หรือ IMAGE)
- `imageUrl`: URL ของรูปภาพ (ถ้ามี)

```typescript
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
```

**บรรทัดที่ 28-40**: กำหนด interface สำหรับข้อความที่ส่งไปยัง client:
- รวมข้อมูลผู้ส่งด้วย (name, profile image)
- มีข้อมูลเพิ่มเติมเช่น timestamp, isRead

---

## 🔄 Flow การทำงานของระบบ

### 1. **การเชื่อมต่อ Socket.IO**
```
1. User Login → useSocket Hook → connectSocket()
2. Socket.IO Client เชื่อมต่อไปยัง Server
3. Server สร้าง Socket.IO instance
4. Client ส่ง 'join_app' event พร้อม userId
5. Server อัปเดต user.is_online = true
6. Server ส่งรายชื่อ online users กลับมา
```

### 2. **การส่งข้อความ**
```
1. User พิมพ์ข้อความ → ChatContainer → handleSendMessage()
2. ChatWidget สร้าง messageData object
3. ส่งผ่าน Socket.IO → 'send_message' event
4. Server บันทึกข้อความลงฐานข้อมูล
5. Server อัปเดต unread_count
6. Server ส่งข้อความไปยังผู้ส่งและผู้รับ
7. Client รับข้อความ → อัปเดต UI
```

### 3. **การแสดงข้อความ Real-Time**
```
1. Server ส่ง 'receive_message' event
2. Socket Utils รับ event → dispatch CustomEvent
3. SocketProvider ฟัง CustomEvent → อัปเดต state
4. ChatWidget รับ state → แสดงข้อความใหม่
5. Auto scroll ไปที่ล่างสุด
```

### 4. **การจัดการ Unread Count**
```
1. เมื่อส่งข้อความ → Server อัปเดต unread_count
2. Server ส่ง 'unread_update' event
3. Client รับ event → อัปเดต badge ใน ChatList
4. เมื่อเปิดดู chat → API mark-read → รีเซ็ต unread_count
```

---

## 🎯 ตัวอย่างการใช้งาน

### 1. **การสร้าง Chat ใหม่**
```typescript
// ใน component ที่ต้องการสร้าง chat
const { createChatAndNavigate, loading } = useCreateChat();

const handleStartChat = () => {
  createChatAndNavigate(otherUserId); // otherUserId เป็น number
};
```

### 2. **การส่งข้อความ**
```typescript
// ใน ChatWidget
const handleSendMessage = async (message: string) => {
  const messageData = {
    chatId: parseInt(selectedChatId),
    senderId: userId!,
    receiverId: receiverId,
    content: message,
    messageType: 'TEXT',
  };
  
  sendMessage(messageData); // ส่งผ่าน Socket.IO
};
```

### 3. **การแสดงข้อความ Real-Time**
```typescript
// ใน SocketProvider
useEffect(() => {
  const handleReceiveMessage = (event: CustomEvent<MessagePayload>) => {
    setMessages(prev => [...prev, event.detail]);
  };
  
  window.addEventListener('socket:receive_message', handleReceiveMessage);
  
  return () => {
    window.removeEventListener('socket:receive_message', handleReceiveMessage);
  };
}, []);
```

---

## 🚀 การพัฒนาต่อ

### 1. **เพิ่มฟีเจอร์**
- **การส่งรูปภาพ**: เพิ่ม image upload และแสดงใน ChatBubble
- **การส่งไฟล์**: รองรับการส่งไฟล์ประเภทต่างๆ
- **Typing Indicator**: แสดงสถานะกำลังพิมพ์
- **Message Reactions**: เพิ่ม emoji reactions
- **Message Search**: ค้นหาข้อความใน chat

### 2. **ปรับปรุงประสิทธิภาพ**
- **Message Pagination**: โหลดข้อความแบบแบ่งหน้า
- **Image Optimization**: บีบอัดรูปภาพก่อนส่ง
- **Connection Pooling**: จัดการ Socket.IO connections
- **Caching**: Cache ข้อมูล chat และ messages

### 3. **เพิ่มความปลอดภัย**
- **Message Encryption**: เข้ารหัสข้อความ
- **Rate Limiting**: จำกัดการส่งข้อความ
- **Content Moderation**: กรองเนื้อหาที่ไม่เหมาะสม
- **Audit Logs**: บันทึกการใช้งาน

---

## 📝 สรุป

ระบบ Chat นี้ใช้ Socket.IO สำหรับการสื่อสารแบบ Real-Time และ Next.js API Routes สำหรับการจัดการข้อมูลในฐานข้อมูล โดยมีโครงสร้างที่ชัดเจนและแยกหน้าที่กันอย่างดี:

- **API Layer**: จัดการข้อมูลและ Socket.IO server
- **Component Layer**: แสดง UI และจัดการ user interactions
- **Hook Layer**: จัดการ business logic และ state
- **Utils Layer**: ฟังก์ชันช่วยเหลือและ Socket.IO utilities
- **Types Layer**: กำหนด types และ interfaces

ระบบนี้สามารถขยายและปรับปรุงได้ง่าย และเหมาะสำหรับการพัฒนาระบบ chat ที่ต้องการความยืดหยุ่นและประสิทธิภาพสูง
