import { prisma } from "@/lib/prisma/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  const { userId, sitterId, title, description } = req.body

  try {
    const report = await prisma.report.create({
      data: {
        reporter_id: userId,
        title,
        description,
      },
    })
    res.status(200).json({ message: "Report submitted successfully", report })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to submit report" })
  }
}
