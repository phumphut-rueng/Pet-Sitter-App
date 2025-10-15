import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import { ReportSchema } from "@/lib/validators/booking"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  const parsed = ReportSchema.safeParse(req.body)
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() })

  const { userId, sitterId, title, description } = parsed.data

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const [reporter, reported] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      sitterId ? prisma.user.findUnique({ where: { id: sitterId } }) : Promise.resolve(true),
    ])
    if (!reporter) return res.status(404).json({ error: "Reporter not found" })
    if (sitterId && !reported) return res.status(404).json({ error: "Reported user not found" })

    // ป้องกันการส่งซ้ำในช่วงเวลาใกล้กัน
    const duplicate = await prisma.report.findFirst({
      where: {
        reporter_id: userId,
        reported_user_id: sitterId,
        title: title,
        created_at: { gte: new Date(Date.now() - 1000 * 60 * 5) }, // ภายใน 5 นาที
      },
    })

    if (duplicate) {
      return res.status(409).json({
        error: "Duplicate report detected. Please wait before submitting again.",
      })
    }

    // บันทึกข้อมูล (sanitize text)
    const report = await prisma.report.create({
      data: {
        reporter_id: userId,
        reported_user_id: sitterId ?? null,
        title: title,
        description: description,
        status: "new",
      },
    })
    console.log("📩 /api/bookings/report called");
    return res.status(201).json({ message: "Report submitted successfully", report })
  } catch (err) {
    console.error("❌ Report error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}
