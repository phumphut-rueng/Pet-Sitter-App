import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";



function sendError(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ message });
}

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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reportId = toPositiveInt(req.query.id);
  if (!reportId) return sendError(res, 400, "Invalid report ID");

  // ----- GET /admin/reports/:id -----
  if (req.method === "GET") {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true, // "new" | "pending" | "resolved" | "canceled"
          created_at: true,
          updated_at: true,
          reporter: { select: { id: true, name: true, email: true, profile_image: true } },
          reported_user: { select: { id: true, name: true, email: true, profile_image: true } },
          handled_by_admin: {
            select: {
              id: true,
              user_id: true,
              user: { select: { id: true, name: true, email: true, profile_image: true } },
            },
          },
        },
      });

      if (!report) return sendError(res, 404, "Report not found");

      // Auto update NEW -> PENDING (idempotent)
      let effectiveStatus = report.status;
      if (report.status === "new") {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: "pending", pending_at: new Date() },
          select: { id: true },
        });
        effectiveStatus = "pending";
      }

      return res.status(200).json({
        report: {
          id: report.id,
          title: report.title,
          description: report.description ?? "",
          status: effectiveStatus, // ถ้าเดิม "new" จะถูกปรับเป็น "pending"
          reporter: {
            id: report.reporter.id,
            name: report.reporter.name ?? null,
            email: report.reporter.email,
            profileImage: report.reporter.profile_image ?? null,
          },
          reportedUser: report.reported_user
            ? {
                id: report.reported_user.id,
                name: report.reported_user.name ?? null,
                email: report.reported_user.email,
                profileImage: report.reported_user.profile_image ?? null,
              }
            : null,
          handledBy: report.handled_by_admin
            ? {
                id: report.handled_by_admin.id,
                userId: report.handled_by_admin.user_id,
                name: report.handled_by_admin.user?.name ?? null,
                email: report.handled_by_admin.user?.email ?? null,
                profileImage: report.handled_by_admin.user?.profile_image ?? null,
              }
            : null,
          createdAt: report.created_at.toISOString(),
          updatedAt: (report.updated_at ?? report.created_at).toISOString(),
        },
      });
    } catch (err) {
      console.error("Error fetching report:", err);
      return sendError(res, 500, getErrorMessage(err, "Failed to fetch report"));
    }
  }

  // ----- PATCH /admin/reports/:id -----
  if (req.method === "PATCH") {
    try {
      const { status } = req.body as { status?: unknown };
      if (!isUpdatableStatus(status)) return sendError(res, 400, "Invalid status");

      // ตรวจว่ามี report จริงก่อน (กัน Prisma error เป็น 500)
      const existing = await prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true },
      });
      if (!existing) return sendError(res, 404, "Report not found");

      let data: Prisma.reportUpdateInput;
      const now = new Date();

      if (status === "resolved") data = { status: "resolved", resolved_at: now };
      else if (status === "canceled") data = { status: "canceled", canceled_at: now };
      else data = { status: "pending", pending_at: now };

      await prisma.report.update({ where: { id: reportId }, data });
      return res.status(200).json({ message: "Report updated successfully" });
    } catch (err) {
      console.error("Error updating report:", err);
      return sendError(res, 500, getErrorMessage(err, "Failed to update report"));
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return sendError(res, 405, "Method not allowed");
}