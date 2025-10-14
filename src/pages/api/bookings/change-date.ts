import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT")
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  const { bookingId, date_start, date_end } = req.body

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { date_start: new Date(date_start), date_end: new Date(date_end) },
    })

    res.status(200).json({ message: "Booking date updated", updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update booking date" })
  }
}
