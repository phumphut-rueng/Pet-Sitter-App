//server-side helpers 
import type { NextApiRequest, NextApiResponse } from "next";

export const allowMethods = (req: NextApiRequest, res: NextApiResponse, methods: string[]) => {
  if (!methods.includes(req.method || "")) {
    res.setHeader("Allow", methods);
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
};

// ในโปรดักชันให้ดึงจาก session/JWT
export const getUserId = async (_req: NextApiRequest): Promise<number> => 6;

export const handleApiError = (res: NextApiResponse, err: unknown, msg = "Internal server error") => {
  // log แบบปลอดภัย
  console.error(msg, err);
  return res.status(500).json({ error: msg });
};