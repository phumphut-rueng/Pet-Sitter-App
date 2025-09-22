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
        const { email } = req.body as { email?: string };

        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }

        // ค้นหา email ใน DB
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("check-email error:", error);
        return res.status(500).json({ error: "Server error", details: String(error) });
    }
}
