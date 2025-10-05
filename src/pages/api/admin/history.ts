import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    

    const { sitterId } = req.query;

    // Validate sitterId
    if (!sitterId || isNaN(Number(sitterId))) {
      return res.status(400).json({ message: "Invalid sitter ID" });
    }

    // Fetch approval history for the sitter
    const history = await prisma.sitter_approval_history.findMany({
      where: {
        sitter_id: parseInt(sitterId as string)
      },
      include: {
        sitter: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        admin: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        changed_at: 'desc'
      }
    });

    // Get status names for each status_id
    const statusIds = [...new Set(history.map(h => h.status_id))];
    const statuses = await prisma.sitter_approval_status.findMany({
      where: {
        id: {
          in: statusIds
        }
      },
      select: {
        id: true,
        status_name: true
      }
    });

    // Create a map for quick lookup
    const statusMap = statuses.reduce((acc, status) => {
      acc[status.id] = status.status_name;
      return acc;
    }, {} as Record<number, string>);

    // Format the response
    const formattedHistory = history.map(record => ({
      id: record.id,
      sitterId: record.sitter_id,
      sitterName: record.sitter?.name || record.sitter?.user?.name || 'Unknown',
      statusId: record.status_id,
      statusName: statusMap[record.status_id] || 'Unknown',
      adminId: record.admin_id,
      adminName: record.admin?.user?.name || 'System',
      adminEmail: record.admin?.user?.email || null,
      adminNote: record.admin_note,
      changedAt: record.changed_at
    }));

    return res.status(200).json({
      message: "Approval history retrieved successfully",
      data: formattedHistory,
      totalRecords: formattedHistory.length
    });

  } catch (error) {
    console.error("❌ Error fetching approval history:", error);
    return res.status(500).json({ 
      message: "Error fetching approval history",
      error: process.env.NODE_ENV === "development" ? error : undefined
    });
  }
}
