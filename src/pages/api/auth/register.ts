import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { name, email, password, userType = 'pet_owner' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists"
      });
    }

    // Hash password (matching your Express approach)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and assign roles in a transaction
    await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Find roles
      const petOwnerRole = await tx.role.findFirst({
        where: { role_name: "pet_owner" }
      });

      const sitterRole = await tx.role.findFirst({
        where: { role_name: "pet_sitter" }
      });

      // Assign pet owner role (everyone gets this)
      if (petOwnerRole) {
        await tx.user_role.create({
          data: {
            user_id: newUser.id,
            role_id: petOwnerRole.id
          }
        });
      }

      // If user chose pet_sitter, also assign sitter role
      if (userType === 'pet_sitter' && sitterRole) {
        await tx.user_role.create({
          data: {
            user_id: newUser.id,
            role_id: sitterRole.id
          }
        });
      }
    });

    return res.status(201).json({
      message: "User has been created successfully"
    });

  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle Prisma unique constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return res.status(409).json({
        error: "User with this email already exists"
      });
    }

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}