import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  try {
    const { email, phone, password, role_ids } = req.body as {
      email?: string;
      phone?: string;
      password?: string;
      role_ids?: number[] | number;
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

    const roles = Array.isArray(role_ids) ? role_ids : role_ids ? [role_ids] : [2];

    if (existingOwner && roles.includes(2)) {
      return res
        .status(409)
        .json({ error: "Email or Phone already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and assign roles in a transaction
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_role: {
          create: roles.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: { user_role: true },
    });

    return res
      .status(201)
      .json({
        message: "Owner created successfully",
        data: newUser
      });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      error: "Server could not create owner because database connection",
      details: String(error),
    });
  }
}