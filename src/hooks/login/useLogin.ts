// hooks/useLogin.ts
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useLoginForm } from "./useLoginForm";
import { useLoginApi } from "./useLoginApi";

export function useLogin() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        emailError,
        passwordError,
        loginError,
        setLoginError,
        validate,
    } = useLoginForm();

    const { login } = useLoginApi();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { emailValid, passwordValid } = await validate();
        if (!emailValid || !passwordValid) return;

        const result = await login(email, password, rememberMe);
        if (!result.success) {
            setLoginError(result.message);
            return;
        }

        router.push("/");
    };

    // redirect if already logged in
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            router.push("/");
        }
    }, [status, session, router]);

    return {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        emailError,
        passwordError,
        loginError,
        status,
        handleSubmit,
    };
}
