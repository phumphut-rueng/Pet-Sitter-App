import { useCallback, useEffect, useState } from "react"
import { ResetPasswordForm } from "@/types/register.types"
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import axios from "axios";
import { validatePassword } from "@/lib/validators/validation";

// Initial state helper
const createEmptyForm = (): ResetPasswordForm => ({
    password: "",
    confirmPassword: "",
})

// รวม logic เรียกใช้ hook ย่อยทั้งหมด
export function useResetPassword() {
    const [form, setForm] = useState<ResetPasswordForm>(createEmptyForm())
    const [error, setError] = useState<ResetPasswordForm>(createEmptyForm())

    const params = useSearchParams();
    const router = useRouter()
    const token: string = params?.get("token") || "";

    // const [password, setPassword] = useState("")
    // const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorToken, setErrorToken] = useState("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setErrorToken("Invalid or missing token.")
        } else {
            setErrorToken("")
        }
    }, [token])

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target
            setForm((prev) => ({ ...prev, [name]: value }))
        },
        []
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return
        if (form.password !== form.confirmPassword) {
            setErrorToken("Passwords do not match.")
            return
        }

        setIsLoading(true)
        setErrorToken("")
        const err = validateForm()

        if (Object.values(err).every((val) => val === "")) {
            try {
                await axios.post("/api/auth/reset-password-user",
                    {
                        token,
                        password: form.password
                    })
                setSuccess(true)
                setTimeout(() => router.push("/auth/login"), 2500)
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

    const validateForm = () => {
        const checkPassword = validatePassword(form.password || "")
        const checkConfirmPassword = validatePassword(form.confirmPassword || "")

        return {
            password: checkPassword.message || "",
            confirmPassword: checkConfirmPassword.message || "",
        }
    }

    return {
        form,
        error,
        errorToken,
        success,
        isLoading,
        handleChange,
        handleSubmit,
    }
}
