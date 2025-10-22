import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user (password signup)
 *     description: >
 *       สร้างผู้ใช้ใหม่ด้วยอีเมล/เบอร์โทรและรหัสผ่าน จากนั้นผูก role ตาม `role_ids`.
 *       ถ้าไม่ส่ง `role_ids` จะตั้งค่าเริ่มต้นเป็น `[2]` (เช่น Owner).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, phone, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role_ids:
 *                 oneOf:
 *                   - type: array
 *                     items: { type: integer }
 *                   - type: integer
 *                 description: "Role id หรืออาเรย์ของ role id (ดีฟอลต์: [2])"
 *           examples:
 *             basic:
 *               summary: Minimal owner signup
 *               value:
 *                 email: "owner@example.com"
 *                 phone: "0812345678"
 *                 password: "Passw0rd!"
 *             withRoles:
 *               summary: Specify roles explicitly
 *               value:
 *                 email: "mod@example.com"
 *                 phone: "0899999999"
 *                 password: "Passw0rd!"
 *                 role_ids: [2, 5]
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Owner created successfully" }
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                   description: "Prisma user object ที่ถูกสร้าง (จะไม่มีรหัสผ่าน)"
 *       400:
 *         description: Missing required fields (email/phone/password)
 *       405:
 *         description: Method not allowed
 *       409:
 *         description: Email or Phone already exists (เฉพาะเคสที่รวม role Owner)
 *       500:
 *         description: Server error while creating user
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { email, phone, password, role_ids } = req.body as {
      email?: string;
      phone?: string;
      password?: string;
      role_ids?: number[] | number;
    };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
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
        .json({ message: "Email or Phone already exists" });
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
      message: "Server could not create owner because database connection",
      details: String(error),
    });
  }
}