import { prisma } from "@/lib/prisma/prisma";
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const userId = Number(req.query.userId)
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" })
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        sitter: {
          include: {
            user: { select: { name: true, profile_image: true } },
          },
        },
        booking_pet_detail: {
          include: {
            pet: { select: { name: true, image_url: true, pet_type: true } },
          },
        },
        status_booking: true,
      },
      orderBy: { created_at: "desc" },
    })

    const formatted = bookings.map((b) => ({
      id: b.id,
      title: b.sitter.name,
      sitterName: b.sitter.user?.name,
      avatarUrl: b.sitter.user?.profile_image,
      transactionDate: b.created_at,
      dateTime: `${b.date_start.toLocaleString()} - ${b.date_end.toLocaleString()}`,
      duration:
        (b.date_end.getTime() - b.date_start.getTime()) / (1000 * 60 * 60) + " hours",
      pet: b.booking_pet_detail.map((p) => p.pet.name).join(", "),
      totalPrice: b.amount,
      status: b.status_booking.name,
    }))

    res.status(200).json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}
