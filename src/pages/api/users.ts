import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    }

    // 405: method ไม่อนุญาต
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("users api error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}