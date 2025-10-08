import { useState } from "react"
import { RegisterForm } from "@/types/register.types"
import { useRegisterForm } from "./useRegisterForm"
import { useRegisterRole } from "./useRegisterRole"
import { useRegisterApi } from "./useRegisterApi"

// รวม logic เรียกใช้ hook ย่อยทั้งหมด
export function useRegister() {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const { form, error, setError, handleChange, handlePhoneChange, validateForm } =
        useRegisterForm()

    const { role, handleChangeRole } = useRegisterRole(setError)
    const { saveData, addRole } = useRegisterApi(form, setError)

    const saveOwnerData = (newErrors: RegisterForm, role_ids: number[]) => {
        if (Object.values(newErrors).every((val) => val === "")) {
            saveData(role_ids)
        } else {
            setError(newErrors)
        }
    }

    const handleOnConfirm = async () => {
        await addRole()
        setIsOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const newErrors = await validateForm(role)

        if (form.email.trim() && role === 3) {
            if (!newErrors.email) {
                saveOwnerData(newErrors, [2, 3])
            } else if (newErrors.email && newErrors.email !== "Conflict") {
                setIsOpen(true)
            } else {
                setError(newErrors)
            }
        } else {
            saveOwnerData(newErrors, [2])
        }

        setIsLoading(false)
    }

    return {
        form,
        error,
        role,
        isLoading,
        isOpen,
        setIsOpen,
        handleChange,
        handlePhoneChange,
        handleSubmit,
        handleChangeRole,
        handleOnConfirm,
    }
}
