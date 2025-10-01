// hooks/useLoginApi.ts
import { signIn } from "next-auth/react";

export function useLoginApi() {
    const login = async (
        email: string,
        password: string,
        rememberMe: boolean
    ) => {
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                return { success: false, message: "Login failed. Please check your credentials." };
            }

            if (result?.ok) {
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }
                return { success: true, message: "" };
            }

            return { success: false, message: "Unexpected error occurred." };
        } catch {
            return { success: false, message: "Login failed. Please check your credentials." };
        }
    };

    return { login };
}
