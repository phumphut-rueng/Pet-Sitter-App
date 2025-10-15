# Pet Sitter App - Socket.IO Server Setup

## 🚀 **การตั้งค่า Environment Variables**

### **สำหรับ Development (Local)**

#### **1. Socket.IO Server (.env ใน socket-server/)**
```bash
# Socket.IO Server Environment Variables
PORT=4000
SOCKET_IO_CORS_ORIGIN=http://localhost:3000,https://pet-sitter-hhpy4rsyf-phumphuts-projects.vercel.app
DATABASE_URL="postgresql://neondb_owner:npg_FK8d2ZDRyTVI@ep-rough-wind-a1a1nhwe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME=df1j8dvg0
CLOUDINARY_API_KEY=957636184682766
CLOUDINARY_API_SECRET=xBLnmv8E_pfG6vWfXtx10nKdInE
```

#### **2. Next.js App (.env.local)**
```bash
# Next.js App Environment Variables
DATABASE_URL="postgresql://neondb_owner:npg_FK8d2ZDRyTVI@ep-rough-wind-a1a1nhwe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4000
CLOUDINARY_CLOUD_NAME=df1j8dvg0
CLOUDINARY_API_KEY=957636184682766
CLOUDINARY_API_SECRET=xBLnmv8E_pfG6vWfXtx10nKdInE
```

### **สำหรับ Production**

#### **1. Socket.IO Server (Railway)**
```bash
SOCKET_IO_CORS_ORIGIN=https://pet-sitter-hhpy4rsyf-phumphuts-projects.vercel.app
DATABASE_URL="postgresql://neondb_owner:npg_FK8d2ZDRyTVI@ep-rough-wind-a1a1nhwe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="https://pet-sitter-hhpy4rsyf-phumphuts-projects.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME=df1j8dvg0
CLOUDINARY_API_KEY=957636184682766
CLOUDINARY_API_SECRET=xBLnmv8E_pfG6vWfXtx10nKdInE
```

#### **2. Next.js App (Vercel)**
```bash
DATABASE_URL="postgresql://neondb_owner:npg_FK8d2ZDRyTVI@ep-rough-wind-a1a1nhwe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="https://pet-sitter-hhpy4rsyf-phumphuts-projects.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-railway-app.railway.app
CLOUDINARY_CLOUD_NAME=df1j8dvg0
CLOUDINARY_API_KEY=957636184682766
CLOUDINARY_API_SECRET=xBLnmv8E_pfG6vWfXtx10nKdInE
```

## 🔧 **การรัน Development**

### **Terminal 1: Start Socket.IO Server**
```bash
cd socket-server
npm run dev
```

### **Terminal 2: Start Next.js App**
```bash
npm run dev
```

## 🚀 **การ Deploy**

### **1. Deploy Socket.IO Server บน Railway**
1. ไปที่ [Railway.app](https://railway.app)
2. สร้างโปรเจกต์ใหม่
3. เชื่อมต่อ GitHub repository
4. เลือกโฟลเดอร์ `socket-server`
5. ตั้งค่า Environment Variables ตามที่ระบุข้างต้น
6. Deploy และได้ URL เช่น `https://your-app.railway.app`

### **2. Deploy Next.js App บน Vercel**
1. ไปที่ [Vercel.com](https://vercel.com)
2. เชื่อมต่อ GitHub repository
3. ตั้งค่า Environment Variables ตามที่ระบุข้างต้น
4. เปลี่ยน `NEXT_PUBLIC_SOCKET_SERVER_URL` เป็น URL ของ Railway
5. Deploy

## 🧪 **การทดสอบ**

### **Local Development**
1. เปิด `http://localhost:4000/health` - ตรวจสอบ Socket.IO server
2. เปิด `http://localhost:3000` - ตรวจสอบ Next.js app
3. ทดสอบ chat functionality

### **Production**
1. เปิด `https://your-railway-app.railway.app/health` - ตรวจสอบ Socket.IO server
2. เปิด `https://pet-sitter-hhpy4rsyf-phumphuts-projects.vercel.app` - ตรวจสอบ Next.js app
3. ทดสอบ chat functionality

## 📝 **หมายเหตุ**

- Socket.IO server ใช้ database เดียวกันกับ Next.js app
- ตรวจสอบ CORS settings ให้ถูกต้อง
- ใช้ HTTPS สำหรับ production
- ตรวจสอบ logs เมื่อมีปัญหา
