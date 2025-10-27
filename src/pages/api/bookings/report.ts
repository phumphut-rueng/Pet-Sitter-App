import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import { ReportSchema } from "@/lib/validators/booking"

/**
 * @openapi
 * /bookings/report:
 *   post:
 *     tags: [Bookings]
 *     summary: Submit a report about a booking/sitter
 *     description: >
 *       Create a new report from a user. The API prevents duplicate reports
 *       from the same user with the same title within 5 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, description]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: Reporter user id
 *               sitterId:
 *                 type: integer
 *                 nullable: true
 *                 example: 456
 *                 description: Reported sitter's user id (optional)
 *               title:
 *                 type: string
 *                 example: "Fraudulent listing"
 *               description:
 *                 type: string
 *                 example: "Sitter did not show up and asked to pay off-platform."
 *           examples:
 *             basic:
 *               summary: Report sitter with reason
 *               value:
 *                 userId: 123
 *                 sitterId: 456
 *                 title: "Fraudulent listing"
 *                 description: "Sitter asked me to pay off-platform."
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report submitted successfully
 *                 report:
 *                   type: object
 *                   additionalProperties: true
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Reporter or reported user not found
 *       409:
 *         description: Duplicate report detected (within 5 minutes)
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 *     # หากต้องการให้เข้าถึงได้เฉพาะผู้ล็อกอิน ค่อยเปิด security ด้านล่าง
 *     # security:
 *     #   - cookieAuth: []
 */


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
