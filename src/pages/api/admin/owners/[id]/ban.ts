// src/pages/api/admin/owners/[id]/ban.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type Body = {
  action: "ban" | "unban";
  reason?: string;
  cascadePets?: boolean; // default: true
};

async function resolveAdminId(req: NextApiRequest, res: NextApiResponse): Promise<number | null> {
  try {
    const session = await getServerSession(req, res, authOptions);
    const uid = session?.user?.id ? Number(session.user.id) : NaN;
    if (Number.isFinite(uid)) {
      const admin = await prisma.admin.findUnique({ where: { user_id: uid } });
      if (admin) return admin.id;
    }
  } catch {
    /* no-op */
  }

  const hdr = Number(req.headers["x-user-id"]);
  if (!Number.isFinite(hdr)) return null;
  const admin = await prisma.admin.findUnique({ where: { user_id: hdr } });
  return admin?.id ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const ownerId = Number(req.query.id);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid owner id" });

  const { action, reason, cascadePets = true } = (req.body ?? {}) as Body;
  if (action !== "ban" && action !== "unban") {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const adminId = await resolveAdminId(req, res);
    if (adminId == null) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const current = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, status: true },
    });
    if (!current) return res.status(404).json({ message: "Owner not found" });

    const now = new Date();

    if (action === "ban") {
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: ownerId },
          data: {
            status: "ban",
            suspended_at: now,
            suspended_by_admin_id: adminId,
            suspend_reason: reason ?? null,
          },
          select: {
            id: true,
            status: true,
            suspended_at: true,
            suspend_reason: true,
          },
        }),
        cascadePets
          ? prisma.pet.updateMany({
            where: { owner_id: ownerId, NOT: { is_banned: true } },
            data: {
              is_banned: true,
              banned_at: now,
              banned_by_admin_id: adminId,
              ban_reason: reason ? `Owner suspended: ${reason}` : "Owner suspended",
            },
          })
          : prisma.$executeRaw`SELECT 1`,
      ]);

      return res.status(200).json({
        ok: true,
        user: {
          status: updatedUser.status,
          suspended_at: updatedUser.suspended_at?.toISOString() ?? null,
          suspend_reason: updatedUser.suspend_reason ?? null,
        },
      });
    }

    // UNBAN
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: ownerId },
        data: {
          status: "normal",
          suspended_at: null,
          suspended_by_admin_id: null,
          suspend_reason: null,
        },
        select: {
          id: true,
          status: true,
          suspended_at: true,
          suspend_reason: true,
        },
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
        status: updatedUser.status,
        suspended_at: updatedUser.suspended_at ? updatedUser.suspended_at.toISOString() : null,
        suspend_reason: updatedUser.suspend_reason ?? null,
      },
    });
  } catch (e) {
    console.error("ban owner error:", e);
    return res.status(500).json({ message: "Operation failed" });
  }
}