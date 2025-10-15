// API endpoint เพื่อเช็คว่า socket server instance ถูกสร้างแล้วหรือยัง
import { NextApiRequest, NextApiResponse } from 'next';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: unknown;
      [key: string]: unknown;
    };
  } | null;
};

export default function socketStatusHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method === 'GET') {
    // เช็คว่า socket server instance มีอยู่แล้วหรือยัง
    const isSocketServerReady = !!res.socket?.server?.io;
    
    res.status(200).json({ 
      success: true, 
      isReady: isSocketServerReady,
      message: 'Socket status retrieved successfully'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }
}

