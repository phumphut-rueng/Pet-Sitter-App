import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { bookingId, date_start, date_end } = req.body

  if (!bookingId || !date_start || !date_end) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const newStart = new Date(date_start)
    const newEnd = new Date(date_end)

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ error: "Invalid date format" })
    }

    // ✅ ดึง booking เดิมมาเพื่อรู้ว่า sitter คนไหน
    const currentBooking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      select: { pet_sitter_id: true },
    })

    if (!currentBooking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    // ✅ ตรวจสอบว่าช่วงใหม่ทับกับ booking อื่นของ sitter คนเดียวกันหรือไม่
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        pet_sitter_id: currentBooking.pet_sitter_id,
        id: { not: Number(bookingId) }, // ไม่รวม booking ตัวเอง
        OR: [
          {
            date_start: { lte: newEnd },
            date_end: { gte: newStart },
          },
        ],
      },
      select: { id: true, date_start: true, date_end: true },
    })

    if (overlappingBooking) {
      return res.status(409).json({
        error: "This sitter is already booked in that date range.",
        conflict: overlappingBooking,
      })
    }

    // ✅ ถ้าไม่ซ้ำ → update ได้
    const updated = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        date_start: newStart,
        date_end: newEnd,
        updated_at: new Date(),
      },
    })

    return res.status(200).json({
      message: "Booking date updated successfully",
      booking: updated,
    })
  } catch (err: any) {
    console.error("❌ Error updating booking:", err)
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Booking not found" })
    }
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
