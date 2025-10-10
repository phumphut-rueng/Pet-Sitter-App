// API endpoint เพื่อเช็คว่า socket server instance ถูกสร้างแล้วหรือยัง
import { NextApiRequest, NextApiResponse } from 'next';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  } | null;
};

export default function socketStatusHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // เช็คว่า socket server instance มีอยู่แล้วหรือยัง
  const isSocketServerReady = !!res.socket?.server?.io;
  
  res.status(200).json({ 
    success: true, 
    isReady: isSocketServerReady 
  });
}

