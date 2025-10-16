import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";
import { $Enums } from "@prisma/client";

type Body = {
  action: "ban" | "unban";
  reason?: string;
  cascadePets?: boolean;
};


// ตอบ error แบบมาตรฐานเดียวกัน
function sendError(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ message });
}

// parse ownerId จาก query [ownerId] หรือ [id]
function parseOwnerId(req: NextApiRequest): number | null {
  const idParam = (req.query.ownerId ?? req.query.id) as string | string[] | undefined;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// หา adminId จาก session หรือ header x-user-id (fallback สำหรับ internal tools)
async function resolveAdminId(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const uid = Number(session?.user?.id);
    if (Number.isFinite(uid)) {
      const admin = await prisma.admin.findUnique({ where: { user_id: uid } });
      if (admin) return admin.id;
    }
  } catch {
    // ignore – จะลองจาก header ต่อ
  }

  const hdr = Number(req.headers["x-user-id"]);
  if (!Number.isFinite(hdr)) return null;

  const admin = await prisma.admin.findUnique({ where: { user_id: hdr } });
  return admin?.id ?? null;
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // method guard
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return sendError(res, 405, "Method not allowed");
  }

  // id guard
  const ownerId = parseOwnerId(req);
  if (ownerId == null) return sendError(res, 400, "Invalid owner id");

  // body guard
  const { action, reason, cascadePets = true } = (req.body ?? {}) as Body;
  if (action !== "ban" && action !== "unban") {
    return sendError(res, 400, "Invalid action");
  }

  try {
    // auth guard
    const adminId = await resolveAdminId(req, res);
    if (adminId == null) return sendError(res, 403, "Forbidden");

    // entity guard
    const current = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true },
    });
    if (!current) return sendError(res, 404, "Owner not found");

    const now = new Date();

    if (action === "ban") {
      // BAN อัปเดต user + cascade แบน pets
      const [u] = await prisma.$transaction([
        prisma.user.update({
          where: { id: ownerId },
          data: {
            status: $Enums.user_status.ban,
            // field เดิมชื่อ suspended_* กลัวของเก่าพัง
            suspended_at: now,
            suspended_by_admin_id: adminId,
            suspend_reason: reason ?? null,
          },
          select: { status: true, suspended_at: true, suspend_reason: true },
        }),
        cascadePets
          ? prisma.pet.updateMany({
              where: { owner_id: ownerId, NOT: { is_banned: true } },
              data: {
                is_banned: true,
                banned_at: now,
                banned_by_admin_id: adminId,
                ban_reason: reason ? `Owner banned: ${reason}` : "Owner banned",
              },
            })
          // ทำ no-op ให้ transaction array ยาวเท่ากัน 
          : prisma.$queryRaw`SELECT 1`,
      ]);

      return res.status(200).json({
        ok: true,
        user: {
          status: u.status, // "ban"
          banned_at: u.suspended_at?.toISOString() ?? null,
          ban_reason: u.suspend_reason ?? null,
        },
      });
    }

    // UNBAN
    const [u] = await prisma.$transaction([
      prisma.user.update({
        where: { id: ownerId },
        data: {
          status: $Enums.user_status.normal,
          suspended_at: null,
          suspended_by_admin_id: null,
          suspend_reason: null,
        },
        select: { status: true },
      }),
      cascadePets
        ? prisma.pet.updateMany({
            where: { owner_id: ownerId, is_banned: true },
            data: {
              is_banned: false,
              banned_at: null,
              banned_by_admin_id: null,
              ban_reason: null,
            },
          })
        : prisma.$queryRaw`SELECT 1`,
    ]);

    return res.status(200).json({
      ok: true,
      user: {
        status: u.status, // "normal"
        banned_at: null,
        ban_reason: null,
      },
    });
  } catch (e) {
    console.error("ban owner error:", e);
    return sendError(res, 500, "Operation failed");
  }
}