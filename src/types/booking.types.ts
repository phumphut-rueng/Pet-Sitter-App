import { pet, status } from "@prisma/client";
import { Sitter } from "./sitter.types";

export interface BookingForm {
    name: string;
    email: string;
    phone: string;
    addition: string;
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvc: string;
}

export interface paymentData {
    token: string;
    amount: number;
    currency: string;
    description: string;
    metadata: {
        isCreditCard: boolean,
        sitterId: number | undefined;
        petIds: string;
        startTime: string | string[] | undefined;
        endTime: string | string[] | undefined;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        additionalMessage: string;
    };
}

export interface bookingData {
    id: number;
    user_id: number;
    pet_sitter_id: number;
    name: string;
    email: string;
    phone: string;
    date_start: string;
    date_end: string;
    amount: number;
    booking_status: number;
    payment_status_id: number;
    transaction_id: string | null;
    transaction_date: string | null;
    additional: string | null;
    created_at: string;
    updated_at: string;
    sitter: Sitter;
    payment_status: status;
    booking_pet_detail: pet;
}