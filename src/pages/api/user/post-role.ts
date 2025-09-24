import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email, role_ids } = req.body as {
            email?: string;
            role_ids?: number;
        };

        if (!email) {
            return res.status(400).json({ error: "email is required" });
        }
        if (!role_ids) {
            return res.status(400).json({ error: "role_id is required" });
        }

        //check user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { user_role: true },
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "The provided email does not match any registered user",
            });
        }

        if (user.user_role.some((ur) => ur.role_id === role_ids)) {
            return res.status(409).json({
                error: "Conflict",
                message: "User already has this role",
            });
        }

        await prisma.$transaction([
            prisma.user_role.create({
                data: {
                    user_id: user.id,
                    role_id: role_ids,
                },
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    updated_at: new Date(),
                },
            }),
        ]);

        return res.status(201).json({
            message: "Role added successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server could not create role sitter because database connection",
            details: String(error),
        });
    }
}
