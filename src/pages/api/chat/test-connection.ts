import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ทดสอบ basic connectivity
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat/socket`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Socket endpoint is accessible',
        status: response.status
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Socket endpoint returned error',
        status: response.status
      });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to test connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
