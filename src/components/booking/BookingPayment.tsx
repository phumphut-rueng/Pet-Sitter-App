import { useBookingForm } from "@/hooks/useBookingForm"
import InputText from "../input/InputText";
import { FormEvent } from "react";
import { BookingForm } from "@/types/booking.types";

export default function BookingSelectPayment(
    {
        form,
        error,
        handleSubmit,
        handleCardNumberChange,
        handleCardNameChange,
        handleExpiryDateChange,
        handleCVCChange,
    }: {
        form: BookingForm
        error: BookingForm
        handleSubmit: (e: FormEvent<Element>) => void

        handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleCardNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleExpiryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleCVCChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }) {

    return (
        <div >
            <span className="font-[700] text-[24px] text-gray-9">
                Credit Card
            </span>
            <form
                className="mt-6 space-y-6"
                onSubmit={handleSubmit}
                autoComplete="off"
                name="fakeForm">
                {/* Name */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <InputText
                            label="Card Number*"
                            id="cardNumber"
                            name="cardNumber"
                            value={form.cardNumber}
                            placeholder="xxx-xxxx-x-xx-xx"
                            type="text"
                            variant={!error.cardNumber ? "default" : "error"}
                            inputMode="numeric"
                            onChange={handleCardNumberChange}
                            errorText={error.cardNumber}
                            maxLength={19}
                        />
                    </div>
                    <div className="flex-1">
                        <InputText
                            label="Card Owner*"
                            id="cardName"
                            name="cardName"
                            value={form.cardName}
                            placeholder="Card owner name"
                            type="text"
                            variant={!error.cardName ? "default" : "error"}
                            onChange={handleCardNameChange}
                            errorText={error.cardName}
                        />
                    </div>
                </div>

                {/* Email + Phone */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <InputText
                            label="Expiry Date*"
                            id="expiryDate"
                            name="expiryDate"
                            value={form.expiryDate}
                            placeholder="xxx-xxx-xxxx"
                            type="text"
                            variant={!error.expiryDate ? "default" : "error"}
                            inputMode="numeric"
                            onChange={handleExpiryDateChange}
                            errorText={error.expiryDate}
                            maxLength={7}
                        />
                    </div>
                    <div className="flex-1">
                        <InputText
                            label="CVC/CVV*"
                            id="cvc"
                            name="cvc"
                            value={form.cvc}
                            placeholder="xxx"
                            type="number"
                            variant={!error.cvc ? "default" : "error"}
                            inputMode="numeric"
                            onChange={handleCVCChange}
                            errorText={error.cvc}
                            maxLength={4}
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}