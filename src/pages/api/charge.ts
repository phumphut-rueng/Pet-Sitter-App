import { prisma } from '@/lib/prisma/prisma';
import { bookingMetadataSchema } from '@/lib/validators/booking';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import Omise from 'omise';
import { authOptions } from './auth/[...nextauth]';

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
          select: { name: true },
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
