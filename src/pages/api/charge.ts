import { prisma } from '@/lib/prisma/prisma';
import { bookingMetadataSchema } from '@/lib/validators/booking';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import Omise from 'omise';
import { authOptions } from './auth/[...nextauth]';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

const omise = Omise({
    secretKey: process.env.OMISE_SECRET_KEY!,
});

type ChargeRequest = {
    token: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
};

type ChargeResponse = {
    id: string,
    status: string,
    amount: number,
    payment_date?: string | null,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).end(`Method ${req.method} not allowed`);
    }

    const session = await getServerSession(req, res, authOptions);
    const userIdStr = session?.user?.id;
    if (!userIdStr) return res.status(401).json({
        message: "Unauthorized"
    });

    const userId = Number(userIdStr);
    if (!Number.isFinite(userId)) return res.status(400).json({
        message: "Invalid user id"
    });

    try {
        const { token, amount, currency, description, metadata }: ChargeRequest = req.body;

        // Validate input
        if (!token || !amount || !currency) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: token, amount, currency',
            });
        }

        //check data
        const parsed = bookingMetadataSchema.safeParse(metadata);
        if (!parsed.success) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'Booking failed',
                });
        }

        // Create charge
        let charge: ChargeResponse = {
            id: "",
            status: "",
            amount: 0,
            payment_date: null
        };
        //ปิดเพื่อเทส
        // try {
        //     const res = await omise.charges.create({
        //         amount: amount, // จำนวนเงินในสตางค์
        //         currency: currency, // THB
        //         card: token,
        //         description: description || 'Booking Payment',
        //         metadata: metadata || {},
        //     });

        //     charge = {
        //         id: res.id,
        //         status: res.status.trim().toLowerCase(),
        //         amount: res.amount,
        //         payment_date: res.paid_at
        //     }
        // } catch {
        charge = {
            id: "",
            status: "failed",
            amount: amount
        }
        // }

        // Check charge status ว่ามีใน db หรือยัง
        let paymentStatus = 0
        const statusData = await prisma.status.findFirst({
            where: { name: charge.status }
        })

        if (!statusData) {
            const result = await prisma.status.create({
                data: {
                    name: charge.status,
                    type: "payment"
                }
            })
            paymentStatus = result.id
        } else {
            paymentStatus = statusData.id
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
                payment_id: charge.id || null,
                payment_date: charge.payment_date,
                booking_status: 5, //Waiting for confirm
                amount: charge.amount,
                payment_status_id: paymentStatus,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        await prisma.booking_pet_detail.createMany({
            data: data.petIds.map((petId) => ({
                booking_id: booking.id,
                pet_detail_id: petId,
            })),
        });

        return res.status(200).json({
            success: true,
            charge: charge,
            booking: booking
        });
    } catch (error: any) {
        console.error('Booking error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed',
            error: error.toString(),
        });
    }
}