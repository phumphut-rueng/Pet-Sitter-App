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
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, unknown>;
};

type ChargeResponse = {
    id: string,
    status: string,
    amount: number,
    transaction_date?: string | null,
    payment_type?: string | null,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
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
        if (!amount || !currency) {
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
            status: "cash",
            amount: amount,
            transaction_date: null,
            payment_type: "Cash"
        };


        try {
            if (parsed.data.isCreditCard) {
                if (!token) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: token, amount, currency',
                    });
                } else {
                    const res = await omise.charges.create({
                        amount: amount, // จำนวนเงินในสตางค์
                        currency: currency, // THB
                        card: token,
                        description: description || 'Booking Payment',
                        metadata: metadata || {},
                    });

                    charge = {
                        id: res.id,
                        status: res.status.trim().toLowerCase(),
                        amount: res.amount,
                        transaction_date: res.paid_at,
                        payment_type: "Credit",
                    }
                }
            }
        } catch {
            charge = {
                id: "",
                status: "failed",
                amount: amount
            }
        }

        // Check charge status ว่ามีใน db หรือยัง
        let paymentStatus = 0
        const strstatus = charge.status.toLowerCase().trim()
        const statusData = await prisma.status.findFirst({
            where: { name: strstatus }
        })

        if (!statusData) {
            const result = await prisma.status.create({
                data: {
                    name: strstatus,
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
                transaction_id: charge.id || null,
                transaction_date: charge.transaction_date,
                booking_status_id: 5, //Waiting for confirm
                amount: charge.amount / 100,
                payment_status_id: paymentStatus == 0 ? null : paymentStatus,
                payment_type: charge.payment_type,
                created_at: new Date(),
                booking_pet_detail: {
                    create: data.petIds.map((petId) => ({
                        pet_detail_id: petId,
                    })),
                },
            },
            // ดึงข้อมูลที่ join
            include: {
                booking: true,
                status_booking_payment_status_idTostatus: true,
                sitter: {
                    select: {
                        name: true
                    }
                },
                booking_pet_detail: {
                    include: {
                        pet: true,
                    },
                },
            },
        });

        const bookingData = {
            ...booking,
            payment_status: booking.status_booking_payment_status_idTostatus,
            // ลบ field เดิมออก
            status_booking_payment_status_idTostatus: undefined,
        };

        return res.status(200).json({
            success: true,
            charge: charge,
            booking: bookingData
        });
    } catch (error: any) {
        console.error('Booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message 
        });
    }
}