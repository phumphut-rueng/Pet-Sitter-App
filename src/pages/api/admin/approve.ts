import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized - Please login" });
    }

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        user_role: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRoles = user.user_role.map(ur => ur.role.role_name);
    if (!userRoles.includes('Admin')) {
      return res.status(403).json({ message: "Access denied - Admin role required" });
    }

    const { sitterId } = req.body;

    // Validate required fields
    if (!sitterId) {
      return res.status(400).json({ 
        message: "Missing required field: sitterId is required" 
      });
    }

    // Check if sitter exists
    const existingSitter = await prisma.sitter.findUnique({
      where: { id: parseInt(sitterId) },
      select: { id: true, approval_status_id: true }
    });

    if (!existingSitter) {
      return res.status(404).json({ message: "Pet Sitter not found" });
    }

    // Update sitter status to Approved (status_id: 2)
    const updatedSitter = await prisma.sitter.update({
      where: { id: parseInt(sitterId) },
      data: {
        approval_status_id: 4, // Status ID 2 for Approved
        admin_note: null, // Clear any previous admin note
        status_updated_at: new Date()
      },
      include: {
        sitter_approval_status: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get admin information
    const adminRecord = await prisma.admin.findUnique({
      where: { user_id: parseInt(session.user.id) },
      select: { id: true }
    });

    // Create approval history record
    await prisma.sitter_approval_history.create({
      data: {
        sitter_id: parseInt(sitterId),
        status_id: 4, // Approved status
        admin_id: adminRecord?.id || null,
        admin_note: null, // No note needed for approval
        changed_at: new Date()
      }
    });

    return res.status(200).json({
      message: "Pet Sitter approved successfully",
      data: {
        sitterId: updatedSitter.id,
        status: updatedSitter.sitter_approval_status.status_name,
        approvedBy: user.name || user.email,
        updatedAt: updatedSitter.status_updated_at
      }
    });

  } catch (error) {
    console.error("❌ Error approving pet sitter:", error);
    return res.status(500).json({ 
      message: "Error approving pet sitter",
      error: process.env.NODE_ENV === "development" ? error : undefined
    });
  }
}
