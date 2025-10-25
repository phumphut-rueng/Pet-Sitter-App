import { prisma } from '@/lib/prisma/prisma';
import { bookingMetadataSchema } from '@/lib/validators/booking';
import { createNotification } from './notifications/create';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import Omise from 'omise';
import { authOptions } from './auth/[...nextauth]';


/**
 * @openapi
 * /charge:
 *   post:
 *     tags: [Payment]
 *     summary: Create charge & booking
 *     description: "สร้างรายการชำระเงินผ่าน Omise (หรือเงินสด) และบันทึกเป็น booking ใหม่"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency, metadata]
 *             properties:
 *               token:
 *                 type: string
 *                 nullable: true
 *                 description: "Omise card token (จำเป็นเมื่อ isCreditCard = true)"
 *                 example: "tokn_test_5xyz..."
 *               amount:
 *                 type: integer
 *                 description: "ยอดชำระเป็นสตางค์ (Omise ต้องการสตางค์) เช่น 150000 = 1,500.00 บาท"
 *                 example: 150000
 *               currency:
 *                 type: string
 *                 description: "รหัสสกุลเงิน (รองรับ THB)"
 *                 example: "THB"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Booking Payment"
 *               metadata:
 *                 type: object
 *                 description: "ข้อมูลการจองตาม bookingMetadataSchema"
 *                 required:
 *                   [isCreditCard, customerName, customerEmail, customerPhone, startTime, endTime, sitterId, petIds]
 *                 properties:
 *                   isCreditCard:
 *                     type: boolean
 *                     description: "true = ชำระด้วยบัตรผ่าน Omise, false = เงินสด"
 *                     example: true
 *                   customerName:
 *                     type: string
 *                     example: "Jane Doe"
 *                   customerEmail:
 *                     type: string
 *                     example: "jane@example.com"
 *                   customerPhone:
 *                     type: string
 *                     example: "0812345678"
 *                   additionalMessage:
 *                     type: string
 *                     nullable: true
 *                     example: "Please take care of my dog."
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-21T09:00:00.000Z"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-21T12:00:00.000Z"
 *                   sitterId:
 *                     type: integer
 *                     example: 321
 *                   petIds:
 *                     type: array
 *                     items: { type: integer }
 *                     example: [701, 702]
 *           examples:
 *             credit:
 *               summary: "ชำระผ่านบัตรเครดิต"
 *               value:
 *                 token: "tokn_test_5xyz..."
 *                 amount: 150000
 *                 currency: "THB"
 *                 description: "Booking Payment"
 *                 metadata:
 *                   isCreditCard: true
 *                   customerName: "Jane Doe"
 *                   customerEmail: "jane@example.com"
 *                   customerPhone: "0812345678"
 *                   additionalMessage: "Please take care of my dog."
 *                   startTime: "2025-10-21T09:00:00.000Z"
 *                   endTime: "2025-10-21T12:00:00.000Z"
 *                   sitterId: 321
 *                   petIds: [701, 702]
 *             cash:
 *               summary: "ชำระเงินสด"
 *               value:
 *                 amount: 150000
 *                 currency: "THB"
 *                 metadata:
 *                   isCreditCard: false
 *                   customerName: "Jane Doe"
 *                   customerEmail: "jane@example.com"
 *                   customerPhone: "0812345678"
 *                   startTime: "2025-10-21T09:00:00.000Z"
 *                   endTime: "2025-10-21T12:00:00.000Z"
 *                   sitterId: 321
 *                   petIds: [701, 702]
 *     responses:
 *       '200':
 *         description: "ชำระเงิน (หรือทำเครื่องหมายเป็นเงินสด) และสร้าง booking สำเร็จ"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 charge:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "chrg_test_5abc..." }
 *                     status:
 *                       type: string
 *                       description: "\"successful\", \"failed\", หรือ \"cash\""
 *                       example: "successful"
 *                     amount:
 *                       type: integer
 *                       description: "สตางค์"
 *                       example: 150000
 *                     transaction_date:
 *                       type: string
 *                       nullable: true
 *                       example: "2025-10-21T09:10:00.000Z"
 *                     payment_type:
 *                       type: string
 *                       nullable: true
 *                       example: "Credit"
 *                 booking:
 *                   type: object
 *                   description: "ข้อมูล booking ที่ถูกสร้าง พร้อมความสัมพันธ์ที่ include ไว้ในโค้ด"
 *       '400':
 *         description: "ข้อมูลไม่ครบ/ไม่ถูกต้อง เช่น metadata ไม่ผ่าน schema หรือขาด token เมื่อ isCreditCard = true"
 *       '401':
 *         description: "Unauthorized"
 *       '405':
 *         description: "Method not allowed"
 *       '500':
 *         description: "Payment processing failed"
 */


const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
});

type ChargeRequest = {
  token: string;
  amount: number;            // สตางค์ ถ้าเป็นบัตรเครดิต (Omise ต้องการสตางค์)
  currency: string;          // 'THB'
  description?: string;
  metadata?: Record<string, unknown>;
};

type ChargeResponse = {
  id: string;
  status: string;
  amount: number;            // สตางค์ (ให้สอดคล้องกับ Omise)
  transaction_date?: string | null;
  payment_type?: string | null;
};

// แบบคร่าว ๆ ให้พอ type ได้ (ฟิลด์ที่ใช้อยู่)
type OmiseCharge = {
  id: string;
  status: string;
  amount: number;
  paid_at: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  const userIdStr = session?.user?.id;
  if (!userIdStr) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  try {
    const { token, amount, currency, description, metadata }: ChargeRequest = req.body;

    // validate input
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, amount, currency',
      });
    }

    // validate booking metadata
    const parsed = bookingMetadataSchema.safeParse(metadata);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Booking failed',
      });
    }

    // เตรียมค่าเริ่มต้น (กรณีจ่ายเงินสด)
    let charge: ChargeResponse = {
      id: '',
      status: 'cash',
      amount, // สมมุติรับเป็นสตางค์ให้คงเดิม
      transaction_date: null,
      payment_type: 'Cash',
    };

    // สร้าง charge ถ้าเป็นบัตรเครดิต
    try {
      if (parsed.data.isCreditCard) {
        if (!token) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields: token, amount, currency',
          });
        }

        const omiseRes: OmiseCharge = await omise.charges.create({
          amount,                   // สตางค์
          currency,                 // 'THB'
          card: token,
          description: description || 'Booking Payment',
          metadata: metadata || {},
        });

        charge = {
          id: omiseRes.id,
          status: omiseRes.status.trim().toLowerCase(),
          amount: omiseRes.amount,               // สตางค์
          transaction_date: omiseRes.paid_at,
          payment_type: 'Credit',
        };
      }
    } catch {
      // ถ้า charge ไม่สำเร็จ
      charge = {
        id: '',
        status: 'failed',
        amount,
      };
    }

    // map payment status ไปตาราง status
    let paymentStatus = 0;
    const strstatus = charge.status.toLowerCase().trim();
    const statusData = await prisma.status.findFirst({
      where: { name: strstatus },
    });

    if (!statusData) {
      const result = await prisma.status.create({
        data: {
          name: strstatus,
          type: 'payment',
        },
      });
      paymentStatus = result.id;
    } else {
      paymentStatus = statusData.id;
    }

    const data = parsed.data;

    const booking = await prisma.booking.create({
      data: {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        additional: data.additionalMessage || null,
        date_start: data.startTime,
        date_end: data.endTime,
        pet_sitter_id: data.sitterId,
        user_id: userId,
        transaction_id: charge.id || null,
        transaction_date: charge.transaction_date,
        booking_status_id: 5, // Waiting for confirm
        amount: charge.amount / 100, // แปลง "สตางค์" -> "บาท"
        payment_status_id: paymentStatus === 0 ? null : paymentStatus,
        payment_type: charge.payment_type,
        created_at: new Date(),
        booking_pet_detail: {
          create: data.petIds.map((petId: number) => ({
            pet_detail_id: petId,
          })),
        },
      },
      include: {
        booking: true,
        status_booking_payment_status_idTostatus: true,
        sitter: {
          select: { name: true, user_sitter_id: true },
        },
        booking_pet_detail: {
          include: { pet: true },
        },
      },
    });

    const bookingData = {
      ...booking,
      payment_status: booking.status_booking_payment_status_idTostatus,
      status_booking_payment_status_idTostatus: undefined,
    };

    // NOTIFICATION SYSTEM: สร้าง notification เมื่อมีการจองใหม่ booking.pet_sitter_id);
    
    try {
      const { notifyPaymentSuccess } = await import('@/lib/notifications/pet-sitter-notifications');
      
      // แจ้ง sitter ว่ามีการจองใหม่

      // ใช้ user_sitter_id จาก sitter table
      const userSitterId = booking.sitter.user_sitter_id;
      const sitterUserId = userSitterId || booking.pet_sitter_id;
      await createNotification({
        userId: sitterUserId,
        type: 'booking',
        title: 'New Booking Request! 🐕',
        message: `${booking.booking.name || 'Customer'} wants to book your pet sitting service for ${booking.booking_pet_detail.map((pd: unknown) => (pd as { pet: { name: string } }).pet.name).join(', ')} on ${new Date(booking.date_start).toLocaleDateString('th-TH')}`,
      });
      
      // แจ้ง user ที่จองว่าการจองสำเร็จ
      await createNotification({
        userId: booking.user_id,
        type: 'booking',
        title: 'Booking Submitted! 📝',
        message: `Your booking request has been submitted successfully. We'll notify you when the sitter responds.`,
      });
      
      
      // แจ้ง customer ว่าชำระเงินสำเร็จ
      await notifyPaymentSuccess(
        booking.user_id,
        Number(booking.amount),
        new Date(booking.date_start).toLocaleDateString('th-TH')
      );
      
      
      // Trigger real-time update for frontend
      try {
        // ส่ง event เพื่อให้ frontend อัปเดต notification
        // Trigger real-time notification update
        
      } catch {
        // Real-time update failed silently
      }
    } catch {
      // Notification creation failed silently
      // ไม่ throw error เพื่อไม่ให้กระทบการจอง - notification เป็น secondary feature
    }

    return res.status(200).json({
      success: true,
      charge,
      booking: bookingData,
    });
  } catch (err: unknown) {
    // ทำให้ type-safe
    const error = err as { message?: string };
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error?.message,
    });
  }
}