import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email, phone, password } = req.body as {
            email?: string;
            phone?: string;
            password?: string;
            userType?: number;
        };

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!phone) {
            return res.status(400).json({ error: "Phone is required" });
        }
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        // fallback ให้ name = email ถ้า user ไม่ส่งมา
        const name = email;

        // เช็คว่า email/phone ซ้ำหรือไม่
        const existingOwner = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
        });

        if (existingOwner) {
            return res
                .status(409)
                .json({ error: "Email or Phone already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // save to db
        const newOwner = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                user_role: { //ตาราง user_role
                    create: [//insert ข้อมูลใหม่เข้า relation
                        {
                            role: { // กำหนดข้อมูลฝั่ง role
                                connect: { id: 2 },  //Owner
                            },
                        },
                    ],
                },
            },
            include: { user_role: true },  // ดึงข้อมูล user_role กลับมาด้วย
        });

        return res
            .status(201)
            .json({
                message: "Owner created successfully",
                data: newOwner
            });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Server could not create owner because database connection",
            details: String(error),
        });
    }
}
