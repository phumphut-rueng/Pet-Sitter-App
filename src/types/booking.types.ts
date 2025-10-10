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

export interface bookingData {
    token: string;
    amount: number;
    currency: string;
    description: string;
    metadata: {
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