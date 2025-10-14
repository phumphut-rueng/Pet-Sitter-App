import InputText from "../input/InputText";
import { Dispatch, FormEvent, SetStateAction } from "react";
import { BookingForm } from "@/types/booking.types";
import CashButton from "../buttons/CashButton";
import { CreditCard, Wallet } from "lucide-react";
import Image from "next/image";

export default function BookingPayment(
    {
        form,
        error,
        isCreditCard,
        setIsCreditCard,
        handleSubmit,
        handleCardNumberChange,
        handleCardNameChange,
        handleExpiryDateChange,
        handleCVCChange,
    }: {
        form: BookingForm
        error: BookingForm
        isCreditCard: boolean
        setIsCreditCard: Dispatch<SetStateAction<boolean>>
        handleSubmit: (e: FormEvent<Element>) => void

        handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleCardNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleExpiryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        handleCVCChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }) {

    return (
        <div>
            <div className="flex justify-center gap-5">
                <CashButton
                    text="Credit Card"
                    icon={<CreditCard />}
                    onClick={() => setIsCreditCard(true)}
                    selected={isCreditCard}
                />
                <CashButton
                    text="Cash"
                    icon={<Wallet />}
                    onClick={() => setIsCreditCard(false)}
                    selected={!isCreditCard}
                />
            </div>
            {isCreditCard
                ? <div >
                    {/* <span className="font-[700] text-[24px] text-gray-9">
                    Credit Card
                </span> */}
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
                                    autoComplete="off"
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
                                    autoComplete="off"
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
                                    placeholder="xx/xx"
                                    type="text"
                                    variant={!error.expiryDate ? "default" : "error"}
                                    inputMode="numeric"
                                    onChange={handleExpiryDateChange}
                                    errorText={error.expiryDate}
                                    maxLength={5}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex-1">
                                <InputText
                                    label="CVC/CVV*"
                                    id="cvc"
                                    name="cvc"
                                    value={form.cvc}
                                    placeholder="xxx"
                                    type="text"
                                    variant={!error.cvc ? "default" : "error"}
                                    inputMode="numeric"
                                    onChange={handleCVCChange}
                                    errorText={error.cvc}
                                    maxLength={4}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </form>
                </div >
                : <div className="flex flex-col justify-center items-center bg-gray-1 p-10 rounded-2xl gap-3 mt-6">
                    <Image
                        src="/icons/PinkPaw.svg"
                        width={239}
                        height={350}
                        alt="cash"
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                    />
                    <p className="text-center text-[16px] text-gray-9">
                        If you want to pay by cash,<br />
                        you are required to make a cash payment<br />
                        upon arrival at the pet sitter`&apos;`s location.
                    </p>
                </div>
            }
        </div>
    )
}