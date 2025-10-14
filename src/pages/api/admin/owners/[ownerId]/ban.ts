import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { $Enums } from "@prisma/client"; 

type Body = {
  action: "ban" | "unban";
  reason?: string;
  cascadePets?: boolean;
};

async function resolveAdminId(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const uid = session?.user?.id ? Number(session.user.id) : NaN;
    if (Number.isFinite(uid)) {
      const admin = await prisma.admin.findUnique({ where: { user_id: uid } });
      if (admin) return admin.id;
    }
  } catch {}
  const hdr = Number(req.headers["x-user-id"]);
  if (!Number.isFinite(hdr)) return null;
  const admin = await prisma.admin.findUnique({ where: { user_id: hdr } });
  return admin?.id ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // รองรับ dynamic [ownerId]
  const idParam = (req.query.ownerId ?? req.query.id) as string | string[] | undefined;
  const ownerId = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid owner id" });

  const { action, reason, cascadePets = true } = (req.body ?? {}) as Body;
  if (action !== "ban" && action !== "unban") {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const adminId = await resolveAdminId(req, res);
    if (adminId == null) return res.status(403).json({ message: "Forbidden" });

    const current = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } });
    if (!current) return res.status(404).json({ message: "Owner not found" });

    const now = new Date();

    if (action === "ban") {
      const [u] = await prisma.$transaction([
        prisma.user.update({
          where: { id: ownerId },
          data: {
            status: $Enums.user_status.ban,   
            // ยังใช้ชุด suspended_* ต่อได้ (แค่ชื่อไม่แมตช์คำว่า ban)
            suspended_at: now,
            suspended_by_admin_id: adminId,
            suspend_reason: reason ?? null,
          },
          select: { id: true, status: true, suspended_at: true, suspend_reason: true },
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
          : prisma.$executeRaw`SELECT 1`,
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
          status: $Enums.user_status.normal, // ✅ enum ใหม่
          suspended_at: null,
          suspended_by_admin_id: null,
          suspend_reason: null,
        },
        select: { id: true, status: true, suspended_at: true, suspend_reason: true },
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
        : prisma.$executeRaw`SELECT 1`,
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
    return res.status(500).json({ message: "Operation failed" });
  }
}