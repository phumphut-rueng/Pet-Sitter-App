import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  const { sitterId, userId, rating, comment } = req.body

  try {
    const review = await prisma.review.create({
      data: { sitter_id: sitterId, user_id: userId, rating, comment },
    })
    res.status(200).json({ message: "Review submitted successfully", review })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to submit review" })
  }
}
