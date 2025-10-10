import { bookingData } from "./booking.types";

// types/omise.d.ts
export interface OmiseCard {
    name: string;
    number: string;
    expiration_month: string;
    expiration_year: string;
    security_code: string;
}

export interface OmiseTokenResponse {
    object: 'token';  // เปลี่ยนจาก string เป็น 'token'
    id: string;

    success: boolean;
    charge?: object;
    message?: string;
    error?: string;

    amount: number;
    livemode: boolean;
    location: string;
    used: boolean;
    card: {
        object: string;
        id: string;
        livemode: boolean;
        brand: string;
        expiration_month: number;
        expiration_year: number;
        last_digits: string;
        name: string;
    };
    created: string;
    booking: bookingData
}

export interface OmiseErrorResponse {
    object: 'error';
    location: string;
    code: string;
    message: string;
}

export interface Omise {
    setPublicKey(key: string): void;
    createToken(
        type: 'card',
        card: OmiseCard,
        callback: (
            statusCode: number,
            response: OmiseTokenResponse | OmiseErrorResponse
        ) => void
    ): void;
}

declare global {
    interface Window {
        Omise: Omise;
    }
}

export { };