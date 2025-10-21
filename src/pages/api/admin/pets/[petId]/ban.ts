import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { apiHandler, methodNotAllowed, toPositiveInt } from "@/lib/api/api-utils";
import type { ErrorResponse } from "@/lib/types/api";

type BanAction = "ban" | "unban";

interface RequestBody {
  action: BanAction;
  reason?: string;
}

interface SuccessResponse {
  message: string;
  petId: number;
  action: BanAction;
  is_banned: boolean | null; 
  banned_at: string | null;
  ban_reason: string | null;
  banned_by_admin_id: number | null;
}

function isValidBody(body: unknown): body is RequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return b.action === "ban" || b.action === "unban";
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const petId = toPositiveInt(req.query.petId);
  if (!petId) {
    return res.status(400).json({ message: "Invalid pet id" });
  }

  if (!isValidBody(req.body)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { action, reason } = req.body;

  try {
    // หา admin ถ้ามี user id
    const { getAdminIdFromRequest } = await import("@/lib/auth/roles");
    const adminId = await getAdminIdFromRequest(req, res);

    // เช็คว่า pet มีอยู่จริง
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // อัปเดตสถานะ
    const updated = await prisma.pet.update({
      where: { id: petId },
      data: action === "ban"
        ? {
            is_banned: true,
            banned_at: new Date(),
            banned_by_admin_id: adminId,
            ban_reason: reason ?? null,
          }
        : {
            is_banned: false,
            banned_at: null,
            banned_by_admin_id: null,
            ban_reason: null,
          },
      select: {
        id: true,
        is_banned: true,
        banned_at: true,
        ban_reason: true,
        banned_by_admin_id: true,
      },
    });

    return res.status(200).json({
      message: "Pet status updated successfully",
      petId: updated.id,
      action,
      is_banned: updated.is_banned,
      banned_at: updated.banned_at?.toISOString() ?? null,
      ban_reason: updated.ban_reason,
      banned_by_admin_id: updated.banned_by_admin_id,
    });
  } catch (err) {
    console.error("Error updating pet ban status:", err);
    return res.status(500).json({ message: "Failed to update pet status" });
  }
}

export default apiHandler(handler);