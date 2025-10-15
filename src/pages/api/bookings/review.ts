import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import { ReviewSchema } from "@/lib/validators/booking"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  const parsed = ReviewSchema.safeParse(req.body)
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() })

  const { sitterId, userId, rating, comment } = parsed.data

  try {
    // ตรวจสอบว่าผู้ใช้และ sitter มีอยู่จริง
    const [user, sitter] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.sitter.findUnique({ where: { id: sitterId } }),
    ])

    if (!user) return res.status(404).json({ error: "User not found" })
    if (!sitter) return res.status(404).json({ error: "Sitter not found" })

    // ตรวจสอบว่าผู้ใช้เคยจอง sitter นี้ไหม (optional แต่ realistic มาก)
    const hasBooking = await prisma.booking.findFirst({
      where: {
        user_id: userId,
        pet_sitter_id: sitterId,
        booking_status_id: 7,
      },
    })

    if (!hasBooking) {
      return res.status(403).json({
        error: "You can only review sitters you've booked successfully.",
      })
    }

    // ตรวจสอบว่า user เคยรีวิว sitter คนนี้ไปแล้วหรือยัง
    const existingReview = await prisma.review.findFirst({
      where: { sitter_id: sitterId, user_id: userId },
    })

    if (existingReview) {
      return res.status(409).json({ error: "You have already reviewed this sitter." })
    }

    // สร้าง review ใหม่
    const review = await prisma.review.create({
      data: { sitter_id: sitterId, user_id: userId, rating, comment },
    })

    // อัปเดตค่าเฉลี่ย rating ของ sitter (optional แต่แนะนำ)
    const avg = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { sitter_id: sitterId },
    })

    await prisma.sitter.update({
      where: { id: sitterId },
      data: { experience: avg._avg.rating ?? 0 }, // หรือสร้างฟิลด์ average_rating แยกต่างหาก
    })

    return res.status(201).json({ message: "Review submitted successfully", review })
  } catch (err) {
    console.error("❌ Review error:", err)
    return res.status(500).json({ error: "Failed to submit review" })
  }
}
