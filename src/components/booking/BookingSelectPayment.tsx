import { useBookingForm } from "@/hooks/useBookingForm"
import InputText from "../input/InputText";

export default function BookingSelectPayment() {
    const {
        form,
        error,
        handleChange,
        handlePhoneChange,
    } = useBookingForm();

    return (
        <div>
            <span className="font-[700] text-[24px] text-gray-9">
                Credit Card
            </span>
            <form className="mt-6 space-y-6">
                {/* Name */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <InputText
                            label="Card Number*"
                            id="cardNumber"
                            name="cardNumber"
                            value={form.cardNumber}
                            placeholder="xxx-xxxx-x-xx-xx"
                            type="number"
                            variant={!error.cardNumber ? "default" : "error"}
                            inputMode="numeric"
                            onChange={handleChange}
                            errorText={error.cardNumber}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
                            errorText={error.expiryDate}
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
                            onChange={handlePhoneChange}
                            errorText={error.cvc}
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}