import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { userId } = req.query;
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: Number(userId) },
      orderBy: { created_at: "desc" },
      include: {
        sitter: {
          select: {
            id: true,
            name: true,
            user_sitter_id: true,
            sitter_image: { take: 1, select: { image_url: true } },
          },
        },
        booking_pet_detail: {
          include: {
            pet: { select: { id: true, name: true, pet_type: { select: { pet_type_name: true } } } },
          },
        },
        status_booking_booking_status_idTostatus: { select: { name: true, type: true } },
        status_booking_payment_status_idTostatus: { select: { name: true, type: true } },
      },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      sitterId: b.pet_sitter_id,                       // ✅ ใช้ใน review
      sitterUserId: b.sitter?.user_sitter_id || null,  // ✅ ใช้ใน report (user.id ของ sitter)
      sitterName: b.sitter?.name || "-",
      sitterAvatar: b.sitter?.sitter_image?.[0]?.image_url || null,
      status: b.status_booking_booking_status_idTostatus?.name || "Unknown",
      paymentStatus: b.status_booking_payment_status_idTostatus?.name || "N/A",
      dateStart: b.date_start,
      dateEnd: b.date_end,
      transactionDate: b.transaction_date,
      transactionId: b.transaction_id ?? null,
      pets: b.booking_pet_detail.map((bp) => ({
        id: bp.pet.id,
        name: bp.pet.name,
        type: bp.pet.pet_type.pet_type_name,
      })),
      amount: b.amount ? Number(b.amount) : null,
      paymentType: b.payment_type,
      note: b.additional,
    }));

    return res.status(200).json({ bookings: formatted });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
