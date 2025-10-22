import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * @openapi
 * /bookings/change-date:
 *   put:
 *     tags: [Bookings]
 *     summary: Change booking date range
 *     description: >
 *       Update `date_start` และ `date_end` ของการจองที่มีอยู่แล้ว
 *       โดยระบบจะเช็คว่า sitter เดียวกันไม่ถูกจองซ้อนช่วงเวลา
 *       (เงื่อนไข overlap: start < otherEnd && end > otherStart).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, date_start, date_end]
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 123
 *               date_start:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-21T09:00:00.000Z"
 *               date_end:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-23T09:00:00.000Z"
 *     responses:
 *       200:
 *         description: Booking date updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Booking date updated successfully" }
 *                 booking:
 *                   type: object
 *                   description: Prisma Booking entity after update
 *                   additionalProperties: true
 *       400:
 *         description: Invalid input (zod validation failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Invalid input" }
 *                 details:
 *                   type: object
 *                   description: Flattened Zod error
 *                   additionalProperties: true
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Booking not found" }
 *       409:
 *         description: Overlapping booking exists for the same sitter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "This sitter is already booked in that date range." }
 *                 conflict:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 456 }
 *                     date_start: { type: string, format: date-time, example: "2025-10-22T00:00:00.000Z" }
 *                     date_end: { type: string, format: date-time, example: "2025-10-24T00:00:00.000Z" }
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal Server Error
 *     security:
 *       - cookieAuth: []
 */


/** Validate & coerce body */
const ChangeDateSchema = z
  .object({
    bookingId: z.coerce.number().int().positive(),
    date_start: z.coerce.date(),
    date_end: z.coerce.date(),
  })
  .refine((v) => v.date_end > v.date_start, {
    message: "date_end must be after date_start",
    path: ["date_end"],
  });

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // ✅ Zod parse (แก้เรื่อง any + ตรวจรูปแบบ input)
  const parsed = ChangeDateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  const { bookingId, date_start: newStart, date_end: newEnd } = parsed.data;

  try {
    // ✅ หา sitter ของ booking นี้ก่อน
    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { pet_sitter_id: true },
    });

    if (!currentBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // ✅ ตรวจซ้อนทับ (overlap) กับ booking อื่นของ sitter เดียวกัน
    // เงื่อนไข overlap มาตรฐาน: start < otherEnd && end > otherStart
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        pet_sitter_id: currentBooking.pet_sitter_id,
        id: { not: bookingId },
        date_start: { lt: newEnd },
        date_end: { gt: newStart },
      },
      select: { id: true, date_start: true, date_end: true },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        error: "This sitter is already booked in that date range.",
        conflict: overlappingBooking,
      });
    }

    // ✅ อัปเดตได้
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date_start: newStart,
        date_end: newEnd,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({
      message: "Booking date updated successfully",
      booking: updated,
    });
  } catch (err: unknown) {
    // ✅ แก้ no-explicit-any: แคสต์เป็น Prisma error อย่างปลอดภัย
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Booking not found" });
      }
    }
    console.error("❌ Error updating booking:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
