import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { $Enums } from "@prisma/client";
import { sendError, toPositiveInt } from "@/lib/api/api-utils";
import { getAdminIdFromRequest } from "@/lib/auth/roles";

/**
 * @openapi
 * /admin/owners/{ownerId}/ban:
 *   post:
 *     tags: [Admin]
 *     summary: Ban or unban an owner
 *     description: Ban/unban owner by ID. Requires admin session (NextAuth) or x-user-id.
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: integer }
 *         description: Owner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminBanRequest'
 *     responses:
 *       200:
 *         description: Operation success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminBanResponse'
 *       400: { description: Invalid owner id or invalid action }
 *       403: { description: Forbidden }
 *       404: { description: Owner not found }
 *       405: { description: Method not allowed }
 *       500: { description: Operation failed }
 *     security:
 *       - cookieAuth: []
 *       - AdminApiKey: []
 */

type Body = {
  action: "ban" | "unban";
  reason?: string;
  cascadePets?: boolean;
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // method guard
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return sendError(res, 405, "Method not allowed");
  }

  // id guard
  const ownerId = toPositiveInt(req.query.ownerId ?? req.query.id);
  if (!ownerId) return sendError(res, 400, "Invalid owner id");

  // body guard
  const { action, reason, cascadePets = true } = (req.body ?? {}) as Body;
  if (action !== "ban" && action !== "unban") {
    return sendError(res, 400, "Invalid action");
  }

  try {
    // auth guard
    const adminId = await getAdminIdFromRequest(req, res);
    if (!adminId) return sendError(res, 403, "Forbidden");

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