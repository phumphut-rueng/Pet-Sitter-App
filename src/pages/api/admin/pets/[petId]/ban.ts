import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/** รูปแบบ Body ที่ยอมรับจากฝั่งclient */
type BanAction = "ban" | "unban";
interface RequestBody {
  action: BanAction;
  reason?: string;
}

/** แปลงค่าที่ส่งมาทาง query/header เป็นจำนวนเต็มบวก */
function toPositiveInt(value: unknown): number | null {
  const str =
    typeof value === "string"
      ? value
      : Array.isArray(value)
      ? String(value[0])
      : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : undefined;

  if (!str) return null;
  const n = Number(str);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** type guard: ตรวจว่า body เป็นรูปแบบที่ถูกต้อง */
function isValidRequestBody(body: unknown): body is RequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return b.action === "ban" || b.action === "unban";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //  อนุญาตเฉพาะ POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // ตรวจสอบ petId จาก dynamic route
  const petId = toPositiveInt(req.query.petId);
  if (!petId) {
    return res.status(400).json({ message: "Invalid pet id" });
  }

  // ตรวจสอบ body
  if (!isValidRequestBody(req.body)) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { action, reason } = req.body;

  // หาว่าใครเป็นแอดมินที่สั่ง (ถ้าส่ง x-user-id มา และผูกกับ admin ได้)
  const requesterUserId = toPositiveInt(req.headers["x-user-id"]);
  let adminId: number | null = null;

  try {
    if (requesterUserId) {
      const admin = await prisma.admin.findUnique({ where: { user_id: requesterUserId } });
      adminId = admin?.id ?? null;
      if (!admin) {
        // ไม่ throwแต่เก็บเป็น NULL ใน banned_by_admin_id
        console.warn(
          `User ${requesterUserId} is not an admin. 'banned_by_admin_id' will be NULL.`
        );
      }
    }

    //อัปเดตสถานะสัตว์เลี้ยง
    if (action === "ban") {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          is_banned: true,
          banned_at: new Date(),
          banned_by_admin_id: adminId,
          ban_reason: reason ?? null,
        },
      });
    } else {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          is_banned: false,
          banned_at: null,
          banned_by_admin_id: null,
          ban_reason: null,
        },
      });
    }

    // ส่งคำตอบกลับ
    return res.status(200).json({
      message: "Pet status updated successfully",
      petId,
      action,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Operation failed";
    console.error("Database error while updating pet ban status:", err);
    return res.status(500).json({ message });
  }
}