import { cardNameRegex, checkEmailRegex, checkPhoneRegex, validateEmail, validatePhone } from "@/lib/validators/validation"
import { BookingForm } from "@/types/booking.types"
import { useCallback, useState } from "react"

// ✅ Credit Card Validation Functions
const isValidLuhn = (cardNumber: string): boolean => {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

const validateCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');

    if (!cleaned) {
        return "Card number is required";
    }

    if (!/^\d+$/.test(cleaned)) {
        return "Card number must contain only numbers";
    }

    if (cleaned.length < 13 || cleaned.length > 19) {
        return "Card number must be between 13-19 digits";
    }

    if (!isValidLuhn(cleaned)) {
        return "Invalid card number";
    }

    return "";
};

const validateCardName = (value: string): string => {
    const trimmed = value.trim();

    if (!trimmed) {
        return "Card owner name is required";
    }

    if (trimmed.length < 2) {
        return "Name must be at least 2 characters";
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
        return "Name must contain only letters";
    }

    return "";
};

const validateExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
        return "Expiry date is required";
    }

    if (cleaned.length !== 6) {
        return "Invalid expiry date format (MM/YYYY)";
    }

    const month = parseInt(cleaned.substring(0, 2));
    const year = parseInt(cleaned.substring(2, 6));

    if (month < 1 || month > 12) {
        return "Invalid month (01-12)";
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return "Card has expired";
    }

    if (year > currentYear + 20) {
        return "Expiry date too far in the future";
    }

    return "";
};

const validateCVC = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
        return "CVC is required";
    }

    if (!/^\d{3,4}$/.test(cleaned)) {
        return "CVC must be 3 or 4 digits";
    }

    return "";
};

// ✅ Formatting Functions
const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
};

const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}`;
    }
    return cleaned;
};

const formatCVC = (value: string): string => {
    return value.replace(/\D/g, '').substring(0, 4);
};

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

    const [touched, setTouched] = useState<Record<keyof BookingForm, boolean>>({
        name: false,
        email: false,
        phone: false,
        addition: false,
        cardNumber: false,
        cardName: false,
        expiryDate: false,
        cvc: false,
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

    // ✅ Credit Card Handlers with Auto-formatting
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.replace(/\s/g, '').length <= 19) {
            handleChange({
                ...e,
                target: { ...e.target, name: "cardNumber", value: formatted },
            })

            // // Validate if touched
            // if (touched.cardNumber) {
            //     setError((prev) => ({
            //         ...prev,
            //         cardNumber: validateCardNumber(formatted),
            //     }))
            // }
        }
    }

    const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only letters and spaces
        if (cardNameRegex.test(value)) {
            handleChange(e);

            if (touched.cardName) {
                setError((prev) => ({
                    ...prev,
                    cardName: validateCardName(value),
                }))
            }
        }
    }

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        handleChange({
            ...e,
            target: { ...e.target, name: "expiryDate", value: formatted },
        })

        if (touched.expiryDate) {
            setError((prev) => ({
                ...prev,
                expiryDate: validateExpiryDate(formatted),
            }))
        }
    }

    const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCVC(e.target.value);
        handleChange({
            ...e,
            target: { ...e.target, name: "cvc", value: formatted },
        })

        if (touched.cvc) {
            setError((prev) => ({
                ...prev,
                cvc: validateCVC(formatted),
            }))
        }
    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target
        console.log(name, value);
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // ✅ Handle blur for validation
    // const validateInformatiionFrom = (field: keyof BookingForm) => {

    //     // Validate on blur
    //     let fieldError = "";
    //     switch (field) {
    //         case "cardNumber":
    //             fieldError = validateCardNumber(form.cardNumber);
    //             break;
    //         case "cardName":
    //             fieldError = validateCardName(form.cardName);
    //             break;
    //         case "expiryDate":
    //             fieldError = validateExpiryDate(form.expiryDate);
    //             break;
    //         case "cvc":
    //             fieldError = validateCVC(form.cvc);
    //             break;
    //     }

    //     setError((prev) => ({ ...prev, [field]: fieldError }))
    // }

    const validateInformatiionFrom = (): BookingForm => {
        const checkMail = checkEmailRegex(form.email)
        const checkPhone = checkPhoneRegex(form.phone)

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

    // ✅ Validate entire form
    // const validateForm = async (role: number): Promise<BookingForm> => {
    //     const checkMail = await validateEmail(form.email, role, true)
    //     const checkPhone = await validatePhone(form.phone)

    //     // Mark all fields as touched
    //     setTouched({
    //         name: true,
    //         email: true,
    //         phone: true,
    //         addition: true,
    //         cardNumber: true,
    //         cardName: true,
    //         expiryDate: true,
    //         cvc: true,
    //     })

    //     const errors = {
    //         name: form.name.trim() ? "" : "Name is required",
    //         email: checkMail.message || "",
    //         phone: checkPhone.message || "",
    //         addition: "", // Optional field
    //         cardNumber: validateCardNumber(form.cardNumber),
    //         cardName: validateCardName(form.cardName),
    //         expiryDate: validateExpiryDate(form.expiryDate),
    //         cvc: validateCVC(form.cvc),
    //     }

    //     setError(errors)
    //     return errors
    // }

    // ✅ Check if form has errors
    const hasErrors = (): boolean => {
        return Object.values(error).some(err => err !== "")
    }

    return {
        form,
        setForm,
        error,
        setError,
        touched,
        handleChange,
        handlePhoneChange,
        handleCardNumberChange,
        handleCardNameChange,
        handleExpiryDateChange,
        handleCVCChange,
        handleTextAreaChange,
        validateInformatiionFrom,
        // validateForm,
        hasErrors,
    }
}