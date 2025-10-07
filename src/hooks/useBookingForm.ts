import { validateEmail, validatePhone } from "@/lib/validators/validation"
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
        const onlyNums = e.target.value.replace(/\D/g, "")
        if (onlyNums.length <= 10) {
            handleChange({
                ...e,
                target: { ...e.target, name: "phone", value: onlyNums },
            })
        }
    }

    const validateForm = async (role: number) => {
        const checkMail = await validateEmail(form.email, role, true)
        const checkPhone = await validatePhone(form.phone)

        return {
            name: "",
            email: checkMail.message || "",
            phone: checkPhone.message || "",
        }
    }

    return {
        form,
        setForm,
        error,
        setError,
        handleChange,
        handlePhoneChange,
        validateForm
    }
}
