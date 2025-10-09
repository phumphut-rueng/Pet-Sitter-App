import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //  อนุญาตเฉพาะ GET
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ message: "Method not allowed" }); 
    }

    const types = await prisma.pet_type.findMany({
      orderBy: { pet_type_name: "asc" },
      select: { id: true, pet_type_name: true },
    });

    // 200 OK
    return res.status(200).json(types.map(t => ({ id: t.id, name: t.pet_type_name })));
  } catch (err) {
    console.error("pet types api error:", err);
    return res.status(500).json({ message: "Internal Server Error" }); 
  }
}