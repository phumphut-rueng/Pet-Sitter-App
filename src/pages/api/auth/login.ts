import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.SECRET_KEY || process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Find user by email with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        user_role: {
          include: {
            role: true
          }
        },
        sitter: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "password not valid"
      });
    }

    // Extract roles
    const roles = user.user_role.map(ur => ur.role.role_name);

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      roles
    };

    // Generate JWT token (matching your Express expiration time)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "900000" });

    return res.status(200).json({
      message: "login succesfully",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}