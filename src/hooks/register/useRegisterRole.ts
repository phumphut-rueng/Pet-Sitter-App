import { useState } from "react"
import { RegisterForm } from "@/types/register.types"

// จัดการ role (Owner / Sitter)
export function useRegisterRole(setError: (err: RegisterForm) => void) {
    const [role, setRole] = useState<number>(2) // 2 = owner, 3 = sitter

    const handleChangeRole = (roleId: number) => {
        setRole(roleId)
        setError({ name: "", email: "", phone: "", password: "" })
    }

    return { role, handleChangeRole }
}
