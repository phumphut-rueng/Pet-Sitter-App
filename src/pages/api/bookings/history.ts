// src/pages/api/bookings/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /bookings/history:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking history of a user
 *     description: Return booking history for a given user id, newest first.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to fetch bookings for
 *     responses:
 *       200:
 *         description: Booking history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 101 }
 *                       sitterId: { type: integer, example: 55, description: "pet_sitter_id (for review)" }
 *                       sitterUserId: { type: integer, nullable: true, example: 777, description: "underlying user.id of sitter (for report)" }
 *                       sitterName: { type: string, example: "Happy Paws" }
 *                       sitterAvatar: { type: string, nullable: true, example: "https://cdn.example.com/s/55.jpg" }
 *                       sitterLat:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         example: 13.7563
 *                         description: Latitude of the sitter (from sitter.latitude)
 *                       sitterLng:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         example: 100.5018
 *                         description: Longitude of the sitter (from sitter.longitude)
 *                       status: { type: string, example: "Completed" }
 *                       paymentStatus: { type: string, example: "Paid" }
 *                       dateStart:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-20T09:00:00.000Z"
 *                       dateEnd:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-22T09:00:00.000Z"
 *                       transactionDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-10-20T08:30:00.000Z"
 *                       transactionId: { type: string, nullable: true, example: "TRX_abc123" }
 *                       pets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: integer, example: 501 }
 *                             name: { type: string, example: "Milo" }
 *                             type: { type: string, example: "Dog" }
 *                       amount: { type: number, nullable: true, example: 1299.5 }
 *                       paymentType: { type: string, nullable: true, example: "credit_card" }
 *                       note: { type: string, nullable: true, example: "Leave at front gate" }
 *                       userReview:
 *                         type: object
 *                         nullable: true
 *                         description: Current user's review on this sitter (if exists)
 *                         properties:
 *                           rating: { type: integer, example: 5 }
 *                           comment: { type: string, example: "Great service!" }
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-22T10:15:00.000Z"
 *       400:
 *         description: Missing or invalid userId
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal Server Error
 *     security:
 *       - cookieAuth: []
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { userId } = req.query;
    const parsedUserId = Number(userId);

    if (!userId || Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: parsedUserId },
      orderBy: { created_at: "desc" },
      include: {
        sitter: {
          select: {
            id: true,
            name: true,
            user_sitter_id: true,
            latitude: true,
            longitude: true,
            sitter_image: { take: 1, select: { image_url: true } },
            reviews: {
              where: { user_id: parsedUserId },
              orderBy: { created_at: "desc" },
              take: 1,
              select: { rating: true, comment: true, created_at: true },
            },
            user: {
              select: {
                id: true,
                name: true,            // << ชื่อนี้จะใช้แสดงหลัง "By ..."
                profile_image: true,   // (ถ้าจะเปลี่ยน avatar ให้เป็นของ user)
              },
            },
          },
        },
        booking_pet_detail: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                pet_type: { select: { pet_type_name: true } },
              },
            },
          },
        },
        status_booking_booking_status_idTostatus: {
          select: { name: true, type: true },
        },
        status_booking_payment_status_idTostatus: {
          select: { name: true, type: true },
        },
      },
    });

    const formatted = bookings.map((b) => {
      const myReview = b.sitter?.reviews?.[0] ?? null;

      return {
        id: b.id,
        sitterId: b.pet_sitter_id, // for review (table sitter.id)
        sitterUserId: b.sitter?.user_sitter_id ?? null, // for report (underlying user.id)
        sitterName: b.sitter?.name || "-",
        sitterOwnerName: b.sitter?.user?.name || "-",
        sitterAvatar: b.sitter?.sitter_image?.[0]?.image_url || null,
        sitterLat: b.sitter?.latitude ?? null,
        sitterLng: b.sitter?.longitude ?? null,
        status: b.status_booking_booking_status_idTostatus?.name || "Unknown",
        paymentStatus:
          b.status_booking_payment_status_idTostatus?.name || "N/A",
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

        // ✅ แนบรีวิวของผู้ใช้ (ไว้ใช้เปลี่ยนปุ่ม Review → Your Review)
        userReview: myReview
          ? {
              rating: myReview.rating,
              comment: myReview.comment ?? "",
              date: myReview.created_at?.toISOString() ?? null,
            }
          : null,
      };
    });

    return res.status(200).json({ bookings: formatted });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
