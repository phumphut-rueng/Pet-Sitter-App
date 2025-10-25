import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";
import axios from "axios";

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

    // NOTIFICATION SYSTEM: สร้าง notification เมื่อ sitter อัปเดต booking status (เร็วเหมือนแชท)
    try {
      const { createSystemNotification } = await import('@/lib/notifications/notification-utils');
      
      // Map status ID to action - เพื่อแปลง status ID เป็น action ที่เข้าใจได้
      const statusMap: { [key: number]: { title: string; message: string } } = {
        1: { title: 'Booking Confirmed!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been confirmed` },
        2: { title: 'Booking Cancelled', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been cancelled` },
        3: { title: 'Service Completed!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been completed` },
        4: { title: 'Booking Confirmed!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been confirmed` },
        5: { title: 'Booking Confirmed!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been confirmed` },
        6: { title: 'Service Started!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} is now in service` },
        7: { title: 'Service Completed!', message: `Your booking with ${updatedBooking.sitter.name || 'Pet Sitter'} has been completed` }
      };
      
      const notificationData = statusMap[Number(statusId)] || statusMap[1];
      
      // Create notification directly
      await createSystemNotification(
        updatedBooking.user_id,
        notificationData.title,
        notificationData.message
      );
      
      // Trigger real-time notification update
      try {
        // Send event to frontend via Socket.IO server
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://pet-sitter-socket-server-production.up.railway.app';
        
        // Send 2 events: notification_refresh and count_update
        await axios.post(`${socketServerUrl}/emit-notification-refresh`, {
          userId: updatedBooking.user_id
        });
        
        // Add: Send event for direct count update
        await axios.post(`${socketServerUrl}/emit-event`, {
          event: 'notification_count_update',
          userId: updatedBooking.user_id,
          data: { shouldRefetch: true }
        });
        
      } catch (error) {
        console.error('Failed to trigger real-time update:', error);
      }
    } catch (notificationError) {
      console.error('Failed to create booking notification:', notificationError);
    }

    return res.status(200).json({ message: "Booking status updated successfully" });
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
