import { useState, useCallback } from "react"
import { RegisterForm } from "@/types/register.type"
import { validateEmail, validatePhone, validatePassword } from "@/utils/validate-register"

// จัดการฟอร์ม + validation
export function useRegisterForm() {
    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        phone: "",
        password: "",
    })

    const [error, setError] = useState<RegisterForm>({
        name: "",
        email: "",
        phone: "",
        password: "",
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
        const checkPassword = await validatePassword(form.password)

        return {
            name: "",
            email: checkMail.message || "",
            phone: checkPhone.message || "",
            password: checkPassword.message || "",
        }
    }

    return { form, setForm, error, setError, handleChange, handlePhoneChange, validateForm }
}
