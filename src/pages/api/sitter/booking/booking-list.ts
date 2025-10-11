import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ message: "Unauthorized" });

  try {
    const sitter = await prisma.sitter.findFirst({
      where: { user_sitter_id: Number(session.user.id) },
    });

    if (!sitter) return res.status(404).json({ message: "Sitter not found" });

    const bookings = await prisma.booking.findMany({
        where: { pet_sitter_id: sitter.id },
        include: {
          status_booking_booking_status_idTostatus: true, 
          booking_pet_detail: true,
        },
        orderBy: { date_start: "desc" },
      });
      

    const formatted = bookings.map((b) => {
      const start = new Date(b.date_start);
      const end = new Date(b.date_end);

      const formatTime = (date: Date) =>
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        });
    
      const formatDate = (date: Date) =>
        date.toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        });
    
      const bookedDate = `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;

      return {
        id: b.id,
        ownerName: b.name,
        pets: b.booking_pet_detail.length,
        duration: "3 hours",
        bookedDate,
        status: mapStatusNameToKey(
          b.status_booking_booking_status_idTostatus?.name ?? "waiting for confirm" 
        ),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function mapStatusNameToKey(
  name: string
): "waitingConfirm" | "waitingService" | "inService" | "success" | "canceled" {
  switch (name.toLowerCase()) {
    case "waiting for confirm":
      return "waitingConfirm";
    case "waiting for service":
      return "waitingService";
    case "in service":
      return "inService";
    case "success":
      return "success";
    case "canceled":
      return "canceled";
    default:
      return "waitingConfirm";
  }
}
