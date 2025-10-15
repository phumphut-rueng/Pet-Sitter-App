import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { bookingId, statusId } = req.body;

  if (!bookingId || !statusId) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { booking_status_id: Number(statusId) },
    });

    return res.status(200).json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
