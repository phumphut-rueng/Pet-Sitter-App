import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const types = await prisma.pet_type.findMany({
      orderBy: { pet_type_name: "asc" },
      select: { id: true, pet_type_name: true },
    });
    return res.status(200).json(types.map(t => ({ id: t.id, name: t.pet_type_name })));
  } catch (err) {
    console.error("pet types api error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}