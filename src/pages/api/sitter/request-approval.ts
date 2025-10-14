import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // หาผู้ใช้จาก session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // หา sitter profile ของผู้ใช้
    const sitter = await prisma.sitter.findFirst({
      where: { user_sitter_id: user.id },
      select: {
        id: true,
        approval_status_id: true,
        name: true,
        phone: true,
        experience: true,
        introduction: true
      },
    });

    // หา status "Waiting for approve"
    const waitingStatus = await prisma.sitter_approval_status.findFirst({
      where: { status_name: "Waiting for approve" },
      select: { id: true },
    });

    if (!waitingStatus) {
      return res.status(500).json({ message: "Waiting for approve status not found" });
    }

    // ดึงข้อมูลจาก form (ถ้ามีการส่งมา)
    const { fullName, experience, phone, email, introduction } = req.body;

    console.log("📝 Received data:", { fullName, experience, phone, email, introduction });

    // อัปเดตข้อมูลผู้ใช้ (ถ้ามีการส่งข้อมูลมา)
    if (fullName || phone || email) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(fullName && { name: fullName }),
          ...(phone && { phone: phone }),
          ...(email && { email: email }),
          updated_at: new Date(),
        },
      });
    }

    if (!sitter) {
      // สถานะ Pending submission - สร้างข้อมูล sitter ใหม่
      const parsedExperience = experience ? parseInt(experience.toString()) : null;

      await prisma.sitter.create({
        data: {
          user_sitter_id: user.id,
          phone: phone || null,
          experience: parsedExperience,
          introduction: introduction || null,
          approval_status_id: waitingStatus.id,
          status_updated_at: new Date(),
        },
      });

      console.log("✅ Sitter profile created successfully");
      return res.status(200).json({
        message: "Sitter profile created and request for approval submitted successfully",
        status: "Waiting for approve",
        action: "created"
      });
    } else {
      // มีข้อมูล sitter อยู่แล้ว - อัปเดตสถานะและข้อมูล
      const parsedExperience = experience ? parseInt(experience.toString()) : null;

      await prisma.sitter.update({
        where: { id: sitter.id },
        data: {
          approval_status_id: waitingStatus.id,
          status_updated_at: new Date(),
          updated_at: new Date(),
          // อัปเดตข้อมูล sitter ถ้ามีการส่งมา
          ...(phone && { phone: phone }),
          ...(experience && { experience: parsedExperience }),
          ...(introduction && { introduction: introduction }),
        },
      });

      console.log("✅ Sitter profile updated successfully");
      return res.status(200).json({
        message: "Sitter profile updated and request for approval submitted successfully",
        status: "Waiting for approve",
        action: "updated"
      });
    }

  } catch (error) {
    console.error("❌ Error requesting approval:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    return res.status(500).json({
      message: "Error requesting approval",
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}