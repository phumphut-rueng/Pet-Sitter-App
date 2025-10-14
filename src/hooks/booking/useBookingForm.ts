import { cardNameRegex, formatCardNumber, formatCVC, formatEmail, formatExpiryDate, formatPhone, numRegex, validateCardNumber, validateCVC, validateExpiryDate } from "@/lib/validators/validation"
import { BookingForm } from "@/types/booking.types"
import { useCallback, useEffect, useState } from "react"

// Initial state helper
const createEmptyForm = (defaults?: Partial<BookingForm>): BookingForm => ({
    name: defaults?.name || "",
    email: defaults?.email || "",
    phone: defaults?.phone || "",
    addition: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
})

export function useBookingForm(initialValues?: Partial<BookingForm>) {
    const [form, setForm] = useState<BookingForm>(createEmptyForm(initialValues))
    const [error, setError] = useState<BookingForm>(createEmptyForm())

    const updateField = useCallback((name: keyof BookingForm, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }))
    }, [])

    useEffect(() => {
        if (initialValues?.name || initialValues?.email) {
            setForm(prev => ({
                ...prev,
                name: initialValues.name || prev.name,
                email: initialValues.email || prev.email,
            }))
        }
    }, [initialValues?.name, initialValues?.email])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateField(e.target.name as keyof BookingForm, e.target.value)
    }, [updateField])

    const handleTextAreaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateField(e.target.name as keyof BookingForm, e.target.value)
    }, [updateField])

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyNums = e.target.value.replace(numRegex, "")
        if (onlyNums.length <= 10) {
            updateField("phone", onlyNums)
        }
    }, [updateField])

    const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value.replace(numRegex, ""))
        if (formatted.replace(/\s/g, '').length <= 19) {
            updateField("cardNumber", formatted)
        }
    }, [updateField])

    const handleCardNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (cardNameRegex.test(e.target.value)) {
            updateField("cardName", e.target.value)
        }
    }, [updateField])

    const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateField("expiryDate", formatExpiryDate(e.target.value))
    }, [updateField])

    const handleCVCChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateField("cvc", formatCVC(e.target.value))
    }, [updateField])

    const validateInformationForm = (): BookingForm => {
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

    const validatePaymentForm = (): BookingForm => {
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
        validateInformationForm,
        validatePaymentForm,
        hasErrors,
    }
}