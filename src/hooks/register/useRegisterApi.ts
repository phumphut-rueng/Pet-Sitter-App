import axios from "axios"
import { RegisterForm } from "@/types/register.types"
import { useRouter } from "next/router"

// รวม API (register, addRole)
export function useRegisterApi(form: RegisterForm, setError: (err: RegisterForm) => void) {
    const router = useRouter()

    const clearData = () => {
        setError({ name: "", email: "", phone: "", password: "" })
        router.push("/auth/login")
    }

    const saveData = async (role_ids: number[]) => {
        let result;
        try {
            result = await axios.post(
                "/api/auth/register",
                {
                    ...form,
                    role_ids
                }
            );

            if (result?.status === 201) {
                clearData();
            }
        } catch (e) {
            console.error("axios.register", e);
        }
    }

    const addRole = async () => {
        try {
            const result = await axios.post("/api/user/post-role", {
                ...form,
                role_ids: 3,
            })
            if (result?.status === 201) {
                clearData()
            }
        } catch (e) {
            console.error("axios.post-role", e)
        }
    }

    return { saveData, addRole }
}
