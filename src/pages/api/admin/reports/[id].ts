import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";


function toPositiveInt(value: unknown): number | null {
  const s =
    typeof value === "string"
      ? value
      : Array.isArray(value)
      ? String(value[0])
      : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : undefined;
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}

type UpdatableStatus = "pending" | "resolved" | "canceled";
function isUpdatableStatus(v: unknown): v is UpdatableStatus {
  return v === "pending" || v === "resolved" || v === "canceled";
}

function getErrorMessage(err: unknown, fallback = "Internal server error"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/** ----- handler ----- */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reportId = toPositiveInt(req.query.id);
  if (!reportId) {
    return res.status(400).json({ message: "Invalid report ID" });
  }

  /** GET /admin/reports/:id — รายละเอียด report */
  if (req.method === "GET") {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          reporter: {
            select: { id: true, name: true, email: true, profile_image: true },
          },
          reported_user: {
            select: { id: true, name: true, email: true, profile_image: true },
          },
          handled_by_admin: {
            include: {
              user: { select: { id: true, name: true, email: true, profile_image: true } },
            },
          },
        },
      });

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Auto update NEW -> PENDING (idempotent พอสมควร)
      if (report.status === "new") {
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "pending",
            pending_at: new Date(),
          },
        });
      }

      return res.status(200).json({
        report: {
          id: report.id,
          title: report.title,
          description: report.description,
          status: report.status === "new" ? "pending" : report.status,
          reporter: {
            id: report.reporter.id,
            name: report.reporter.name,
            email: report.reporter.email,
            profileImage: report.reporter.profile_image,
          },
          reportedUser: report.reported_user
            ? {
                id: report.reported_user.id,
                name: report.reported_user.name,
                email: report.reported_user.email,
                profileImage: report.reported_user.profile_image,
              }
            : null,
          handledBy: report.handled_by_admin
            ? {
                id: report.handled_by_admin.id,
                userId: report.handled_by_admin.user_id,
                name: report.handled_by_admin.user.name,
                email: report.handled_by_admin.user.email,
                profileImage: report.handled_by_admin.user.profile_image,
              }
            : null,
          createdAt: report.created_at.toISOString(),
          updatedAt: (report.updated_at ?? report.created_at).toISOString(),
        },
      });
    } catch (err: unknown) {
      console.error("Error fetching report:", err);
      return res.status(500).json({ message: getErrorMessage(err, "Failed to fetch report") });
    }
  }

  /** PATCH /admin/reports/:id — อัปเดตสถานะ */
  if (req.method === "PATCH") {
    try {
      const { status } = req.body as { status?: unknown };

      if (!isUpdatableStatus(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      let data: Prisma.reportUpdateInput;
      if (status === "resolved") {
        data = { status: "resolved", resolved_at: new Date() };
      } else if (status === "canceled") {
        data = { status: "canceled", canceled_at: new Date() };
      } else {
        // pending
        data = { status: "pending", pending_at: new Date() };
      }

      await prisma.report.update({
        where: { id: reportId },
        data,
      });

      return res.status(200).json({ message: "Report updated successfully" });
    } catch (err: unknown) {
      console.error("Error updating report:", err);
      return res.status(500).json({ message: getErrorMessage(err, "Failed to update report") });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method not allowed" });
}