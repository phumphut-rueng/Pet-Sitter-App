import { useCallback, useState } from "react"
import { ResetPasswordForm } from "@/types/register.types"
import axios from "axios";
import { validateEmail } from "@/lib/validators/validation";

// Initial state helper
const createEmptyForm = (): ResetPasswordForm => ({
    password: "",
    confirmPassword: "",
})

// รวม logic เรียกใช้ hook ย่อยทั้งหมด
export function useForgotPassword() {
    const [form, setForm] = useState<ResetPasswordForm>(createEmptyForm())
    const [error, setError] = useState<ResetPasswordForm>(createEmptyForm())

    const [isLoading, setIsLoading] = useState(false)
    const [errorToken, setErrorToken] = useState("")

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            setForm((prev) => ({ ...prev, [name]: value }))
        },
        []
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)
        setErrorToken("")
        const err = await validateForm()

        if (Object.values(err).every((val) => val === "")) {
            try {
                const res = await axios.post("/api/auth/forgot-password", { email: form.email })
                setErrorToken(res.data.message)
            } catch {
                setErrorToken("Something went wrong.")
            } finally {
                setIsLoading(false)
            }
        } else {
            setError(err)
            setIsLoading(false)
        }
    }

    const validateForm = async () => {
        const checkMail = await validateEmail(form.email || "")

        return {
            email: checkMail.message || "",
        }
    }

    return {
        form,
        error,
        errorToken,
        isLoading,
        handleChange,
        handleSubmit,
    }
}
