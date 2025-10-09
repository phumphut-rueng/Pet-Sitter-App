import { cardNameRegex, formatCardNumber, formatCVC, formatEmail, formatExpiryDate, formatPhone, numRegex, validateCardNumber, validateCVC, validateExpiryDate } from "@/lib/validators/validation"
import { BookingForm } from "@/types/booking.types"
import { useCallback, useState } from "react"


export function useBookingForm() {
    const [form, setForm] = useState<BookingForm>({
        name: "",
        email: "",
        phone: "",
        addition: "",
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvc: "",
    })

    const [error, setError] = useState<BookingForm>({
        name: "",
        email: "",
        phone: "",
        addition: "",
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvc: "",
    })

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            setForm((prev) => ({ ...prev, [name]: value }))
        },
        []
    )

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyNums = e.target.value.replace(numRegex, "")
        if (onlyNums.length <= 10) {
            handleChange({
                ...e,
                target: { ...e.target, name: "phone", value: onlyNums },
            })
        }
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value.replace(numRegex, ""));
        if (formatted.replace(/\s/g, '').length <= 19) {
            handleChange({
                ...e,
                target: { ...e.target, name: "cardNumber", value: formatted },
            })
        }
    }

    const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (cardNameRegex.test(value)) {
            handleChange(e);
        }
    }

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        handleChange({
            ...e,
            target: { ...e.target, name: "expiryDate", value: formatted },
        })
    }

    const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCVC(e.target.value);
        handleChange({
            ...e,
            target: { ...e.target, name: "cvc", value: formatted },
        })
    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target
        console.log(name, value);
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const validateInformationFrom = (): BookingForm => {
        const checkMail = formatEmail(form.email)
        const checkPhone = formatPhone(form.phone)

        const errors: BookingForm = {
            name: form.name.trim() ? "" : "Name is required",
            email: checkMail.message || "",
            phone: checkPhone.message || "",
            addition: "",
            cardNumber: error.cardNumber,
            cardName: error.cardName,
            expiryDate: error.expiryDate,
            cvc: error.cvc,
        }

        setError(errors)
        return errors
    }

    const validatePaymentFrom = (): BookingForm => {
        const checkCardNumber = validateCardNumber(form.cardNumber)
        const checkExpiryDate = validateExpiryDate(form.expiryDate)
        const checkCvc = validateCVC(form.cvc)

        const errors: BookingForm = {
            name: error.name,
            email: error.email,
            phone: error.phone,
            addition: "",
            cardNumber: checkCardNumber.message || "",
            cardName: form.cardName.trim() ? "" : "Card Owner is required",
            expiryDate: checkExpiryDate.message || "",
            cvc: checkCvc.message || "",
        }

        setError(errors)
        return errors
    }

    // ✅ Check if form has errors
    const hasErrors = (): boolean => {
        return Object.values(error).some(err => err !== "")
    }

    return {
        form,
        setForm,
        error,
        setError,
        handleChange,
        handlePhoneChange,
        handleCardNumberChange,
        handleCardNameChange,
        handleExpiryDateChange,
        handleCVCChange,
        handleTextAreaChange,
        validateInformationFrom,
        validatePaymentFrom,
        hasErrors,
    }
}