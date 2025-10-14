import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "Sitter id is required"
            });
        }

        const result = await prisma.sitter.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile_image: true,
                    },
                },
                sitter_pet_type: {
                    include: {
                        pet_type: true
                    }
                }
            },
        });

        if (!result) {
            return res.status(404).json({
                message: "Pet Sitter not found",
            });
        }
        else {
            return res.status(200).json({
                data: result
            });
        }
    } catch (error) {
        console.error("get-profile-sitter-by-id error:", error);
        return res.status(500).json({
            message: "Server error while get profile sitter by id",
            details: String(error)
        });
    }
}
