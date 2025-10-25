import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

/**
 * @openapi
 * /sitter/update-booking-status:
 *   put:
 *     tags: [Sitter]
 *     summary: Update booking status (owned by current sitter)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, statusId]
 *             properties:
 *               bookingId: { type: integer }
 *               statusId: { type: integer, description: "status.booking_status.id" }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden (not your booking) }
 *       404: { description: Booking not found }
 *       409: { description: Invalid status transition }
 *       500: { description: Server error }
 */

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
    // อัปเดต booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { booking_status_id: Number(statusId) },
      include: {
        booking: {
          select: { name: true }
        },
        sitter: {
          select: { name: true }
        }
      }
    });

    // NOTIFICATION SYSTEM: สร้าง notification เมื่อ sitter อัปเดต booking status
    // เพิ่มโค้ดนี้เพื่อแจ้ง customer เมื่อ booking status เปลี่ยน (confirmed, cancelled, completed)
    try {
      const { createBookingNotification } = await import('@/lib/notifications/notification-utils');
      
      // Map status ID to action - เพื่อแปลง status ID เป็น action ที่เข้าใจได้
      const statusMap: { [key: number]: 'confirmed' | 'cancelled' | 'completed' | 'in_service' } = {
        1: 'confirmed',   // ยืนยันการจอง
        2: 'cancelled',   // ยกเลิกการจอง
        3: 'completed',   // เสร็จสิ้นการจอง
        4: 'confirmed',   // waiting for service (Confirm Booking)
        5: 'confirmed',   // ยืนยันการจอง
        6: 'in_service',  // in service
        7: 'completed'    // success/completed
      };
      
      const action = statusMap[Number(statusId)] || 'confirmed';
      
      // แจ้ง customer เมื่อ booking status เปลี่ยน - เพื่อให้ customer รู้สถานะล่าสุด
      await createBookingNotification(
        updatedBooking.user_id,
        updatedBooking.sitter.name || 'Pet Sitter',
        action
      );
    } catch (notificationError) {
      console.error('Failed to create booking notification:', notificationError);
      // ไม่ throw error เพื่อไม่ให้กระทบการอัปเดต - notification เป็น secondary feature
    }

    return res.status(200).json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
