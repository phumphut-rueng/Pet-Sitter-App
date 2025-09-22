import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { phone } = req.body as { phone?: string };

        if (!phone) {
            return res.status(400).json({
                error: "Phone is required"
            });
        }

        // ค้นหา phone ใน DB
        const existingUser = await prisma.user.findFirst({
            where: { phone },
        });

        if (existingUser) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("check-phone error:", error);
        return res.status(500).json({ error: "Server error", details: String(error) });
    }
}
